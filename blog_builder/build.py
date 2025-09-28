
import argparse
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
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)

# Configure specific loggers to reduce noise
logging.getLogger("requests").setLevel(logging.WARNING)
logging.getLogger("urllib3").setLevel(logging.WARNING)


class BuildError(Exception):
    pass


@dataclass
class BlogPost:
    title: str
    post_date: str
    url: str
    thumbnail_url: str
    content: str
    tags: List[str]
    featured: bool = False
    external: bool = False


class BlogConfig:
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
        args = []
        for key, flag in self.CONFIG_MAPPING.items():
            if key in self.data:
                args.extend([flag, str(self.data[key])])
        return args


class FileManager:
    POSTS_JSON_PATH = pathlib.Path("public/posts.json")
    EXTERNAL_ARTICLES_PATH = pathlib.Path("config/external_articles.json")
    CONFIG_PATH = pathlib.Path("config/config.json")
    CHANGED_FILES_PATH = pathlib.Path("changed_files.json")

    @staticmethod
    def load_json(path: pathlib.Path) -> Dict[str, Any]:
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
        return FileManager.load_json(FileManager.POSTS_JSON_PATH)

    @staticmethod
    def save_posts(posts: List[BlogPost]) -> bool:
        logger.debug(f"Saving {len(posts)} posts to {FileManager.POSTS_JSON_PATH}")
        posts_data = [post.__dict__ for post in posts]
        return FileManager.save_json(FileManager.POSTS_JSON_PATH, posts_data)


class OGPProcessor:
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
        if not HAS_WEB_DEPS:
            logger.warning("Web dependencies not available for OGP fetching")
            return "", url

        try:
            res = requests.get(url, timeout=10)
            res.raise_for_status()
            res.encoding = 'utf-8'
            soup = BeautifulSoup(res.text, "html.parser")

            ogp = soup.find("meta", attrs={"property": "og:image"})
            ogp_url = ogp["content"] if ogp and "content" in ogp.attrs else ""

            # 相対パスの場合、ベースURLを付与
            if ogp_url and not ogp_url.startswith(("http://", "https://")):
                from urllib.parse import urljoin

                ogp_url = urljoin(url, ogp_url)

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
    @staticmethod
    def load_rawtext(ir: Dict[str, Any], result: str = "") -> str:
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
        return pathlib.Path("public/posts") / f"{article_path.stem}.html"

    @staticmethod
    def to_interimpath(article_path: pathlib.Path) -> pathlib.Path:
        return pathlib.Path("public/posts") / f"{article_path.stem}.md"


