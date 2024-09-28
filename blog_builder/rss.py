# read public/posts.json and build RSS feed

import json
import datetime


RSS_TEMPLATE = """<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
<title> abap34's blog </title>
<link> https://abap34.com/blog </link>
<description> abap34's blog </description>
{items}
</channel>
</rss>
"""

ITEM_TEMPLATE = """
<item>
<id>{id}</id>
<title>{title}</title>
<link>{url}</link>
<pubDate>{date}</pubDate>
<author>@abap34</author>
</item>
"""


def main():
    with open('public/posts.json', 'r') as f:
        posts = json.load(f)

    items = ''

    for post in posts:
        items += ITEM_TEMPLATE.format(
            id=post['title'],
            title=post['title'],
            url=post['url'],
            date=datetime.datetime.strptime(post['post_date'], '%Y/%m/%d').strftime('%a, %d %b %Y %H:%M:%S +0000')
        )

    rss = RSS_TEMPLATE.format(items=items)

    with open('public/rss.xml', 'w') as f:
        f.write(rss)


if __name__ == '__main__':
    main()



