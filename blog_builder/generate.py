# /// script
# dependencies = [
#     "requests",
# ]
# ///
"""記事テンプレート生成スクリプト"""

import json
import logging
import os
import pathlib
import sys
from datetime import datetime
from typing import Dict, Any

import requests

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class FileAlreadyExistsError(Exception):
    """ファイルが既に存在する場合のエラー"""
    pass


class ConfigError(Exception):
    """設定ファイルエラー"""
    pass


FRONTMATTER_TEMPLATE = """---
title: 
author: {author}
date: {date}
tag: 
twitter_id: {twitter_id}
github_id: {github_id}
mail: {mail}
ogp_url: {ogp_url}
description: 
url: {root_url}/posts/{basename}.html
site_name: {blog_name}
twitter_site: @{twitter_id}
---
"""



def generate_ogp_url() -> str:
    """ランダムなOGP用画像URLを生成"""
    try:
        response = requests.get(
            'https://dog.ceo/api/breeds/image/random',
            timeout=10
        )
        response.raise_for_status()
        return response.json()['message']
    except Exception as e:
        logger.warning(f"Failed to fetch random dog image: {e}")
        return ""


def load_config(config_path: pathlib.Path = pathlib.Path("config/config.json")) -> Dict[str, Any]:
    """設定ファイルを読み込み"""
    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        raise ConfigError(f"設定ファイルが見つかりません: {config_path}")
    except json.JSONDecodeError as e:
        raise ConfigError(f"設定ファイルの形式が正しくありません: {e}")


def create_article(config: Dict[str, Any], filename: str) -> None:
    """記事テンプレートを作成"""
    if not filename.endswith('.md'):
        filename += '.md'
    
    article_path = pathlib.Path("posts") / filename
    
    if article_path.exists():
        raise FileAlreadyExistsError(f"記事のファイル名が重複しています: {filename}")
    
    # 記事用ディレクトリを作成
    basename = article_path.stem
    asset_dir = pathlib.Path("posts") / basename
    asset_dir.mkdir(parents=True, exist_ok=True)
    
    # .gitkeepファイルを作成
    gitkeep_path = asset_dir / ".gitkeep"
    gitkeep_path.touch()
    
    # フロントマターを生成
    template_data = {
        **config,
        "ogp_url": generate_ogp_url(),
        "date": datetime.now().strftime('%Y/%m/%d'),
        "basename": basename
    }
    
    frontmatter = FRONTMATTER_TEMPLATE.format_map(template_data)
    
    # 記事ファイルを作成
    with open(article_path, 'w', encoding='utf-8') as f:
        f.write(frontmatter)
    
    logger.info(f"記事テンプレートが作成されました: {filename}")


def main() -> None:
    """メイン関数"""
    try:
        config = load_config()
        
        if len(sys.argv) < 2:
            logger.error("記事のファイル名を指定してください")
            sys.exit(1)
        elif len(sys.argv) > 2:
            logger.error("不正な引数です. 第一引数として記事のファイル名を指定してください")
            sys.exit(1)
        
        filename = sys.argv[1]
        create_article(config, filename)
        
    except ConfigError as e:
        logger.error(f"設定エラー: {e}")
        sys.exit(1)
    except FileAlreadyExistsError as e:
        logger.error(f"ファイルエラー: {e}")
        sys.exit(1)
    except Exception as e:
        logger.error(f"予期しないエラー: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
