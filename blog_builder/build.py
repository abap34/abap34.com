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
        date = re.search(r"<div class=\"date\"> Date:  (.*) </div>", html).group(1)
        return date

def add_tweet_button(output_file):
    BUTTON = """
    
<style>
    .back {
        position: fixed;
        bottom: 10px;
        right: 10px;
        font-size: 14px;
        font-weight: bold;
        color: #666;
        border: 1px solid #333;
        padding: 10px 20px;
        border-radius: 25px;
        text-decoration: none;
    }
    
</style>

<br>
<a href="https://www.abap34.com/posts.html" class="back">記事一覧にもどる</a>
<a href="https://twitter.com/share?ref_src=twsrc%5Etfw" class="twitter-share-button" data-show-count="false">Tweet</a>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
<footer>
    <p>&copy; 2023 abap34</p>
</footer>
"""
    with open(output_file, 'r') as f:
        html = f.read()
        html = html.replace('</body>', BUTTON + '</body>')
    with open(output_file, 'w') as f:
        f.write(html)

def add_ogp(output_file, image_url):
    title = get_title(output_file)
    ogp = f"""
<meta property="og:title" content="{title}">
<meta property="og:image" content="{image_url}">
<meta property="og:description" content="abap34's blog">
<meta property="og:site_name" content="abap34's blog">
<meta property="og:locale" content="ja_JP">
<meta name="twitter:card" content="summary">
<meta name="twitter:site" content="@abap34">
"""

    with open(output_file, 'r') as f:
        html = f.read()
        html = html.replace('</head>', ogp + '</head>')

    with open(output_file, 'w') as f:
        f.write(html)



def fetch_random_dog_image():
    url = "https://dog.ceo/api/breeds/image/random"
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()
        image_url = data["message"]
        return image_url
    else:
        raise Exception("Failed to fetch dog image")


def build_article(out_file):
    date = get_date(out_file)
    title = get_title(out_file)
    add_tweet_button(out_file)
    output_file = out_file.replace('../public/', '')
    thumbnail_url = fetch_random_dog_image()
    add_ogp(out_file, thumbnail_url)

    with open('../public/posts.json', 'r') as f:
        posts = json.load(f)
        for post in posts:
            if post['title'] == title:
                updated_post = {
                    'title': title,
                    'post_date': date,
                    'url': output_file,
                    'thumbnail_url': thumbnail_url,
                }
                posts.remove(post)
                posts.append(updated_post)
                break
        else:
            posts.append({
                'title': title,
                'post_date': date,
                'url': output_file,
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
