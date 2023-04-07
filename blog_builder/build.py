import mistune
import sys
import os
import yaml
import json
import time



def markdown_to_html(title, date, tags, body):
    body = body.split('\n')[1:]
    body = '\n'.join(body)
    
    tags_html = "<div class=\"tags\">"
    for tag in tags:
        tags_html += f"<span class=\"tag\">{tag}</span>"
    tags_html += "</div>"

    date_html = f"<time datetime=\"{date}\">{date}</time>"

    body_html = mistune.markdown(body)


    return f"""
<!DOCTYPE html>
<html>

<head>
  <meta charset="UTF-8">
  <title>{title}</title>
  <link rel="stylesheet" href="style.css">
  <style>
    body {{
      background-color: #f5f5f5;
      color: #333;
      font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
      font-size: 14px;
      line-height: 1.42857143;
    }}

    main {{
      margin: 0 auto;
      max-width: 800px;
      padding: 0 20px;
    }}

    article {{
      margin-bottom: 20px;
    }}

    article header {{
      margin-bottom: 10px;
    }}

    article h1 {{
      font-size: 36px;
      font-weight: bold;
      margin-bottom: 10px;
    }}

    article p {{
      margin-bottom: 10px;
    }}

    article footer {{
      border-top: 1px solid #eee;
      margin-top: 10px;
      padding-top: 10px;
    }}

    article footer ul {{
      list-style: none;
      margin: 0;
      padding: 0;
    }}

    article footer li {{
      display: inline-block;
      margin-right: 20px;
    }}

    article footer li:last-child {{
      margin-right: 0;
    }}

    article footer li a {{
      color: #999;
      text-decoration: none;
    }}

    article footer li a:hover {{
      color: #333;
      text-decoration: underline;
    }}

    .tag {{
      background-color: #eee;
      border-radius: 5px;
      display: inline-block;
      font-size: 12px;
      margin-right: 5px;
      padding: 2px 5px;
    }}

    .tag:last-child {{
      margin-right: 0;
    }}

    /* responsive */
    @media (max-width: 768px) {{
    }}
  </style>
</head>

<body>
  <header>
    <p>@abap34</p>
    <a href="https://www.abap34.com/index.html">←Top</a>
  </header>
  <main>
    <article>
      <p>
        <h1>{title}</h1>
        {date_html}
        {tags_html}
        {body_html}
      </p>
    </article>
  </main>
</body>

</html>
"""


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

    html = markdown_to_html(title, date, tags, markdown)
    with open(output_file, 'w') as f:
        f.write(html)
    

    with open('public/posts.json', 'r') as f:
        posts = json.load(f)
        output_file = output_file[7:]
        date = date.split('T')[0]
        for post in posts:
            if post['title'] == title:
                updated_post = {
                    'title': title,
                    'post_date': date,
                    'tags': tags,
                    'is_pickup': is_pickup,
                    'url': output_file
                }
                posts.remove(post)
                posts.append(updated_post)
                break
        else:
            posts.append({
                'title': title,
                'post_date': date,
                'tags': tags,
                'is_pickup': is_pickup,
                'url': output_file
            })

        
    with open('public/posts.json', 'w') as f:
        json.dump(posts, f)

    posts = sorted(posts, key=lambda x: time.strptime(x['post_date'], '%Y-%m-%d'), reverse=True)

    recent_posts = posts[:5]
    with open('public/recent_posts.json', 'w') as f:
        json.dump(recent_posts, f)

    

    
      

    

if __name__ == '__main__':
    raw_file = sys.argv[1]
    settings_file = sys.argv[2]
    print('-------- build --------')
    print('read raw markdown from', raw_file)
    print('read settings from', settings_file)

    build_article(raw_file, settings_file)

    os.remove('tmp.json')
    os.remove(raw_file)
    os.remove(settings_file)