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

    with open('tmp.json', 'r') as f:
        tmp = json.load(f)
        print(tmp)
        title = tmp['meta']['title']
        date = tmp['meta']['date']
        html_path = tmp['meta']['out_path']
        ogp_url = tmp['meta']['ogp_url']

    back_to_home = '<a href=\"' + config["root_url"] + '/posts.html\">  ⇨ 投稿一覧へ </a> \n <br> <br> <br> <br>'
    

    with open(html_path, 'r') as f:
        html = f.read()
        html = html.replace('<div class="links">', '<div class="links">' + back_to_home)
    
    with open(html_path, 'w') as f:
        f.write(html)
    
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
