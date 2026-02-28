---
title: CMS を作ったので雑な記事を書いていきます
author: abap34
date: 2026/02/28
tag: [日記]
twitter_id: abap34
github_id: abap34
mail: abap0002@gmail.com
ogp_url: 
description: スマホから投稿できるように CMS を作ったので雑な記事を書いていこうと思います．
url: https://abap34.com/posts/cms.html
site_name: abap34's blog
twitter_site: @abap34
featured: false
---

## あらすじ

![](https://abap34.com/posts/cms/IMG_7533.png)

近年、Twitter の @abap34 のアカウントが周りに広まりつつあり、余計なことが書けなくなってしまいました。その対策として、ブログをもう少しラフに書けるようにしようと思い、スマホからでも気軽に投稿できるように CMS を (Claude が) 作りました。



<div class="link-card">
    <a href="https://github.com/abap34/cms.abap34.com" target="_blank" rel="noopener noreferrer" class="link-card-container">
        <div class="link-card-image">
            <img src="https://opengraph.githubassets.com/61991a6eb33a49e425b27f739d376b37d30e26efb3e94a6e2dc03db4fd155f21/abap34/cms.abap34.com" alt="GitHub - abap34/cms.abap34.com" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik00MCA0MEg4MFY4MEg0MFY0MFoiIHN0cm9rZT0iI0NDQyIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNTUiIHI9IjUiIGZpbGw9IiNDQ0MiLz4KPHA+PC9wYXRoPgo8cGF0aCBkPSJNNDUgNjVMNTUgNzVMNzUgNTUiIHN0cm9rZT0iI0NDQyIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+Cjwvc3ZnPgo='" loading="lazy">
        </div>
        <div class="link-card-content">
            <div>
                <div class="link-card-header">
                    <img src="https://github.com/fluidicon.png" alt="" class="link-card-favicon" onerror="this.style.display='none'">
                    <span class="link-card-domain">GitHub</span>
                </div>
                <h3 class="link-card-title">GitHub - abap34/cms.abap34.com</h3>
                <p class="link-card-description">Contribute to abap34/cms.abap34.com development by creating an account on GitHub.</p>
            </div>
            <div class="link-card-footer">
                <span class="link-card-url">github.com/abap34/cms.abap34.com</span>
                
            </div>
        </div>
    </a>
</div>



このブログは almo という自作の (変な) C++ 製の md2html を GitHub Actions で動かして GitHub 上に直接コンテンツを 置いて Vercel でホストするという構成です。


正直多少のサーバ代はそんなに気にしていませんが、維持作業が面倒なのでなるべくクライアントで完結させたいと思っています。

そのため、Emscripten で .wasm にコンパイルしてクライアント側でパースと表示までさせています。

コンテンツも変わらず GitHub 上で管理しています。普通にログインさせ、変更をコミット、Publish ボタンで PR作成 → Merge という形です。ただ画像だけはさすがにそのうちなんとかする必要はあるかなといった感じです。


PWA 化してスマホでも執筆体験はかなり良好です。


![電池がやばい](https://abap34.com/posts/cms/IMG_7535.png)
![プレビュー](https://abap34.com/posts/cms/IMG_7536.png)

なんなら標準のメモアプリよりこっちの方が使いやすいまである。

今後は例えば (非技術書も含めて) 最近読んだ本、みたいな今までだと Twitter に行っていた話を雑に書いていこうと思います。見逃すな 🫵⭐️ 

RSS: [https://www.abap34.com/rss.xml](https://www.abap34.com/rss.xml)


