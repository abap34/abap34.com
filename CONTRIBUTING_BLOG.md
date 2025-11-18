# 寄稿したい方へ

`./gen.sh {記事のid}.md` すると `posts/{記事のid}.md` , `posts/{記事のid}/` ができます.

md ファイルは頭に

```
---
title: 
author: 
date: 
tag: 
twitter_id: 
github_id: 
mail:
ogp_url: 
description: 
url: 
site_name: 
twitter_site:
---
```

みたいなのがあります。 url, site_name は触らなくても大丈夫です。

あとは適切に設定してください。

(`posts/{記事のid}/image.png` は `abap34.com/posts/{記事のid}/image.png` になるのでそこに画像を置いてサムネイルにするといいです)

`posts/` 以下の md ファイルが main に push されると記事が publish されます。

記事が書けたら main に PR を送ってください。

