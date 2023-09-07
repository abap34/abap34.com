import json
import time
import datetime
import re
import sys
import requests

def get_title(output_file):
    with open(output_file, 'r') as f:
        html = f.read()
        title = re.search(r'<title>(.*)</title>', html).group(1)
        return title

def get_date(output_file):
    with open(output_file, 'r') as f:
        html = f.read()
        date = re.search(r"date = \"(\s\S.*)\"", html).group(1)
        # 余分な空白を削除
        date = date.strip()
        return date


def fetch_random_dog_image():
    url = "https://dog.ceo/api/breeds/image/random"
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()
        image_url = data["message"]
        return image_url
    else:
        raise Exception("Failed to fetch dog image")


def build_article(html_path):
    date = get_date(html_path)
    title = get_title(html_path)
    url = html_path.replace('../public/', '')
    thumbnail_url = fetch_random_dog_image()
    with open(html_path, 'r') as f:
        html = f.read()
        html = html.replace('{____THIS____IS___OGPURL___PLACE___}', thumbnail_url)
        html = html.replace('{____THIS____IS___URL___PLACE___}', url)
        with open(html_path, 'w') as f:
            f.write(html)

    


    with open('../public/posts.json', 'r') as f:
        posts = json.load(f)
        for post in posts:
            if post['title'] == title:
                updated_post = {
                    'title': title,
                    'post_date': date,
                    'url': url,
                    'thumbnail_url': thumbnail_url,
                }
                posts.remove(post)
                posts.append(updated_post)
                break
        else:
            posts.append({
                'title': title,
                'post_date': date,
                'url': url,
                'thumbnail_url': thumbnail_url,
            })

        
    with open('../public/posts.json', 'w') as f:
        json.dump(posts, f)

    posts = sorted(posts, key=lambda x: time.strptime(x['post_date'], '%Y/%m/%d'), reverse=True)

    recent_posts = posts[:5]
    with open('../public/recent_posts.json', 'w') as f:
        json.dump(recent_posts, f)

    

if __name__ == '__main__':
    output_file = sys.argv[1]
    build_article(output_file)
