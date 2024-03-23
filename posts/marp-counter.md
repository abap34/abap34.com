---
title: marp で counter が使えない
author: abap34
date: 2024/01/05
tag: [日記]
twitter_id: abap34
github_id: abap34
mail: abap0002@gmail.com
ogp_url: https://images.dog.ceo/breeds/clumber/n02101556_6170.jpg
description: 
url: https://abap34.com/posts/marp-counter.html
site_name: abap34.com
twitter_site: @abap34
---

# marp で counter が使えない

普段は marp でスライドを作っています。

数学チックな長めなスライドを作っていたので定理に番号をつけたくなりテーマに counter を追加しました。

```css
body {
  counter-reset: def-counter;
}

.def {
  counter-increment: def-counter;
}
```


↑ こういうの

でもこれはうまく動きません

![](marp-counter/img.png)

調べてみると、 marp は各ページが `foreignObject` で囲まれているので、 `counter` を `body` でリセットしても共有できないようです。

そんな....


諦めて手で書きましょう.


    