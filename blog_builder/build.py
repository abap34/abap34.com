import json
import subprocess
import pathlib
import os

CONFIG_CORRESPONDING = {
    "overall_theme": "-t",
    "custom_css": "-c",
    "editor_theme": "-e",
    "syntax_theme": "-s",
    "template": "-b"
}


def load_json(path: pathlib.Path):
    with open(path, 'r') as f:
        return json.load(f)


def load_rawtext(ir, result=''):
    if 'childs' in ir.keys():
        for child in ir['childs']:
            result += load_rawtext(child)
    else:
        if 'content' in ir.keys():
            result += ir['content']
        elif ir['class'] == 'NewLine':
            result += '\n'

    return result


def to_outputpath(article_path: pathlib.Path):
    return pathlib.Path(
        'public/posts/'
        + article_path.stem
        + '.html'
    )


def build_article(config: dict, article_path: pathlib.Path):
    outputpath = to_outputpath(article_path)

    subprocess.run(
        'cp -r posts/{} public/posts/'.format(article_path.stem),
        shell=True
    )

    cmd = 'almo {} -o {} -d'.format(article_path, outputpath)

    for key, value in CONFIG_CORRESPONDING.items():
        if key in config:
            cmd += ' {} {}'.format(value, config[key])

    cmd += '> tmp.json 2>> build.log'

    print(
        'Building article with the following command: \n'
        + cmd
    )

    subprocess.run(cmd, shell=True)

    with open('tmp.json', 'r') as f:
        tmp = json.load(f)
        title = tmp['meta']['title']
        date = tmp['meta']['date']
        ogp_url = tmp['meta']['ogp_url']
        ir = tmp['ir']
        tags = tmp['meta']['tag']

    url = config["root_url"]  + outputpath.as_posix()
    content = load_rawtext(ir)

    tags = tags[1:-1].split(',')
    tags = [tag.strip() for tag in tags]

    with open('public/posts.json', 'r') as f:
        posts = json.load(f)
        for post in posts:
            if post['url'] == url:
                updated_post = {
                    'title': title,
                    'post_date': date,
                    'url': url,
                    'thumbnail_url': ogp_url,
                    'content': content,
                    'tags': tags
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
                'content': content,
                'tags': tags
            })

    posts = sorted(posts, key=lambda x: x['post_date'], reverse=True)

    with open('public/posts.json', 'w') as f:
        json.dump(posts, f)


def build(config: dict, article_paths: list[pathlib.Path]):
    for article_path in article_paths:
        build_article(config, article_path)


if __name__ == '__main__':
    if os.getenv('REBUILD'):
        with open('public/posts.json', 'w') as f:
            f.write('[]')
        with open('public/recent_posts.json', 'w') as f:
            f.write('[]')

        config = load_json(pathlib.Path('config/config.json'))
        build(config, list(pathlib.Path('posts').glob('*.md')))
        
    else:
        change = load_json(pathlib.Path('changed_files.json'))
        config = load_json(pathlib.Path('config/config.json'))

        for article_path in change:
            build_article(config, pathlib.Path(article_path))

    