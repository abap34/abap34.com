import json
import logging
import os
import pathlib
import re
import subprocess
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple

import requests
from bs4 import BeautifulSoup

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


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
            logger.error(f"File not found: {path}")
            return {}
        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error in {path}: {e}")
            return {}

    @staticmethod
    def save_json(path: pathlib.Path, data: Any) -> None:
        """JSONファイルに保存"""
        try:
            with open(path, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
        except Exception as e:
            logger.error(f"Error saving JSON to {path}: {e}")

    @staticmethod
    def load_posts() -> List[Dict[str, Any]]:
        """記事一覧を読み込み"""
        return FileManager.load_json(FileManager.POSTS_JSON_PATH)

    @staticmethod
    def save_posts(posts: List[BlogPost]) -> None:
        """記事一覧を保存"""
        posts_data = [post.__dict__ for post in posts]
        FileManager.save_json(FileManager.POSTS_JSON_PATH, posts_data)


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
        try:
            res = requests.get(url, timeout=10)
            soup = BeautifulSoup(res.text, "html.parser")

            ogp = soup.find("meta", attrs={"property": "og:image"})
            ogp_url = ogp["content"] if ogp and "content" in ogp.attrs else ""

            title = soup.find("title").text if soup.find("title") else url

            return ogp_url, title
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
        logger.info("Processing OGP URLs...")
        content = self.ogp_processor.replace_ogp_url(content)
        logger.info("OGP processing complete.")
        return content

    def build_with_almo(
        self, interim_path: pathlib.Path, output_path: pathlib.Path
    ) -> Dict[str, Any]:
        """Almoを使用してビルド"""
        cmd = ["almo/build/almo", str(interim_path), "-o", str(output_path), "-d"]
        cmd.extend(self.config.get_almo_args())
        cmd.extend([">", "tmp.json"])

        cmd_str = " ".join(cmd)
        logger.info(f"Building with command: {cmd_str}")

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

        logger.info(f"Building article: {article_path.stem}")
        logger.info(f"Output path: {output_path}")
        logger.info(f"Interim path: {interim_path}")

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

        # 前後の記事を取得
        prev_post, next_post = NavigationHelper.find_adjacent_articles(post, all_posts)
        navigation_data = TemplateDataGenerator.generate_navigation_data(
            prev_post, next_post
        )

        # 関連記事を取得
        related_posts = NavigationHelper.find_related_articles(post, all_posts)
        logger.info(f"Found {len(related_posts)} related articles")
        related_data = TemplateDataGenerator.generate_related_articles_data(
            related_posts
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

            # プレースホルダーを置換
            html_content = html_content.replace("{{navigation}}", navigation_html)
            html_content = html_content.replace(
                "{{related_articles}}", related_articles_html
            )

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
        """関連記事のHTMLを生成（シンプルなリストスタイル）"""
        if not related_data.get("has_related"):
            return ""

        html = ['<div class="related-articles">']
        html.append('<h3 class="related-title">関連記事</h3>')

        for article in related_data["related_articles"]:
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

        for article_data in external_articles:
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
        current_post: BlogPost, all_posts: List[BlogPost], max_count: int = 5
    ) -> List[BlogPost]:
        """タグベースで関連記事を取得"""
        if not current_post.tags:
            return []

        # 現在の記事を除外
        other_posts = [post for post in all_posts if post.url != current_post.url]

        # タグの一致度でスコアリング
        scored_posts = []
        for post in other_posts:
            if not post.tags:
                continue

            # 共通タグ数を計算
            common_tags = set(current_post.tags) & set(post.tags)
            if common_tags:
                score = len(common_tags)
                scored_posts.append((score, post))

        # スコア順にソートして上位を返す
        scored_posts.sort(key=lambda x: x[0], reverse=True)
        return [post for _, post in scored_posts[:max_count]]


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
    def generate_related_articles_data(related_posts: List[BlogPost]) -> Dict[str, Any]:
        """関連記事用データを生成"""
        return {
            "has_related": len(related_posts) > 0,
            "related_articles": [
                {
                    "title": post.title,
                    "url": post.url,
                    "thumbnail": post.thumbnail_url,
                    "date": post.post_date,
                    "tags": post.tags[:3],  # 最大3つのタグまで表示
                }
                for post in related_posts
            ],
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
        for article_path in article_paths:
            try:
                self.article_builder.build_article(article_path)
            except Exception as e:
                logger.error(f"Failed to build article {article_path}: {e}")

    def build_all(self) -> None:
        """全記事をビルド"""
        article_paths = list(pathlib.Path("posts").glob("*.md"))
        self.build_articles(article_paths)
        self.external_processor.process_external_articles()

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


if __name__ == "__main__":
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
    except Exception as e:
        logger.error(f"Build failed: {e}")
        raise
