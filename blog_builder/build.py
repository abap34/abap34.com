"""ブログビルドシステム - メインモジュール"""

import json
import logging
import math
import os
import pathlib
import re
import subprocess
import sys
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple

try:
    import tqdm
    HAS_TQDM = True
except ImportError:
    HAS_TQDM = False

try:
    import requests
    from bs4 import BeautifulSoup
    HAS_WEB_DEPS = True
except ImportError:
    HAS_WEB_DEPS = False

# Configure logging with clear screen support
import os

logging.basicConfig(
    level=logging.INFO, 
    format="%(asctime)s [%(levelname)8s] %(message)s",
    datefmt="%H:%M:%S"
)
logger = logging.getLogger(__name__)

# Configure specific loggers to reduce noise
logging.getLogger("requests").setLevel(logging.WARNING)
logging.getLogger("urllib3").setLevel(logging.WARNING)


class BuildError(Exception):
    """ビルド処理エラー"""
    pass


@dataclass
class BlogPost:
    """ブログ記事を表すデータクラス"""

    title: str
    post_date: str
    url: str
    thumbnail_url: str
    content: str
    tags: List[str]
    featured: bool = False
    external: bool = False


class BlogConfig:
    """ブログ設定を管理するクラス"""

    CONFIG_MAPPING = {
        "overall_theme": "-t",
        "custom_css": "-c",
        "editor_theme": "-e",
        "syntax_theme": "-s",
        "template": "-b",
    }

    def __init__(self, config_data: Dict[str, Any]):
        self.data = config_data

    def get_almo_args(self) -> List[str]:
        """almoコマンドの引数を生成"""
        args = []
        for key, flag in self.CONFIG_MAPPING.items():
            if key in self.data:
                args.extend([flag, str(self.data[key])])
        return args


