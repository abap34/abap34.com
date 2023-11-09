import json
import requests
import os
import sys
import datetime


class FileAlreadyExistsError(Exception):
    pass


def create_article(config, filename):
    ogp_url = requests.get('https://dog.ceo/api/breeds/image/random').json()['message']
    date = datetime.datetime.now().strftime('%Y/%m/%d')
    basename = os.path.splitext(os.path.basename(filename))[0]

    config["ogp_url"] = ogp_url
    config["date"] = date
    config["basename"] = basename

    head =  """---
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
""".format_map(config)

    if os.path.exists('posts-md/' + filename):
        raise FileAlreadyExistsError("記事のファイル名が重複しています")
    
    
    os.makedirs('posts-md/' + basename, exist_ok=True)

    with open('posts-md/' + filename, 'w') as f:
        f.write(head)

    print("記事テンプレートが作成されました: {}".format(filename))

if __name__ == '__main__':
    config = json.load(open('config/config.json', 'r'))

    if len(sys.argv) < 2:
        print("記事のファイル名を指定してください")
        sys.exit(1)
    elif len(sys.argv) > 2:
        print("不正な引数です. 第一引数として記事のファイル名を指定してください")
        sys.exit(1)
    else:
        filename = sys.argv[1]
        create_article(config, filename)

    