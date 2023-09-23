import json
import time
import datetime
import re
import sys
import requests


def build_article():
    # read tmp.json
    with open('tmp.json', 'r') as f:
        tmp = json.load(f)
        print(tmp)
        title = tmp['meta']['title']
        date = tmp['meta']['date']
        html_path = tmp['meta']['out_path']
        ogp_url = tmp['meta']['ogp_url']

    back_to_home = '<a href="https://www.abap34.com/posts.html">  ⇨ 投稿一覧へ </a> \n <br>'
    

    with open(html_path, 'r') as f:
        # insert back_to_home in <div class='links'>
        html = f.read()
        html = html.replace('<div class="links">', '<div class="links">' + back_to_home)
    
    with open(html_path, 'w') as f:
        f.write(html)

    url = 'https://abap34.com/posts/' + html_path.replace('../public/posts/', '')


    with open('../public/posts.json', 'r') as f:
        posts = json.load(f)
        for post in posts:
            if post['title'] == title:
                updated_post = {
                    'title': title,
                    'post_date': date,
                    'url': url,
                    'thumbnail_url': ogp_url,
                }
                posts.remove(post)
                posts.append(updated_post)
                break
        else:
            posts.append({
                'title': title,
                'post_date': date,
                'url': url,
                'thumbnail_url': ogp_url,

            })
        
    with open('../public/posts.json', 'w') as f:
        json.dump(posts, f)

    posts = sorted(posts, key=lambda x: time.strptime(x['post_date'], '%Y/%m/%d'), reverse=True)

    recent_posts = posts[:5]
    with open('../public/recent_posts.json', 'w') as f:
        json.dump(recent_posts, f)

    

if __name__ == '__main__':
    build_article()
