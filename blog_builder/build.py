import json
import time
import os
import sys



def build_article(config, args):
    corresponding = {
        "overall_theme": "-t",
        "custom_css": "-c",
        "editor_theme": "-e",
        "syntax_theme": "-s",
        "template": "-b"
    }

    cmd = 'ALMO/almo {} -o {} -d'.format(args[1], args[2])

    for key, value in corresponding.items():
        if key in config:
            cmd += ' {} {}'.format(value, config[key])

    cmd += '> tmp.json 2>> build.log'

    print(
        'Building article with the following command: \n'
        + cmd
    )
    
    os.system(cmd)

    content = ''
    with open(args[2], 'r') as f:
        content = f.read()

    with open('tmp.json', 'r') as f:
        tmp = json.load(f)
        title = tmp['meta']['title']
        date = tmp['meta']['date']
        html_path = tmp['meta']['out_path']
        ogp_url = tmp['meta']['ogp_url']
    
    url = config["root_url"]  + html_path[6:]

    with open('public/posts.json', 'r') as f:
        posts = json.load(f)
        for post in posts:
            if post['title'] == title:
                updated_post = {
                    'title': title,
                    'post_date': date,
                    'url': url,
                    'thumbnail_url': ogp_url,
                    'content': content
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
                'content': content
            })

        
    posts = sorted(posts, key=lambda x: time.strptime(x['post_date'], '%Y/%m/%d'), reverse=True)

    with open('public/posts.json', 'w') as f:
        json.dump(posts, f)


    recent_posts = posts[:5]
    with open('public/recent_posts.json', 'w') as f:
        json.dump(recent_posts, f)

    with open('public/posts.html', 'r') as f:
        html = f.read()
    
    html = html.replace('{{blog_name}}', config["blog_name"])
    with open('public/posts.html', 'w') as f:
        f.write(html)



if __name__ == '__main__':
    config = json.load(open('config/config.json', 'r'))
    build_article(config, sys.argv)