class FileManager:
    """ファイル操作を管理するクラス"""

    POSTS_JSON_PATH = pathlib.Path("public/posts.json")
    EXTERNAL_ARTICLES_PATH = pathlib.Path("config/external_articles.json")
    CONFIG_PATH = pathlib.Path("config/config.json")
    CHANGED_FILES_PATH = pathlib.Path("changed_files.json")

    @staticmethod
    def load_json(path: pathlib.Path) -> Dict[str, Any]:
        """JSONファイルを読み込み"""
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except FileNotFoundError:
            logger.warning(f"File not found: {path}")
            return {}
        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error in {path}: {e}")
            return {}
        except PermissionError:
            logger.error(f"Permission denied reading {path}")
            return {}
        except Exception as e:
            logger.error(f"Unexpected error reading {path}: {e}")
            return {}

    @staticmethod
    def save_json(path: pathlib.Path, data: Any) -> bool:
        """JSONファイルに保存"""
        try:
            # ディレクトリを作成
            path.parent.mkdir(parents=True, exist_ok=True)
            
            with open(path, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            return True
        except Exception as e:
            logger.error(f"Error saving JSON to {path}: {e}")
            return False

    @staticmethod
    def load_posts() -> List[Dict[str, Any]]:
        """記事一覧を読み込み"""
        return FileManager.load_json(FileManager.POSTS_JSON_PATH)

    @staticmethod
    def save_posts(posts: List[BlogPost]) -> bool:
        """記事一覧を保存"""
        logger.debug(f"Saving {len(posts)} posts to {FileManager.POSTS_JSON_PATH}")
        posts_data = [post.__dict__ for post in posts]
        return FileManager.save_json(FileManager.POSTS_JSON_PATH, posts_data)


class OGPProcessor:
    """OGP処理を管理するクラス"""

    OGP_TEMPLATE = """
<div class="responsive-card">
    <img src="{img_url}">
    <div style="margin: 0 10px 0 10px;">
         <a href="{url}"">{title}</a>
    </div>
</div>
"""

    IGNORE_PATTERNS = [
        re.compile(r"```.*?```", re.DOTALL),
        re.compile(r"`.*?`"),
        re.compile(r"<!--.*?-->"),
    ]

    @staticmethod
    def fetch_ogp(url: str) -> Tuple[str, str]:
        """URLからOGP情報を取得"""
        if not HAS_WEB_DEPS:
            logger.warning("Web dependencies not available for OGP fetching")
            return "", url
            
        try:
            res = requests.get(url, timeout=10)
            res.raise_for_status()
            soup = BeautifulSoup(res.text, "html.parser")

            ogp = soup.find("meta", attrs={"property": "og:image"})
            ogp_url = ogp["content"] if ogp and "content" in ogp.attrs else ""

            title = soup.find("title").text if soup.find("title") else url

            return ogp_url, title
        except requests.RequestException as e:
            logger.error(f"Request error fetching OGP for {url}: {e}")
            return "", url
        except Exception as e:
            logger.error(f"Error fetching OGP for {url}: {e}")
            return "", url

    @classmethod
    def replace_ogp_url(
        cls, content: str, ignore_patterns: List[re.Pattern] = None
    ) -> str:
        """コンテンツ内のOGP URLを置換"""
        if ignore_patterns is None:
            ignore_patterns = cls.IGNORE_PATTERNS

        excluded_spans = []
        for pattern in ignore_patterns:
            for match in pattern.finditer(content):
                excluded_spans.append((match.start(), match.end()))
        excluded_spans.sort(key=lambda x: x[0])

        def is_excluded(start: int, end: int) -> bool:
            for span_start, span_end in excluded_spans:
                if start >= span_start and end <= span_end:
                    return True
            return False

        ogp_pattern = re.compile(r"{@ogp\s+(.*?)\s*}")

        def replacement(match: re.Match) -> str:
            start, end = match.span()
            if is_excluded(start, end):
                return match.group(0)
            ogp_url = match.group(1)
            img_url, title = cls.fetch_ogp(ogp_url)
            return cls.OGP_TEMPLATE.format(img_url=img_url, url=ogp_url, title=title)

        return ogp_pattern.sub(replacement, content)


class ContentProcessor:
    """コンテンツ処理を管理するクラス"""

    @staticmethod
    def load_rawtext(ir: Dict[str, Any], result: str = "") -> str:
        """IRからテキストを抽出"""
        if "childs" in ir:
            for child in ir["childs"]:
                result += ContentProcessor.load_rawtext(child)
        else:
            if "content" in ir:
                result += ir["content"]
            elif ir.get("class") == "NewLine":
                result += "\n"
        return result

    @staticmethod
    def to_outputpath(article_path: pathlib.Path) -> pathlib.Path:
        """出力パスを生成"""
        return pathlib.Path("public/posts") / f"{article_path.stem}.html"

    @staticmethod
    def to_interimpath(article_path: pathlib.Path) -> pathlib.Path:
        """中間ファイルパスを生成"""
        return pathlib.Path("public/posts") / f"{article_path.stem}.md"


class ArticleBuilder:
    """記事ビルド処理を管理するクラス"""

    def __init__(self, config: BlogConfig):
        self.config = config
        self.file_manager = FileManager()
        self.content_processor = ContentProcessor()
        self.ogp_processor = OGPProcessor()

    def copy_article_assets(self, article_path: pathlib.Path) -> None:
        """記事のアセットファイルをコピー"""
        try:
            subprocess.run(
                f"cp -r posts/{article_path.stem} public/posts/", shell=True, check=True
            )
        except subprocess.CalledProcessError as e:
            logger.warning(f"Failed to copy assets for {article_path.stem}: {e}")

    def process_content(self, article_path: pathlib.Path) -> str:
        """記事コンテンツを処理"""
        content = article_path.read_text(encoding="utf-8")
        logger.debug("Processing OGP URLs...")
        content = self.ogp_processor.replace_ogp_url(content)
        logger.debug("OGP processing complete.")
        return content

    def build_with_almo(
        self, interim_path: pathlib.Path, output_path: pathlib.Path
    ) -> Dict[str, Any]:
        """Almoを使用してビルド"""
        cmd = ["almo/build/almo", str(interim_path), "-o", str(output_path), "-d"]
        cmd.extend(self.config.get_almo_args())
        cmd.extend([">", "tmp.json"])

        cmd_str = " ".join(cmd)
        logger.debug(f"Building with command: {cmd_str}")

        try:
            subprocess.run(cmd_str, shell=True, check=True)
            return self.file_manager.load_json(pathlib.Path("tmp.json"))
        except subprocess.CalledProcessError as e:
            logger.error(f"Almo build failed: {e}")
            return {}

    def extract_article_metadata(
        self, build_result: Dict[str, Any]
    ) -> Tuple[str, str, str, str, List[str], bool]:
        """ビルド結果からメタデータを抽出"""
        meta = build_result.get("meta", {})
        title = meta.get("title", "")
        date = meta.get("date", "")
        ogp_url = meta.get("ogp_url", "")
        tags_str = meta.get("tag", "[]")
        featured = meta.get("featured", False)

        # タグを処理
        if tags_str.startswith("[") and tags_str.endswith("]"):
            tags_str = tags_str[1:-1]
        tags = [tag.strip() for tag in tags_str.split(",") if tag.strip()]

        # コンテンツを抽出
        ir = build_result.get("ir", {})
        content = self.content_processor.load_rawtext(ir)

        return title, date, ogp_url, content, tags, featured

    def build_article(self, article_path: pathlib.Path) -> None:
        """単一記事をビルド"""
        output_path = self.content_processor.to_outputpath(article_path)
        interim_path = self.content_processor.to_interimpath(article_path)

        logger.info(f"Building: {article_path.stem}")

        # アセットをコピー
        self.copy_article_assets(article_path)

        # コンテンツを処理
        content = self.process_content(article_path)
        interim_path.write_text(content, encoding="utf-8")

        # Almoでビルド
        build_result = self.build_with_almo(interim_path, output_path)
        if not build_result:
            logger.error(f"Failed to build article: {article_path.stem}")
            return

        # メタデータを抽出
        title, date, ogp_url, content, tags, featured = self.extract_article_metadata(
            build_result
        )

        # 記事データを作成
        url = self.config.data["root_url"] + "/posts/" + output_path.name
        post = BlogPost(
            title=title,
            post_date=date,
            url=url,
            thumbnail_url=ogp_url,
            content=content,
            tags=tags,
            featured=featured,
        )

        # まず記事をposts.jsonに追加
        self.update_posts_json(post)

        # ナビゲーションと関連記事の情報を取得（更新されたposts.jsonから）
        all_posts_data = self.file_manager.load_posts()
        all_posts = [BlogPost(**post_data) for post_data in all_posts_data]

        logger.info(f"Total posts loaded: {len(all_posts)}")
        logger.info(f"Internal posts: {len([p for p in all_posts if not p.external])}")
        
        # デバッグ: '振り返り' タグを持つ記事をすべて表示
        retrospective_posts = [p for p in all_posts if p.tags and '振り返り' in p.tags]
        logger.info(f"Posts with '振り返り' tag: {[(p.title, p.external, p.tags) for p in retrospective_posts]}")

        # 前後の記事を取得
        prev_post, next_post = NavigationHelper.find_adjacent_articles(post, all_posts)
        navigation_data = TemplateDataGenerator.generate_navigation_data(
            prev_post, next_post
        )

        # 関連記事を取得（タグベースとTF-IDFベース）
        tfidf_config = self.config.data.get("tfidf_config", {})
        related_articles_dict = NavigationHelper.find_related_articles(
            post, all_posts, 5, tfidf_config
        )
        logger.debug(f"Related articles: {len(related_articles_dict['tag_based'])} tag-based, {len(related_articles_dict['tfidf_based'])} TF-IDF-based")
        related_data = TemplateDataGenerator.generate_related_articles_data_separated(
            related_articles_dict
        )

        # テンプレートファイルを更新してナビゲーションと関連記事の情報を含める
        self.update_template_with_navigation(output_path, navigation_data, related_data)

    def update_template_with_navigation(
        self,
        output_path: pathlib.Path,
        navigation_data: Dict[str, Any],
        related_data: Dict[str, Any],
    ) -> None:
        """生成されたHTMLファイルにナビゲーションと関連記事を追加"""
        try:
            # 生成されたHTMLファイルを読み込み
            html_content = output_path.read_text(encoding="utf-8")

            # ナビゲーション用のHTML生成
            navigation_html = self.generate_navigation_html(navigation_data)

            # 関連記事用のHTML生成
            related_articles_html = self.generate_related_articles_html(related_data)

            # モバイル用のHTML生成
            mobile_sidebar_html = self.generate_mobile_sidebar_html()
            mobile_related_html = self.generate_mobile_related_articles_html(related_data)

            # プレースホルダーを置換
            html_content = html_content.replace("{{navigation}}", navigation_html)
            html_content = html_content.replace(
                "{{related_articles}}", related_articles_html
            )
            html_content = html_content.replace("{{mobile_sidebar}}", mobile_sidebar_html)
            html_content = html_content.replace("{{mobile_related_articles}}", mobile_related_html)

            # 更新されたHTMLを保存
            output_path.write_text(html_content, encoding="utf-8")

        except Exception as e:
            logger.error(f"Failed to update template with navigation: {e}")

    def generate_navigation_html(self, navigation_data: Dict[str, Any]) -> str:
        """記事ナビゲーションのHTMLを生成"""
        logger.info(f"Navigation data: {navigation_data}")

        if not navigation_data.get("has_navigation"):
            logger.info("No navigation data available")
            return ""

        html = ['<div class="article-navigation">']

        # 前の記事リンク
        if navigation_data.get("prev_post"):
            prev = navigation_data["prev_post"]
            logger.info(f"Adding prev post: {prev['title']}")
            html.append(
                f"""
                <div class="nav-item nav-prev">
                    <a href="{prev['url']}">
                        <div class="nav-direction">← 前の記事</div>
                        <div class="nav-title">{prev['title']}</div>
                    </a>
                </div>"""
            )
        else:
            logger.info("No prev post available")
            # 前の記事がない場合はスペーサーを追加
            html.append('<div class="nav-item nav-prev"></div>')

        # 次の記事リンク
        if navigation_data.get("next_post"):
            next_post = navigation_data["next_post"]
            logger.info(f"Adding next post: {next_post['title']}")
            html.append(
                f"""
                <div class="nav-item nav-next">
                    <a href="{next_post['url']}">
                        <div class="nav-direction">次の記事 →</div>
                        <div class="nav-title">{next_post['title']}</div>
                    </a>
                </div>"""
            )
        else:
            logger.info("No next post available")
            # 次の記事がない場合はスペーサーを追加
            html.append('<div class="nav-item nav-next"></div>')

        html.append("</div>")
        result = "\n".join(html)
        return result

    def generate_related_articles_html(self, related_data: Dict[str, Any]) -> str:
        """関連記事のHTMLを生成（タグベースとTF-IDFベース分離）"""
        html = []
        
        # タグベースの関連記事
        if related_data.get("has_tag_related"):
            html.append('<div class="related-articles tag-related">')
            html.append('<h3 class="related-title">同じようなタグの記事</h3>')
            
            for article in related_data["tag_related_articles"]:
                tags_html = " ".join(
                    [f'<span class="related-tag">#{tag}</span>' for tag in article["tags"]]
                )
                
                html.append(
                    f"""
                    <div class="related-item">
                        <a href="{article['url']}">
                            <div class="related-item-title">{article['title']}</div>
                            <div class="related-date">{article['date']}</div>
                            <div class="related-tags">{tags_html}</div>
                            </a>
                    </div>"""
                )
            
            html.append("</div>")
        
        # TF-IDFベースの関連記事
        if related_data.get("has_tfidf_related"):
            html.append('<div class="related-articles tfidf-related">')
            html.append('<h3 class="related-title">同じような内容の記事</h3>')
            
            for article in related_data["tfidf_related_articles"]:
                tags_html = " ".join(
                    [f'<span class="related-tag">#{tag}</span>' for tag in article["tags"]]
                )
                
                html.append(
                    f"""
                    <div class="related-item">
                        <a href="{article['url']}">
                            <div class="related-item-title">{article['title']}</div>
                            <div class="related-date">{article['date']}</div>
                            <div class="related-tags">{tags_html}</div>
                            </a>
                    </div>"""
                )
            
            html.append("</div>")
        
        return "\n".join(html)

    def generate_mobile_sidebar_html(self) -> str:
        """モバイル用サイドバーのHTMLを生成（デスクトップと同じスタイル）"""
        html = ['<div class="mobile-sidebar">']
        html.append('<div class="sidebar">')
        html.append('<ul id="mobile-toc-list"></ul>')
        html.append('</div>')
        html.append('</div>')
        
        # TOCをモバイル版にもコピーするJavaScript
        html.append('<script>')
        html.append('document.addEventListener("DOMContentLoaded", function() {')
        html.append('  const desktopToc = document.querySelector("#toc");')
        html.append('  const mobileToc = document.querySelector("#mobile-toc-list");')
        html.append('  if (desktopToc && mobileToc) {')
        html.append('    mobileToc.innerHTML = desktopToc.innerHTML;')
        html.append('  }')
        html.append('});')
        html.append('</script>')
        
        return "\n".join(html)

    def generate_mobile_related_articles_html(self, related_data: Dict[str, Any]) -> str:
        """モバイル用関連記事のHTMLを生成（タグベースとTF-IDFベース分離）"""
        html = ['<div class="mobile-related-articles">']
        
        # タグベースの関連記事
        if related_data.get("has_tag_related"):
            html.append('<div class="related-articles tag-related">')
            html.append('<h3 class="related-title">同じようなタグの記事</h3>')
            
            for article in related_data["tag_related_articles"]:
                tags_html = " ".join(
                    [f'<span class="related-tag">#{tag}</span>' for tag in article["tags"]]
                )
                
                html.append(
                    f"""
                    <div class="related-item">
                        <a href="{article['url']}">
                            <div class="related-item-title">{article['title']}</div>
                            <div class="related-date">{article['date']}</div>
                            <div class="related-tags">{tags_html}</div>
                            </a>
                    </div>"""
                )
            
            html.append("</div>")
        
        # TF-IDFベースの関連記事
        if related_data.get("has_tfidf_related"):
            html.append('<div class="related-articles tfidf-related">')
            html.append('<h3 class="related-title">同じような内容の記事</h3>')
            
            for article in related_data["tfidf_related_articles"]:
                tags_html = " ".join(
                    [f'<span class="related-tag">#{tag}</span>' for tag in article["tags"]]
                )
                
                html.append(
                    f"""
                    <div class="related-item">
                        <a href="{article['url']}">
                            <div class="related-item-title">{article['title']}</div>
                            <div class="related-date">{article['date']}</div>
                            <div class="related-tags">{tags_html}</div>
                            </a>
                    </div>"""
                )
            
            html.append("</div>")
        
        html.append("</div>")
        return "\n".join(html)

    def update_posts_json(self, new_post: BlogPost) -> None:
        """posts.jsonを更新"""
        posts_data = self.file_manager.load_posts()
        posts = [BlogPost(**post_data) for post_data in posts_data]

        # 既存の記事を更新または新規追加
        updated = False
        for i, post in enumerate(posts):
            if post.url == new_post.url:
                posts[i] = new_post
                updated = True
                break

        if not updated:
            posts.append(new_post)

        # 日付順にソート
        posts.sort(key=lambda x: x.post_date, reverse=True)

        # 保存
        self.file_manager.save_posts(posts)


class ExternalArticleProcessor:
    """外部記事処理を管理するクラス"""

    def __init__(self):
        self.file_manager = FileManager()
        self.ogp_processor = OGPProcessor()

    def process_external_articles(self) -> None:
        """外部記事を処理"""
        external_path = self.file_manager.EXTERNAL_ARTICLES_PATH

        if not external_path.exists():
            logger.info(f"External articles file not found: {external_path}")
            return

        external_articles = self.file_manager.load_json(external_path)
        if not external_articles:
            logger.error("Failed to load external articles")
            return

        posts_data = self.file_manager.load_posts()
        posts = [BlogPost(**post_data) for post_data in posts_data]

        added_count = 0
        updated_count = 0

        if HAS_TQDM:
            article_iter = tqdm.tqdm(external_articles, desc="Processing external articles", unit="article")
        else:
            article_iter = external_articles
            
        for i, article_data in enumerate(article_iter):
            if not HAS_TQDM and i % 10 == 0:
                logger.info(f"Processing external article {i+1}/{len(external_articles)}")
                
            post = self.create_external_post(article_data)
            if not post:
                continue

            # 既存記事を更新または新規追加
            updated = False
            for i, existing_post in enumerate(posts):
                if existing_post.url == post.url:
                    posts[i] = post
                    updated_count += 1
                    updated = True
                    logger.info(f"Updated external article: {post.title}")
                    break

            if not updated:
                posts.append(post)
                added_count += 1
                logger.info(f"Added external article: {post.title}")

        # 日付順にソート
        posts.sort(key=lambda x: x.post_date, reverse=True)

        # 保存
        self.file_manager.save_posts(posts)

        logger.info(
            f"External articles processing complete: {added_count} added, {updated_count} updated"
        )

    def create_external_post(self, article_data: Dict[str, Any]) -> Optional[BlogPost]:
        """外部記事のBlogPostを作成"""
        url = article_data.get("url")
        if not url:
            logger.warning("External article missing URL")
            return None

        title = article_data.get("title")
        thumbnail_url = article_data.get("thumbnail_url")

        # OGP情報を取得（タイトルまたはサムネイルが不足している場合）
        if not title or not thumbnail_url:
            try:
                ogp_img, ogp_title = self.ogp_processor.fetch_ogp(url)
                if not title:
                    title = ogp_title
                if not thumbnail_url:
                    thumbnail_url = ogp_img
            except Exception as e:
                logger.error(f"Error fetching OGP for {url}: {e}")
                if not title:
                    title = url
                if not thumbnail_url:
                    thumbnail_url = ""

        return BlogPost(
            title=title,
            post_date=article_data.get("post_date", ""),
            url=url,
            thumbnail_url=thumbnail_url,
            content="",
            tags=article_data.get("tags", []),
            featured=article_data.get("featured", False),
            external=True,
        )


class NavigationHelper:
    """記事ナビゲーション機能を管理するクラス"""

    @staticmethod
    def find_adjacent_articles(
        current_post: BlogPost, all_posts: List[BlogPost]
    ) -> Tuple[Optional[BlogPost], Optional[BlogPost]]:
        """現在の記事の前後の記事を取得"""
        # 外部記事を除外し、日付順にソート
        internal_posts = [post for post in all_posts if not post.external]
        internal_posts.sort(key=lambda x: x.post_date, reverse=True)

        # 記事が1つ以下の場合は前後の記事はない
        if len(internal_posts) <= 1:
            return None, None

        try:
            # 現在の記事のインデックスを探す（URLで比較）
            current_index = -1
            for i, post in enumerate(internal_posts):
                if post.url == current_post.url:
                    current_index = i
                    break

            if current_index == -1:
                # 現在の記事が見つからない場合、まず記事を追加してソートし直す
                logger.warning(
                    f"Current post not found in posts list: {current_post.url}"
                )
                logger.info("Adding current post to list for navigation calculation")
                internal_posts.append(current_post)
                internal_posts.sort(key=lambda x: x.post_date, reverse=True)

                # 再度インデックスを探す
                for i, post in enumerate(internal_posts):
                    if post.url == current_post.url:
                        current_index = i
                        break

            logger.info(
                f"Current post index: {current_index} out of {len(internal_posts)} posts"
            )

            # prev_post: より古い記事（インデックスが大きい）
            # next_post: より新しい記事（インデックスが小さい）
            prev_post = (
                internal_posts[current_index + 1]
                if current_index + 1 < len(internal_posts)
                else None
            )
            next_post = internal_posts[current_index - 1] if current_index > 0 else None

            logger.info(
                f"Navigation for {current_post.title}: prev={prev_post.title if prev_post else 'None'}, next={next_post.title if next_post else 'None'}"
            )
            return prev_post, next_post

        except Exception as e:
            logger.error(f"Error finding adjacent articles: {e}")
            return None, None

    @staticmethod
    def find_related_articles(
        current_post: BlogPost, all_posts: List[BlogPost], max_count: int = 5, tfidf_config: Dict[str, Any] = None
    ) -> Dict[str, List[Tuple[BlogPost, float, str]]]:
        """タグベースとTF-IDFベース両方の関連記事を取得して分けて返す"""
        result = {
            "tag_based": [],
            "tfidf_based": []
        }
        
        # タグベースの関連記事を取得（3本）
        tag_related = NavigationHelper._find_related_articles_by_tags_internal(current_post, all_posts, 3)
        result["tag_based"] = [(post, score, "tags") for post, score in tag_related]
        
        # バリデーション：タグベースで期待される数が取得できているかチェック（利用可能な記事がある場合のみ）
        other_posts = [post for post in all_posts if post.url != current_post.url and not post.external]
        if len(result["tag_based"]) < 3 and len(other_posts) >= 3:
            logger.warning(f"Tag-based articles: expected 3, got {len(result['tag_based'])} (available: {len(other_posts)})")
        
        # TF-IDFベースの関連記事を取得（2本）
        try:
            try:
                from .tfidf_similarity import TFIDFSimilarityCalculator
                from .precompute_vectors import VectorPrecomputer
            except ImportError:
                # フォールバック：絶対パスでインポート
                import sys
                import os
                sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
                from blog_builder.tfidf_similarity import TFIDFSimilarityCalculator
                from blog_builder.precompute_vectors import VectorPrecomputer
            
            # キャッシュされたベクトルを読み込み
            logger.debug("Loading TF-IDF cache...")
            cache_data = VectorPrecomputer.load_cached_vectors()
            
            if cache_data and VectorPrecomputer.is_cache_valid(tfidf_config or {}):
                # キャッシュからTF-IDF計算機を復元
                tfidf_calc = TFIDFSimilarityCalculator.from_cache(cache_data)
                
                # 現在の記事がキャッシュに含まれているかチェック
                if current_post.url in tfidf_calc.article_ids:
                    # TF-IDFベースで類似記事を取得（重複制限なし）
                    similar_articles = tfidf_calc.calculate_similarity(current_post.url, 2)
                    logger.debug(f"TF-IDF similarity calculation returned {len(similar_articles)} articles")
                    
                    # 結果をBlogPostオブジェクトと類似度のタプルに変換
                    for article_url, similarity_score in similar_articles:
                        for post in all_posts:
                            if post.url == article_url and not post.external:  # 外部記事のみ除外
                                result["tfidf_based"].append((post, similarity_score, "tfidf"))
                                break
                        if len(result["tfidf_based"]) >= 2:  # 2本取得したら終了
                            break
                    
                    logger.debug(f"TF-IDF found {len(result['tfidf_based'])} related articles from cache")
                    
                    # TF-IDFで不足している場合は、日付順で補完
                    if len(result["tfidf_based"]) < 2:
                        logger.debug(f"TF-IDF insufficient ({len(result['tfidf_based'])}), supplementing with recent articles")
                        other_posts = [post for post in all_posts if post.url != current_post.url and not post.external]
                        
                        # 日付順でソート
                        other_posts.sort(key=lambda x: x.post_date, reverse=True)
                        
                        needed = 2 - len(result["tfidf_based"])
                        for post in other_posts[:needed]:
                            result["tfidf_based"].append((post, 0.01, "tfidf"))  # 低い類似度で追加
                
                else:
                    logger.debug(f"Current article {current_post.url} not found in TF-IDF cache")
                    # TF-IDFキャッシュに記事がない場合、日付順で2本取得
                    other_posts = [post for post in all_posts if post.url != current_post.url and not post.external]
                    other_posts.sort(key=lambda x: x.post_date, reverse=True)
                    
                    for post in other_posts[:2]:
                        result["tfidf_based"].append((post, 0.01, "tfidf"))
            else:
                logger.debug("No valid TF-IDF cache found")
                # TF-IDFキャッシュがない場合、日付順で2本取得
                other_posts = [post for post in all_posts if post.url != current_post.url and not post.external]
                other_posts.sort(key=lambda x: x.post_date, reverse=True)
                
                for post in other_posts[:2]:
                    result["tfidf_based"].append((post, 0.01, "tfidf"))
                
        except Exception as e:
            logger.warning(f"TF-IDF calculation failed: {e}")
            # TF-IDF計算が失敗した場合、フォールバックで2本取得
            other_posts = [post for post in all_posts if post.url != current_post.url and not post.external]
            other_posts.sort(key=lambda x: x.post_date, reverse=True)
            
            for post in other_posts[:2]:
                result["tfidf_based"].append((post, 0.01, "tfidf"))
        
        # 最終確認：TF-IDFが確実に2本になるように補完
        if len(result["tfidf_based"]) < 2:
            logger.debug(f"Final TF-IDF check: only {len(result['tfidf_based'])} articles, adding more")
            other_posts = [post for post in all_posts if post.url != current_post.url and not post.external]
            other_posts.sort(key=lambda x: x.post_date, reverse=True)
            
            needed = 2 - len(result["tfidf_based"])
            for post in other_posts[:needed]:
                result["tfidf_based"].append((post, 0.01, "tfidf"))
        
        # 最終バリデーション：合計記事数のチェック（十分な記事がある場合のみ）
        total_articles = len(result["tag_based"]) + len(result["tfidf_based"])
        available_posts = len([post for post in all_posts if post.url != current_post.url and not post.external])
        if total_articles < 5 and available_posts >= 5:
            logger.warning(f"Total related articles: expected 5, got {total_articles} (tag: {len(result['tag_based'])}, tfidf: {len(result['tfidf_based'])}, available: {available_posts})")
        
        return result
    
    @staticmethod
    def _find_related_articles_by_tags(
        current_post: BlogPost, all_posts: List[BlogPost], max_count: int = 5
    ) -> List[Tuple[BlogPost, float, str]]:
        """タグベースで関連記事を取得（フォールバック用、類似度付き）"""
        tag_results = NavigationHelper._find_related_articles_by_tags_internal(current_post, all_posts, max_count)
        # ソース情報を追加
        return [(post, score, "tags") for post, score in tag_results]
    
    @staticmethod
    def _calculate_tag_rarity_scores(all_posts: List[BlogPost]) -> Dict[str, float]:
        """タグの希少性スコアを計算（珍しいタグほど高スコア）"""
        # 全記事でのタグの出現頻度を計算
        tag_counts = {}
        total_articles = len([post for post in all_posts if not post.external])
        
        for post in all_posts:
            if not post.external and post.tags:
                for tag in post.tags:
                    tag_counts[tag] = tag_counts.get(tag, 0) + 1
        
        # 希少性スコアを計算：珍しいタグほど高スコア
        tag_rarity_scores = {}
        for tag, count in tag_counts.items():
            # スコア = 1 / 出現記事数（珍しいほど高い）
            rarity_score = 1.0 / count
            tag_rarity_scores[tag] = rarity_score
        
        return tag_rarity_scores

    @staticmethod
    def _find_related_articles_by_tags_internal(
        current_post: BlogPost, all_posts: List[BlogPost], max_count: int = 5
    ) -> List[Tuple[BlogPost, float]]:
        """タグベースで関連記事を取得（珍しいタグの共有を重視）"""
        # 現在の記事を除外（外部記事は除く）
        other_posts = [post for post in all_posts if post.url != current_post.url and not post.external]
        
        logger.debug(f"Tag-based analysis for '{current_post.title}' with tags: {current_post.tags}")
        logger.debug(f"Total articles: {len(all_posts)}, External articles: {len([p for p in all_posts if p.external])}")
        logger.debug(f"Available for comparison: {len(other_posts)}")
        
        # デバッグ: 同じタグを持つ記事をすべて表示
        if current_post.tags:
            same_tag_posts = []
            for post in all_posts:
                if post.url != current_post.url and post.tags:
                    common = set(current_post.tags) & set(post.tags)
                    if common == set(current_post.tags):  # 完全に同じタグ
                        same_tag_posts.append(f"'{post.title}' (external={post.external}, tags={post.tags})")
            if same_tag_posts:
                logger.info(f"Posts with same tags as current: {same_tag_posts}")
        
        if not other_posts:
            return []
        
        # タグの希少性スコアを計算
        tag_rarity_scores = NavigationHelper._calculate_tag_rarity_scores(all_posts)
        logger.debug(f"Tag rarity scores: {tag_rarity_scores}")
        
        scored_posts = []
        
        # タグがある場合の処理
        if current_post.tags:
            logger.debug(f"Current post has tags, checking {len(other_posts)} other posts...")
            for post in other_posts:
                if post.tags:
                    # 共通タグを取得
                    common_tags = set(current_post.tags) & set(post.tags)
                    logger.debug(f"Comparing with '{post.title}' (tags: {post.tags}) -> common: {common_tags}")
                    
                    if common_tags:
                        # 共通タグの希少性スコアの合計を類似度とする
                        similarity_score = sum(tag_rarity_scores.get(tag, 0) for tag in common_tags)
                        
                        # 共通タグ数でボーナス（多く共通するほど類似度アップ）
                        tag_count_bonus = len(common_tags) * 0.1
                        final_score = similarity_score + tag_count_bonus
                        
                        scored_posts.append((post, final_score))
                        
                        # 詳細ログ
                        logger.info(f"MATCH: '{post.title}' score={final_score:.4f} (common_tags={common_tags}, similarity={similarity_score:.4f}, bonus={tag_count_bonus})")
                    else:
                        logger.debug(f"No common tags with '{post.title}'")
                else:
                    logger.debug(f"Post '{post.title}' has no tags")
        else:
            logger.debug("Current post has no tags")
        
        logger.info(f"Found {len(scored_posts)} posts with tag matches")
        
        # スコア順にソート
        scored_posts.sort(key=lambda x: x[1], reverse=True)
        
        # タグマッチした記事だけでmax_countに達している場合はそれを返す
        if len(scored_posts) >= max_count:
            result = scored_posts[:max_count]
            logger.debug(f"Tag-based returning {len(result)} articles (tag matches only)")
            return result
        
        # 不足分を日付順で補完
        used_urls = {post.url for post, _ in scored_posts}
        remaining_posts = [post for post in other_posts if post.url not in used_urls]
        
        # 日付順でソート（より新しい記事を優先）
        remaining_posts.sort(key=lambda x: x.post_date, reverse=True)
        
        # 必要な数まで追加
        needed_count = max_count - len(scored_posts)
        for i, post in enumerate(remaining_posts):
            if i >= needed_count:
                break
            scored_posts.append((post, 0.01))  # 日付ベースの低い類似度
            logger.debug(f"Added by date: '{post.title}' (score=0.01)")
        
        logger.info(f"Tag-based returning {len(scored_posts)} articles total")
        return scored_posts


class TemplateDataGenerator:
    """テンプレート用データ生成を管理するクラス"""

    @staticmethod
    def generate_navigation_data(
        prev_post: Optional[BlogPost], next_post: Optional[BlogPost]
    ) -> Dict[str, Any]:
        """ナビゲーション用データを生成"""
        return {
            "has_navigation": prev_post is not None or next_post is not None,
            "prev_post": (
                {
                    "title": prev_post.title if prev_post else "",
                    "url": prev_post.url if prev_post else "",
                    "thumbnail": prev_post.thumbnail_url if prev_post else "",
                }
                if prev_post
                else None
            ),
            "next_post": (
                {
                    "title": next_post.title if next_post else "",
                    "url": next_post.url if next_post else "",
                    "thumbnail": next_post.thumbnail_url if next_post else "",
                }
                if next_post
                else None
            ),
        }

    @staticmethod
    def generate_related_articles_data(related_posts_with_scores: List[Tuple[BlogPost, float, str]]) -> Dict[str, Any]:
        """関連記事用データを生成（類似度付き、ソース情報付き）"""
        articles = []
        for item in related_posts_with_scores:
            if len(item) == 3:
                post, similarity_score, source = item
            else:
                # 後方互換性のため
                post, similarity_score = item
                source = "unknown"
            
            articles.append({
                "title": post.title,
                "url": post.url,
                "thumbnail": post.thumbnail_url,
                "date": post.post_date,
                "tags": post.tags[:3],  # 最大3つのタグまで表示
                "similarity": round(similarity_score, 5),  # 類似度を5桁まで表示
                "source": source,  # "tfidf" または "tags"
            })
        
        return {
            "has_related": len(related_posts_with_scores) > 0,
            "related_articles": articles,
        }
    
    @staticmethod
    def generate_related_articles_data_separated(related_dict: Dict[str, List[Tuple[BlogPost, float, str]]]) -> Dict[str, Any]:
        """分離された関連記事用データを生成（タグベースとTF-IDFベース別々）"""
        def convert_articles(articles_list):
            validated_articles = []
            for post, similarity_score, source in articles_list:
                # 記事データのバリデーション
                if not post.title or not post.url:
                    logger.warning(f"Invalid article data: title='{post.title}', url='{post.url}'")
                    continue
                
                validated_articles.append({
                    "title": post.title,
                    "url": post.url,
                    "thumbnail": post.thumbnail_url,
                    "date": post.post_date,
                    "tags": post.tags[:3],
                    "source": source,
                })
            return validated_articles
        
        tag_articles = convert_articles(related_dict.get("tag_based", []))
        tfidf_articles = convert_articles(related_dict.get("tfidf_based", []))
        
        # バリデーション：期待される数の記事が生成されているかチェック
        if len(tag_articles) != len(related_dict.get("tag_based", [])):
            logger.warning(f"Tag articles validation failed: {len(related_dict.get('tag_based', []))} -> {len(tag_articles)}")
        if len(tfidf_articles) != len(related_dict.get("tfidf_based", [])):
            logger.warning(f"TF-IDF articles validation failed: {len(related_dict.get('tfidf_based', []))} -> {len(tfidf_articles)}")
        
        return {
            "has_tag_related": len(tag_articles) > 0,
            "tag_related_articles": tag_articles,
            "has_tfidf_related": len(tfidf_articles) > 0,
            "tfidf_related_articles": tfidf_articles,
            # 後方互換性のため
            "has_related": len(tag_articles) > 0 or len(tfidf_articles) > 0,
            "related_articles": tag_articles + tfidf_articles,
        }


class BlogBuilder:
    """ブログビルド全体を管理するメインクラス"""

    def __init__(self, config_path: pathlib.Path = None):
        config_path = config_path or FileManager.CONFIG_PATH
        config_data = FileManager.load_json(config_path)
        self.config = BlogConfig(config_data)
        self.article_builder = ArticleBuilder(self.config)
        self.external_processor = ExternalArticleProcessor()
        self.navigation_helper = NavigationHelper()
        self.template_generator = TemplateDataGenerator()

    def build_articles(self, article_paths: List[pathlib.Path]) -> None:
        """複数記事をビルド"""
        if HAS_TQDM:
            article_iter = tqdm.tqdm(article_paths, desc="Building articles", unit="article")
        else:
            article_iter = article_paths
            
        for i, article_path in enumerate(article_iter):
            if not HAS_TQDM and i % 5 == 0:
                logger.info(f"Progress: {i+1}/{len(article_paths)}")
                
            try:
                self.article_builder.build_article(article_path)
            except Exception as e:
                logger.error(f"Failed to build {article_path}: {e}")

    def build_all(self) -> None:
        """全記事をビルド"""
        # ベクトルキャッシュが存在しない場合のみ事前計算
        # (GitHub Actionsでは別途事前計算ステップで実行)
        if not pathlib.Path("public/tfidf_cache.pkl").exists():
            logger.info("TF-IDF cache not found, computing vectors...")
            self.precompute_vectors()
        else:
            logger.info("TF-IDF cache found, skipping precomputation")
        
        article_paths = list(pathlib.Path("posts").glob("*.md"))
        self.build_articles(article_paths)
        self.external_processor.process_external_articles()
    
    def precompute_vectors(self) -> None:
        """TF-IDFベクトルを事前計算"""
        try:
            from .precompute_vectors import VectorPrecomputer
        except ImportError:
            import sys
            import os
            sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            from blog_builder.precompute_vectors import VectorPrecomputer
        
        logger.info("Starting TF-IDF vector precomputation...")
        
        # 設定を取得
        tfidf_config = self.config.data.get('tfidf_config', {})
        
        # キャッシュが有効かチェック
        if VectorPrecomputer.is_cache_valid(tfidf_config):
            logger.info("TF-IDF cache is valid, skipping precomputation")
            return
        
        # ベクトルを事前計算
        precomputer = VectorPrecomputer(tfidf_config)
        precomputer.precompute_all_vectors()
        
        logger.info("TF-IDF vector precomputation completed")

    def build_changed(self, changed_files: List[str]) -> None:
        """変更されたファイルのみビルド"""
        article_paths = [pathlib.Path(file_path) for file_path in changed_files]
        self.build_articles(article_paths)
        self.external_processor.process_external_articles()

    def initialize_posts_json(self) -> None:
        """posts.jsonを初期化"""
        FileManager.save_json(FileManager.POSTS_JSON_PATH, [])
        recent_posts_path = pathlib.Path("public/recent_posts.json")
        FileManager.save_json(recent_posts_path, [])


# 以下は後方互換性のための関数群（非推奨）
def fetch_ogp(url: str) -> Tuple[str, str]:
    """後方互換性のための関数（非推奨）"""
    return OGPProcessor.fetch_ogp(url)


def load_json(path: pathlib.Path) -> Dict[str, Any]:
    """後方互換性のための関数（非推奨）"""
    return FileManager.load_json(path)


def load_rawtext(ir: Dict[str, Any], result: str = "") -> str:
    """後方互換性のための関数（非推奨）"""
    return ContentProcessor.load_rawtext(ir, result)


def to_outputpath(article_path: pathlib.Path) -> pathlib.Path:
    """後方互換性のための関数（非推奨）"""
    return ContentProcessor.to_outputpath(article_path)


def to_interimpath(article_path: pathlib.Path) -> pathlib.Path:
    """後方互換性のための関数（非推奨）"""
    return ContentProcessor.to_interimpath(article_path)


def replace_ogp_url(content: str, ignore_patterns: List[re.Pattern] = None) -> str:
    """後方互換性のための関数（非推奨）"""
    return OGPProcessor.replace_ogp_url(content, ignore_patterns)


# 定数（後方互換性のため）
CONFIG_CORRESPONDING = BlogConfig.CONFIG_MAPPING
IGNORE_PATTERNS = OGPProcessor.IGNORE_PATTERNS
OGP_TEMPLATE = OGPProcessor.OGP_TEMPLATE


def build_article(config: dict, article_path: pathlib.Path) -> None:
    """後方互換性のための関数（非推奨）"""
    blog_config = BlogConfig(config)
    builder = ArticleBuilder(blog_config)
    builder.build_article(article_path)


def process_external_articles(config: dict) -> None:
    """後方互換性のための関数（非推奨）"""
    processor = ExternalArticleProcessor()
    processor.process_external_articles()


def build(config: dict, article_paths: List[pathlib.Path]) -> None:
    """後方互換性のための関数（非推奨）"""
    blog_config = BlogConfig(config)
    builder = ArticleBuilder(blog_config)
    for article_path in article_paths:
        builder.build_article(article_path)

    processor = ExternalArticleProcessor()
    processor.process_external_articles()


def main() -> int:
    """メイン関数"""
    try:
        builder = BlogBuilder()

        if os.getenv("REBUILD"):
            logger.info("Full rebuild mode")
            builder.initialize_posts_json()
            builder.build_all()
        else:
            logger.info("Incremental build mode")
            changed_files_data = FileManager.load_json(FileManager.CHANGED_FILES_PATH)
            if changed_files_data:
                builder.build_changed(changed_files_data)
            else:
                logger.info("No changed files found")
                
        logger.info("Build completed successfully")
        return 0
        
    except BuildError as e:
        logger.error(f"Build error: {e}")
        return 1
    except Exception as e:
        logger.error(f"Unexpected build error: {e}")
        return 1


if __name__ == "__main__":
    exit(main())