class ArticleBuilder:
    def __init__(self, config: BlogConfig):
        self.config = config
        self.file_manager = FileManager()
        self.content_processor = ContentProcessor()
        self.ogp_processor = OGPProcessor()

    def copy_article_assets(self, article_path: pathlib.Path) -> None:
        try:
            subprocess.run(
                f"cp -r posts/{article_path.stem} public/posts/", shell=True, check=True
            )
        except subprocess.CalledProcessError as e:
            logger.warning(f"Failed to copy assets for {article_path.stem}: {e}")

    def process_content(self, article_path: pathlib.Path) -> str:
        content = article_path.read_text(encoding="utf-8")
        logger.debug("Processing OGP URLs...")
        content = self.ogp_processor.replace_ogp_url(content)
        logger.debug("OGP processing complete.")
        return content

    def build_with_almo(
        self, interim_path: pathlib.Path, output_path: pathlib.Path
    ) -> Dict[str, Any]:
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

    def build_article(
        self, article_path: pathlib.Path, include_navigation: bool = True
    ) -> None:
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

        # ナビゲーションと関連記事の処理は第2段階でのみ実行
        if include_navigation:
            self.add_navigation_to_article(post, output_path)

    def add_navigation_to_article(
        self, post: BlogPost, output_path: pathlib.Path
    ) -> None:
        # ナビゲーションと関連記事の情報を取得（更新されたposts.jsonから）
        all_posts_data = self.file_manager.load_posts()
        all_posts = [BlogPost(**post_data) for post_data in all_posts_data]

        logger.info(f"Total posts loaded: {len(all_posts)}")
        logger.info(f"Internal posts: {len([p for p in all_posts if not p.external])}")

        # デバッグ: '振り返り' タグを持つ記事をすべて表示
        retrospective_posts = [p for p in all_posts if p.tags and "振り返り" in p.tags]
        logger.info(
            f"Posts with '振り返り' tag: {[(p.title, p.external, p.tags) for p in retrospective_posts]}"
        )

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
        logger.debug(
            f"Related articles: {len(related_articles_dict['tag_based'])} tag-based, {len(related_articles_dict['tfidf_based'])} TF-IDF-based"
        )
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
        try:
            # 生成されたHTMLファイルを読み込み
            html_content = output_path.read_text(encoding="utf-8")

            # ナビゲーション用のHTML生成
            navigation_html = self.generate_navigation_html(navigation_data)

            # 関連記事用のHTML生成
            related_articles_html = self.generate_related_articles_html(related_data)

            # モバイル用のHTML生成
            mobile_sidebar_html = self.generate_mobile_sidebar_html()
            mobile_related_html = self.generate_mobile_related_articles_html(
                related_data
            )

            # プレースホルダーを置換
            html_content = html_content.replace("{{navigation}}", navigation_html)
            html_content = html_content.replace(
                "{{related_articles}}", related_articles_html
            )
            html_content = html_content.replace(
                "{{mobile_sidebar}}", mobile_sidebar_html
            )
            html_content = html_content.replace(
                "{{mobile_related_articles}}", mobile_related_html
            )

            # 更新されたHTMLを保存
            output_path.write_text(html_content, encoding="utf-8")

        except Exception as e:
            logger.error(f"Failed to update template with navigation: {e}")

    def generate_navigation_html(self, navigation_data: Dict[str, Any]) -> str:
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
        html = []

        # タグベースの関連記事
        if related_data.get("has_tag_related"):
            html.append('<div class="related-articles tag-related">')
            html.append('<h3 class="related-title">同じようなタグの記事</h3>')

            for article in related_data["tag_related_articles"]:
                tags_html = " ".join(
                    [
                        f'<span class="related-tag">#{tag}</span>'
                        for tag in article["tags"]
                    ]
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
                    [
                        f'<span class="related-tag">#{tag}</span>'
                        for tag in article["tags"]
                    ]
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
        html = ['<div class="mobile-sidebar">']
        html.append('<div class="sidebar">')
        html.append('<ul id="mobile-toc-list"></ul>')
        html.append("</div>")
        html.append("</div>")

        # TOCをモバイル版にもコピーするJavaScript
        html.append("<script>")
        html.append('document.addEventListener("DOMContentLoaded", function() {')
        html.append('  const desktopToc = document.querySelector("#toc");')
        html.append('  const mobileToc = document.querySelector("#mobile-toc-list");')
        html.append("  if (desktopToc && mobileToc) {")
        html.append("    mobileToc.innerHTML = desktopToc.innerHTML;")
        html.append("  }")
        html.append("});")
        html.append("</script>")

        return "\n".join(html)

    def generate_mobile_related_articles_html(
        self, related_data: Dict[str, Any]
    ) -> str:
        html = ['<div class="mobile-related-articles">']

        # タグベースの関連記事
        if related_data.get("has_tag_related"):
            html.append('<div class="related-articles tag-related">')
            html.append('<h3 class="related-title">同じようなタグの記事</h3>')

            for article in related_data["tag_related_articles"]:
                tags_html = " ".join(
                    [
                        f'<span class="related-tag">#{tag}</span>'
                        for tag in article["tags"]
                    ]
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
                    [
                        f'<span class="related-tag">#{tag}</span>'
                        for tag in article["tags"]
                    ]
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
        posts.sort(key=lambda x: (x.post_date, x.url), reverse=True)

        # 保存
        self.file_manager.save_posts(posts)


class ExternalArticleProcessor:

    def __init__(self):
        self.file_manager = FileManager()
        self.ogp_processor = OGPProcessor()

    def process_external_articles(self) -> None:
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
            article_iter = tqdm.tqdm(
                external_articles, desc="Processing external articles", unit="article"
            )
        else:
            article_iter = external_articles

        for i, article_data in enumerate(article_iter):
            if not HAS_TQDM and i % 10 == 0:
                logger.info(
                    f"Processing external article {i+1}/{len(external_articles)}"
                )

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
        posts.sort(key=lambda x: (x.post_date, x.url), reverse=True)

        # 保存
        self.file_manager.save_posts(posts)

        logger.info(
            f"External articles processing complete: {added_count} added, {updated_count} updated"
        )

    def create_external_post(self, article_data: Dict[str, Any]) -> Optional[BlogPost]:
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

    @staticmethod
    def find_adjacent_articles(
        current_post: BlogPost, all_posts: List[BlogPost]
    ) -> Tuple[Optional[BlogPost], Optional[BlogPost]]:
        # 外部記事を除外し、日付順にソート
        internal_posts = [post for post in all_posts if not post.external]
        internal_posts.sort(key=lambda x: (x.post_date, x.url), reverse=True)

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
                internal_posts.sort(key=lambda x: (x.post_date, x.url), reverse=True)

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
        current_post: BlogPost,
        all_posts: List[BlogPost],
        max_count: int = 5,
        tfidf_config: Dict[str, Any] = None,
    ) -> Dict[str, List[Tuple[BlogPost, float, str]]]:
        result = {"tag_based": [], "tfidf_based": []}

        # シンプルなタグベースの関連記事を取得（3本）
        tag_related = NavigationHelper._find_related_articles_by_tags_simple(
            current_post, all_posts, 3
        )
        result["tag_based"] = [(post, score, "tags") for post, score in tag_related]

        logger.debug(
            f"Simple tag-based related articles found: {len(result['tag_based'])}"
        )

        # TF-IDFベースの関連記事を取得（2本）
        tfidf_related = NavigationHelper._find_related_articles_by_tfidf(
            current_post, all_posts, result["tag_based"], tfidf_config
        )
        result["tfidf_based"] = tfidf_related

        # 最終検証：記事数が不足している場合の追加補完
        total_available = len(
            [
                post
                for post in all_posts
                if post.url != current_post.url and not post.external
            ]
        )
        total_current = len(result["tag_based"]) + len(result["tfidf_based"])
        expected_total = min(5, total_available)  # 利用可能な記事数に応じて調整

        if total_current < expected_total:
            logger.warning(
                f"Total articles insufficient: {total_current}/{expected_total}, adding more fallback articles"
            )
            # 既に選ばれた記事を除外
            all_used_urls = {
                post.url for post, _, _ in result["tag_based"] + result["tfidf_based"]
            }
            all_other_posts = [
                post
                for post in all_posts
                if post.url != current_post.url and not post.external
            ]
            remaining = [
                post for post in all_other_posts if post.url not in all_used_urls
            ]
            remaining.sort(key=lambda x: (x.post_date, x.url), reverse=True)

            # TF-IDFに不足分を追加
            needed = expected_total - total_current
            for post in remaining[:needed]:
                result["tfidf_based"].append((post, 0.01, "tfidf"))
                logger.debug(f"Final fallback added: '{post.title}'")

        logger.debug(
            f"Final result: {len(result['tag_based'])} tag-based, {len(result['tfidf_based'])} TF-IDF-based (total: {len(result['tag_based']) + len(result['tfidf_based'])})"
        )

        return result

    @staticmethod
    def _find_related_articles_by_tfidf(
        current_post: BlogPost,
        all_posts: List[BlogPost],
        tag_based_results: List[Tuple[BlogPost, float, str]],
        tfidf_config: Optional[Dict[str, Any]],
    ) -> List[Tuple[BlogPost, float, str]]:
        try:
            try:
                from .precompute_vectors import VectorPrecomputer
                from .tfidf_similarity import TFIDFSimilarityCalculator
            except ImportError:
                import os
                import sys

                sys.path.append(
                    os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
                )
                from blog_builder.precompute_vectors import VectorPrecomputer
                from blog_builder.tfidf_similarity import TFIDFSimilarityCalculator

            # キャッシュされたベクトルを読み込み
            logger.debug("Loading TF-IDF cache...")
            cache_data = VectorPrecomputer.load_cached_vectors()

            if cache_data and VectorPrecomputer.is_cache_valid(tfidf_config or {}):
                # キャッシュからTF-IDF計算機を復元
                tfidf_calc = TFIDFSimilarityCalculator.from_cache(cache_data)

                # 現在の記事がキャッシュに含まれているかチェック
                if current_post.url in tfidf_calc.article_ids:
                    # TF-IDFベースで類似記事を取得
                    similar_articles = tfidf_calc.calculate_similarity(
                        current_post.url, 2
                    )
                    logger.debug(
                        f"TF-IDF similarity calculation returned {len(similar_articles)} articles"
                    )

                    result = []
                    # 結果をBlogPostオブジェクトと類似度のタプルに変換
                    for article_url, similarity_score in similar_articles:
                        for post in all_posts:
                            if post.url == article_url and not post.external:
                                result.append((post, similarity_score, "tfidf"))
                                break
                        if len(result) >= 2:
                            break

                    logger.debug(
                        f"TF-IDF found {len(result)} related articles from cache"
                    )

                    # TF-IDFで不足している場合は、タグベースに選ばれなかった記事から日付順で補完
                    if len(result) < 2:
                        result.extend(
                            NavigationHelper._get_fallback_articles(
                                current_post,
                                all_posts,
                                tag_based_results,
                                2 - len(result),
                            )
                        )

                    return result

            # キャッシュがない、または記事が見つからない場合のフォールバック
            return NavigationHelper._get_fallback_articles(
                current_post, all_posts, tag_based_results, 2
            )

        except Exception as e:
            logger.warning(f"TF-IDF calculation failed: {e}")
            # エラーの場合、フォールバック
            return NavigationHelper._get_fallback_articles(
                current_post, all_posts, tag_based_results, 2
            )

    @staticmethod
    def _get_fallback_articles(
        current_post: BlogPost,
        all_posts: List[BlogPost],
        tag_based_results: List[Tuple[BlogPost, float, str]],
        count: int,
    ) -> List[Tuple[BlogPost, float, str]]:
        other_posts = [
            post
            for post in all_posts
            if post.url != current_post.url and not post.external
        ]
        used_urls = {post.url for post, _, _ in tag_based_results}
        remaining_posts = [post for post in other_posts if post.url not in used_urls]
        remaining_posts.sort(key=lambda x: (x.post_date, x.url), reverse=True)

        return [(post, 0.01, "tfidf") for post in remaining_posts[:count]]

    @staticmethod
    def _find_related_articles_by_tags_simple(
        current_post: BlogPost, all_posts: List[BlogPost], max_count: int = 5
    ) -> List[Tuple[BlogPost, float]]:
        # 現在の記事を除外（外部記事は除く）
        other_posts = [
            post
            for post in all_posts
            if post.url != current_post.url and not post.external
        ]

        logger.debug(
            f"Simple tag-based analysis for '{current_post.title}' with tags: {current_post.tags}"
        )

        if not current_post.tags:
            logger.debug("Current post has no tags, returning empty list")
            return []

        scored_posts = []

        for post in other_posts:
            if post.tags:
                # 共通タグを取得
                common_tags = set(current_post.tags) & set(post.tags)

                if common_tags:
                    # 共通タグ数をスコアにする（シンプル）
                    score = len(common_tags)
                    scored_posts.append((post, score))
                    logger.debug(
                        f"MATCH: '{post.title}' score={score} (common_tags={common_tags})"
                    )

        # スコア順にソート（タイブレーカーとしてURLを使用）
        scored_posts.sort(key=lambda x: (x[1], x[0].url), reverse=True)

        # 上位max_count件を返す
        result = scored_posts[:max_count]

        # 不足分を日付順で補完（必ずmax_count本になるようにする）
        if len(result) < max_count:
            logger.debug(
                f"Tag-based insufficient ({len(result)}/{max_count}), supplementing with recent articles"
            )
            used_urls = {post.url for post, _ in result}
            remaining_posts = [
                post for post in other_posts if post.url not in used_urls
            ]
            remaining_posts.sort(key=lambda x: (x.post_date, x.url), reverse=True)

            needed = max_count - len(result)
            for post in remaining_posts[:needed]:
                result.append((post, 0.01))  # 低いスコアで追加
                logger.debug(f"Added by date: '{post.title}' (score=0.01)")

        logger.info(
            f"Simple tag-based returning {len(result)} articles ({len(scored_posts)} with common tags)"
        )
        return result


class TemplateDataGenerator:

    @staticmethod
    def generate_navigation_data(
        prev_post: Optional[BlogPost], next_post: Optional[BlogPost]
    ) -> Dict[str, Any]:
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
    def generate_related_articles_data(
        related_posts_with_scores: List[Tuple[BlogPost, float, str]]
    ) -> Dict[str, Any]:
        articles = []
        for item in related_posts_with_scores:
            if len(item) == 3:
                post, similarity_score, source = item
            else:
                # 後方互換性のため
                post, similarity_score = item
                source = "unknown"

            articles.append(
                {
                    "title": post.title,
                    "url": post.url,
                    "thumbnail": post.thumbnail_url,
                    "date": post.post_date,
                    "tags": post.tags[:3],  # 最大3つのタグまで表示
                    "similarity": round(similarity_score, 5),  # 類似度を5桁まで表示
                    "source": source,  # "tfidf" または "tags"
                }
            )

        return {
            "has_related": len(related_posts_with_scores) > 0,
            "related_articles": articles,
        }

    @staticmethod
    def generate_related_articles_data_separated(
        related_dict: Dict[str, List[Tuple[BlogPost, float, str]]]
    ) -> Dict[str, Any]:

        def convert_articles(articles_list):
            validated_articles = []
            for post, similarity_score, source in articles_list:
                # 記事データのバリデーション
                if not post.title or not post.url:
                    logger.warning(
                        f"Invalid article data: title='{post.title}', url='{post.url}'"
                    )
                    continue

                validated_articles.append(
                    {
                        "title": post.title,
                        "url": post.url,
                        "thumbnail": post.thumbnail_url,
                        "date": post.post_date,
                        "tags": post.tags[:3],
                        "source": source,
                    }
                )
            return validated_articles

        tag_articles = convert_articles(related_dict.get("tag_based", []))
        tfidf_articles = convert_articles(related_dict.get("tfidf_based", []))

        # バリデーション：期待される数の記事が生成されているかチェック
        if len(tag_articles) != len(related_dict.get("tag_based", [])):
            logger.warning(
                f"Tag articles validation failed: {len(related_dict.get('tag_based', []))} -> {len(tag_articles)}"
            )
        if len(tfidf_articles) != len(related_dict.get("tfidf_based", [])):
            logger.warning(
                f"TF-IDF articles validation failed: {len(related_dict.get('tfidf_based', []))} -> {len(tfidf_articles)}"
            )

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

    def __init__(self, config_path: pathlib.Path = None):
        config_path = config_path or FileManager.CONFIG_PATH
        config_data = FileManager.load_json(config_path)
        self.config = BlogConfig(config_data)
        self.file_manager = FileManager()
        self.article_builder = ArticleBuilder(self.config)
        self.external_processor = ExternalArticleProcessor()
        self.navigation_helper = NavigationHelper()
        self.template_generator = TemplateDataGenerator()

    def build_articles(
        self, article_paths: List[pathlib.Path], include_navigation: bool = True
    ) -> None:
        if HAS_TQDM:
            article_iter = tqdm.tqdm(
                article_paths, desc="Building articles", unit="article"
            )
        else:
            article_iter = article_paths

        for i, article_path in enumerate(article_iter):
            if not HAS_TQDM and i % 5 == 0:
                logger.info(f"Progress: {i+1}/{len(article_paths)}")

            try:
                self.article_builder.build_article(article_path, include_navigation)
            except Exception as e:
                logger.error(f"Failed to build {article_path}: {e}")

    def add_navigation_to_all_articles(self, article_paths: List[pathlib.Path]) -> None:
        logger.info("Adding navigation and related articles to all posts...")

        # すべての記事データを取得
        all_posts_data = self.file_manager.load_posts()
        all_posts = [BlogPost(**post_data) for post_data in all_posts_data]

        if HAS_TQDM:
            article_iter = tqdm.tqdm(
                article_paths, desc="Adding navigation", unit="article"
            )
        else:
            article_iter = article_paths

        for i, article_path in enumerate(article_iter):
            if not HAS_TQDM and i % 5 == 0:
                logger.info(f"Navigation progress: {i+1}/{len(article_paths)}")

            try:
                # 現在の記事のURLを生成
                output_path = self.article_builder.content_processor.to_outputpath(
                    article_path
                )
                url = self.config.data["root_url"] + "/posts/" + output_path.name

                # 対応する記事を見つける
                current_post = None
                for post in all_posts:
                    if post.url == url:
                        current_post = post
                        break

                if current_post:
                    self.article_builder.add_navigation_to_article(
                        current_post, output_path
                    )
                else:
                    logger.warning(f"Could not find post data for {article_path}")

            except Exception as e:
                logger.error(f"Failed to add navigation to {article_path}: {e}")

    def build_all(self) -> None:
        # ベクトルキャッシュが存在しない場合のみ事前計算
        # (GitHub Actionsでは別途事前計算ステップで実行)
        if not pathlib.Path("public/tfidf_cache.pkl").exists():
            logger.info("TF-IDF cache not found, computing vectors...")
            self.precompute_vectors()
        else:
            logger.info("TF-IDF cache found, skipping precomputation")

        # wipから始まるファイルをスキップして記事を取得（本番環境のみ）
        all_md_files = pathlib.Path("posts").glob("*.md")
        skip_wip = os.getenv("SKIP_WIP_ARTICLES", "false").lower() == "true"
        if skip_wip:
            logger.info("Skipping WIP articles (SKIP_WIP_ARTICLES=true)")
            article_paths = sorted([
                path for path in all_md_files 
                if not path.stem.startswith("wip")
            ])
        else:
            logger.info("Including WIP articles (SKIP_WIP_ARTICLES=false or not set)")
            article_paths = sorted(list(all_md_files))

        # 第1段階: ナビゲーション抜きで全記事をビルド
        logger.info("Stage 1: Building all articles without navigation...")
        self.build_articles(article_paths, include_navigation=False)

        # 外部記事も処理
        self.external_processor.process_external_articles()

        # 第2段階: 完成したposts.jsonを使って全記事にナビゲーションを追加
        logger.info("Stage 2: Adding navigation and related articles...")
        self.add_navigation_to_all_articles(article_paths)

    def precompute_vectors(self) -> None:
        try:
            from .precompute_vectors import VectorPrecomputer
        except ImportError:
            import os
            import sys

            sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            from blog_builder.precompute_vectors import VectorPrecomputer

        logger.info("Starting TF-IDF vector precomputation...")

        # 設定を取得
        tfidf_config = self.config.data.get("tfidf_config", {})

        # キャッシュが有効かチェック
        if VectorPrecomputer.is_cache_valid(tfidf_config):
            logger.info("TF-IDF cache is valid, skipping precomputation")
            return

        # ベクトルを事前計算
        precomputer = VectorPrecomputer(tfidf_config)
        precomputer.precompute_all_vectors()

        logger.info("TF-IDF vector precomputation completed")

    def build_changed(self, changed_files: List[str]) -> None:
        article_paths = [pathlib.Path(file_path) for file_path in changed_files]

        # 第1段階: ナビゲーション抜きで変更された記事をビルド
        logger.info("Building changed articles without navigation...")
        self.build_articles(article_paths, include_navigation=False)

        # 外部記事も処理
        self.external_processor.process_external_articles()

        # 第2段階: 変更された記事だけでなく、影響を受ける可能性のある全記事にナビゲーションを追加
        # （前後記事の関係が変わる可能性があるため）
        logger.info("Updating navigation for all articles...")
        # wipから始まるファイルをスキップして記事を取得（本番環境のみ）
        all_md_files = pathlib.Path("posts").glob("*.md")
        skip_wip = os.getenv("SKIP_WIP_ARTICLES", "false").lower() == "true"
        if skip_wip:
            all_article_paths = sorted([
                path for path in all_md_files 
                if not path.stem.startswith("wip")
            ])
        else:
            all_article_paths = sorted(list(all_md_files))
        self.add_navigation_to_all_articles(all_article_paths)

    def build_single_article(self, article_name: str, with_navigation: bool = True) -> None:
        # .mdが付いていない場合は追加
        if not article_name.endswith('.md'):
            article_name += '.md'
            
        article_path = pathlib.Path("posts") / article_name
        
        if not article_path.exists():
            raise BuildError(f"Article not found: {article_path}")
            
        logger.info(f"Building single article: {article_name}")
        
        # 第1段階: 記事をビルド（ナビゲーション無し）
        self.build_articles([article_path], include_navigation=False)
        
        # 外部記事も処理（posts.jsonの整合性のため）
        self.external_processor.process_external_articles()
        
        # 第2段階: ナビゲーションを追加（要求された場合）
        if with_navigation:
            logger.info("Adding navigation to the article...")
            # 対象記事のみナビゲーション更新
            self.add_navigation_to_all_articles([article_path])

    def initialize_posts_json(self) -> None:
        FileManager.save_json(FileManager.POSTS_JSON_PATH, [])
        recent_posts_path = pathlib.Path("public/recent_posts.json")
        FileManager.save_json(recent_posts_path, [])



def main() -> int:
    parser = argparse.ArgumentParser(
        description="ブログビルドシステム",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
使用例:
  # 全記事ビルド
  python3 build.py
  
  # 特定記事のみビルド
  python3 build.py --article my_article.md
  python3 build.py -a my_article
  
  # ナビゲーション無しで高速ビルド（開発用）
  python3 build.py -a my_article --no-navigation
        """
    )
    
    parser.add_argument(
        "-a", "--article",
        type=str,
        help="特定の記事のみをビルド（ファイル名を指定、.mdは省略可）"
    )
    
    parser.add_argument(
        "--no-navigation",
        action="store_true",
        help="ナビゲーションと関連記事の処理をスキップ（高速ビルド用）"
    )
    
    args = parser.parse_args()
    
    try:
        builder = BlogBuilder()
        
        # 特定記事のビルド
        if args.article:
            logger.info(f"Single article build mode: {args.article}")
            builder.build_single_article(args.article, with_navigation=not args.no_navigation)
        # 通常の全体ビルド
        elif os.getenv("REBUILD"):
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
