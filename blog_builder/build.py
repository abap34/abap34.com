import json
import os
import pathlib
import re
import subprocess
import requests
from bs4 import BeautifulSoup


def fetch_ogp(url: str) -> tuple[str, str]:
    res = requests.get(url)
    soup = BeautifulSoup(res.text, "html.parser")

    ogp = soup.find("meta", attrs={"property": "og:image"})
    ogp_url = ogp["content"]

    title = soup.find("title").text

    return ogp_url, title


CONFIG_CORRESPONDING = {
    "overall_theme": "-t",
    "custom_css": "-c",
    "editor_theme": "-e",
    "syntax_theme": "-s",
    "template": "-b",
}


def load_json(path: pathlib.Path):
    with open(path, "r") as f:
        return json.load(f)


def load_rawtext(ir, result=""):
    if "childs" in ir.keys():
        for child in ir["childs"]:
            result += load_rawtext(child)
    else:
        if "content" in ir.keys():
            result += ir["content"]
        elif ir["class"] == "NewLine":
            result += "\n"

    return result


def to_outputpath(article_path: pathlib.Path):
    return pathlib.Path("public/posts/" + article_path.stem + ".html")


def to_interimpath(article_path: pathlib.Path):
    return pathlib.Path("public/posts/" + article_path.stem + ".md")


OGP_TEMPLATE = """
<div class="responsive-card">
    <img src="{img_url}">
    <div style="margin: 0 10px 0 10px;">
         <a href="{url}"">{title}</a>
    </div>
</div>
"""


def replace_ogp_url(content: str, ignore_petterns: list[re.Pattern] = []):
    excluded_spans = []
    for pattern in ignore_petterns:
        for match in pattern.finditer(content):
            excluded_spans.append((match.start(), match.end()))
    excluded_spans.sort(key=lambda x: x[0])

    def is_excluded(start, end):
        for span_start, span_end in excluded_spans:
            if start >= span_start and end <= span_end:
                return True
        return False

    ogp_pattern = re.compile(r"{@ogp\s+(.*?)\s*}")

    def replacement(match):
        start, end = match.span()
        if is_excluded(start, end):
            return match.group(0)
        ogp_url = match.group(1)
        url, title = fetch_ogp(ogp_url)
        return OGP_TEMPLATE.format(img_url=url, url=ogp_url, title=title)

    return ogp_pattern.sub(replacement, content)


IGNORE_PATTERNS = [
    re.compile(r"```.*?```", re.DOTALL),
    re.compile(r"`.*?`"),
    re.compile(r"<!--.*?-->"),
]


def build_article(config: dict, article_path: pathlib.Path):
    outputpath = to_outputpath(article_path)
    interimpath = to_interimpath(article_path)

    print("Building article: " + article_path.stem)
    print(f"outputpath: {outputpath}")
    print(f"interimpath: {interimpath}")

    subprocess.run("cp -r posts/{} public/posts/".format(article_path.stem), shell=True)

    content = article_path.read_text()
    print("replace_ogp_url...")
    content = replace_ogp_url(content, IGNORE_PATTERNS)
    print("replace_ogp_url done.")
    interimpath.write_text(content)

    cmd = "almo/build/almo {} -o {} -d".format(interimpath, outputpath)

    for key, value in CONFIG_CORRESPONDING.items():
        if key in config:
            cmd += " {} {}".format(value, config[key])

    cmd += "> tmp.json"

    print("Building article with the following command: \n" + cmd)

    subprocess.run(cmd, shell=True)

    with open("tmp.json", "r") as f:
        tmp = json.load(f)
        title = tmp["meta"]["title"]
        date = tmp["meta"]["date"]
        ogp_url = tmp["meta"]["ogp_url"]
        ir = tmp["ir"]
        tags = tmp["meta"]["tag"]

        if "featured" in tmp["meta"]:
            featured = tmp["meta"]["featured"]
        else:
            featured = False

    url = config["root_url"] + "/posts/" + outputpath.name

    content = load_rawtext(ir)

    tags = tags[1:-1].split(",")
    tags = [tag.strip() for tag in tags]

    with open("public/posts.json", "r") as f:
        posts = json.load(f)
        for post in posts:
            if post["url"] == url:
                updated_post = {
                    "title": title,
                    "post_date": date,
                    "url": url,
                    "thumbnail_url": ogp_url,
                    "content": content,
                    "tags": tags,
                    "featured": featured,
                }
                posts.remove(post)
                posts.append(updated_post)

                break
        else:
            posts.append(
                {
                    "title": title,
                    "post_date": date,
                    "url": url,
                    "thumbnail_url": ogp_url,
                    "content": content,
                    "tags": tags,
                    "featured": featured,
                }
            )

    posts = sorted(posts, key=lambda x: x["post_date"], reverse=True)

    with open("public/posts.json", "w") as f:
        json.dump(posts, f)


def build(config: dict, article_paths: list[pathlib.Path]):
    for article_path in article_paths:
        build_article(config, article_path)


if __name__ == "__main__":
    if os.getenv("REBUILD"):
        with open("public/posts.json", "w") as f:
            f.write("[]")
        with open("public/recent_posts.json", "w") as f:
            f.write("[]")

        config = load_json(pathlib.Path("config/config.json"))
        build(config, list(pathlib.Path("posts").glob("*.md")))

    else:
        change = load_json(pathlib.Path("changed_files.json"))
        config = load_json(pathlib.Path("config/config.json"))

        for article_path in change:
            build_article(config, pathlib.Path(article_path))
