# /// script
# dependencies = []
# ///
"""RSS feed generator for blog posts"""

import json
import logging
import pathlib
from datetime import datetime
from typing import List, Dict, Any

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class RSSGeneratorError(Exception):
    """RSS生成エラー"""
    pass


class RSSGenerator:
    """RSS feed generator"""
    
    RSS_TEMPLATE = """<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>abap34's blog</title>
<link>https://abap34.com/blog</link>
<description>abap34's blog</description>
<language>ja</language>
<lastBuildDate>{last_build_date}</lastBuildDate>
{items}
</channel>
</rss>
"""

    ITEM_TEMPLATE = """<item>
<guid>{url}</guid>
<title>{title}</title>
<link>{url}</link>
<pubDate>{date}</pubDate>
<author>@abap34</author>
<description>{description}</description>
</item>
"""

    def __init__(self, posts_file: pathlib.Path = pathlib.Path("public/posts.json")):
        self.posts_file = posts_file
    
    def load_posts(self) -> List[Dict[str, Any]]:
        """記事データを読み込み"""
        try:
            with open(self.posts_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            raise RSSGeneratorError(f"記事ファイルが見つかりません: {self.posts_file}")
        except json.JSONDecodeError as e:
            raise RSSGeneratorError(f"記事ファイルの形式が正しくありません: {e}")
    
    def format_date(self, date_str: str) -> str:
        """日付をRFC822形式にフォーマット"""
        try:
            date_obj = datetime.strptime(date_str, '%Y/%m/%d')
            return date_obj.strftime('%a, %d %b %Y %H:%M:%S +0000')
        except ValueError:
            logger.warning(f"Invalid date format: {date_str}")
            return datetime.now().strftime('%a, %d %b %Y %H:%M:%S +0000')
    
    def generate_rss(self, output_file: pathlib.Path = pathlib.Path("public/rss.xml")) -> None:
        """RSS feedを生成"""
        posts = self.load_posts()
        
        # 外部記事を除外し、最新の記事のみを取得
        internal_posts = [post for post in posts if not post.get('external', False)]
        
        # 最新20件に制限
        recent_posts = internal_posts[:20]
        
        items = []
        for post in recent_posts:
            title = post.get('title', 'Untitled')
            url = post.get('url', '')
            date_str = post.get('post_date', '')
            description = post.get('content', '')[:500] + '...' if len(post.get('content', '')) > 500 else post.get('content', '')
            
            item = self.ITEM_TEMPLATE.format(
                title=self._escape_xml(title),
                url=url,
                date=self.format_date(date_str),
                description=self._escape_xml(description)
            )
            items.append(item)
        
        # RSS XML生成
        last_build_date = datetime.now().strftime('%a, %d %b %Y %H:%M:%S +0000')
        rss_content = self.RSS_TEMPLATE.format(
            items='\n'.join(items),
            last_build_date=last_build_date
        )
        
        # ファイルに書き込み
        try:
            output_file.parent.mkdir(parents=True, exist_ok=True)
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(rss_content)
            logger.info(f"RSS feed generated: {output_file}")
        except Exception as e:
            raise RSSGeneratorError(f"RSS書き込みエラー: {e}")
    
    def _escape_xml(self, text: str) -> str:
        """XML用文字エスケープ"""
        return (text
                .replace('&', '&amp;')
                .replace('<', '&lt;')
                .replace('>', '&gt;')
                .replace('"', '&quot;')
                .replace("'", '&#39;'))


def main() -> None:
    """メイン関数"""
    try:
        generator = RSSGenerator()
        generator.generate_rss()
    except RSSGeneratorError as e:
        logger.error(f"RSS生成エラー: {e}")
        return 1
    except Exception as e:
        logger.error(f"予期しないエラー: {e}")
        return 1
    return 0


if __name__ == '__main__':
    exit(main())


