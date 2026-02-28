---
title: CMS を作ったので雑な記事を書いていきます
author: abap34
date: 2026/02/28
tag: [日記]
twitter_id: abap34
github_id: abap34
mail: abap0002@gmail.com
ogp_url: 
description: 
url: https://abap34.com/posts/cms.html
site_name: abap34's blog
twitter_site: @abap34
featured: false
---

## あらすじ

![](https://abap34.com/posts/cms/IMG_7533.png)

近年 @abap34 のアカウントが周りに広まりつつあり、余計なことが書けなくなってしまいました。その対策として、ブログをもう少しラフに書けるようにしようと思い、スマホからでも気軽に投稿できるように CMS を (Claude が) 作りました。


{@ogp https://github.com/abap34/cms.abap34.com}


このブログは almo という自作の (変な) C++ 製の md2html を GitHub Actions で動かしてホストされています。そのため、Emscripten で .wasm にコンパイルしてクライアント側でパースと表示までできます。


正直多少のサーバ代はそんなに気にしていませんが、維持作業が面倒なのでなるべくクライアントで完結させたいと思っています。そのため、コンテンツは変わらず GitHub 上で管理しています。普通にログインさせ、変更をコミット、Publish ボタンで PR作成 → Merge という形です。ただ画像だけはそのうちなんとかする必要はあるかなといった感じです。


PWA 化して執筆体験はかなり良好です。



なんなら標準のメモアプリよりこっちの方が使いやすいまである。

今後は例えば (非技術書も含めて) 最近読んだ本、みたいな今までだと Twitter に行っていた話を雑に書いていこうと思います。見逃すな 🫵⭐️ 

RSS: [https://www.abap34.com/rss.xml](https://www.abap34.com/rss.xml)


