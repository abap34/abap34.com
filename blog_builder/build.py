import mistune
import sys
import os
import yaml
import json
import time



def markdown_to_html(title, date, tags, body):
    body_html = mistune.markdown(body)
    return f'''
    <!DOCTYPE html>
    <html>
    <head>
    <meta charset=\"utf-8\">
    <title>{title}</title>
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">
    <link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/4.0.0/github-markdown.min.css\">
    <link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.1.2/styles/default.min.css\">
    <script src=\"https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.1.2/highlight.min.js\"></script>
    <script>hljs.initHighlightingOnLoad();</script>
    </head>
    <body>
    <article class=\"markdown-body\">
    <h1>{title}</h1>
    <p>{date}</p>
    <p>{tags}</p>
    {body_html}
    </article>
    </body>
    </html>
  '''


def build_article(raw_file, settings_file):
    with open(raw_file, 'r') as f:
        markdown = f.read()
    
    output_file = 'public/posts/' + markdown.split('\n')[0] + '.html'

    with open(settings_file, 'r') as f:
        data = yaml.safe_load(f)
    
    title = data['title']
    date = data['date']
    tags = data['tags']
    is_pickup = data['is_pickup']
    html = markdown_to_html(title, date, tags, mistune.markdown(markdown))
    with open(output_file, 'w') as f:
        f.write(html)
    

    with open('posts.json', 'r') as f:
        posts = json.load(f)
        posts.append({
            'title': title,
            'date': date,
            'tags': tags,
            'is_pickup': is_pickup,
            'url': output_file,
            'post_date': time.strftime('%Y-%m-%d', time.strptime(date, '%Y-%m-%dT%H:%M:%SZ'))
        })
        
    with open('posts.json', 'w') as f:
        json.dump(posts, f)

    posts = sorted(posts, key=lambda x: time.strptime(x['post_date'], '%Y-%m-%d'), reverse=True)

    recent_posts = posts[:5]
    with open('recent_posts.json', 'w') as f:
        json.dump(recent_posts, f)

    os.remove('tmp.json')
    os.remove(raw_file)
    os.remove(settings_file)

    
      

    

if __name__ == '__main__':
    raw_file = sys.argv[1]
    settings_file = sys.argv[2]

    build_article(raw_file, settings_file)
