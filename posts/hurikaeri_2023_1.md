---
title: 2023年度後期振り返り
author: abap34
date: 2024/03/24
tag: tag: [日記, 振り返り]
twitter_id: abap34
github_id: abap34
mail: abap0002@gmail.com
ogp_url: https://images.dog.ceo/breeds/spitz-japanese/tofu.jpg
description: 
url: https://abap34.com/posts/hurikaeri_2023_1.html
site_name: abap34's blog
twitter_site: @abap34
---

# 2023年度後期の振り返り

2023年度・学部2年生もほぼ終わりました。

とりあえず振り返っておきます。

## JuliaTokyo11

<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">今日の JuliaTokyo でのトーク、「Juliaで歩く自動微分」のスライドをアップしました！ <br>- DLフレームワークの中身が気になる方<br>- 何もかも勾配降下法で最適化したい方<br>- 低レイヤと機械学習の絡みが気になる方<br>はぜひ！！<a href="https://twitter.com/hashtag/juliatokyo?src=hash&amp;ref_src=twsrc%5Etfw">#juliatokyo</a><a href="https://t.co/XZ8ovEJvvs">https://t.co/XZ8ovEJvvs</a></p>&mdash; abap34 (@abap34) <a href="https://twitter.com/abap34/status/1753681336702009787?ref_src=twsrc%5Etfw">February 3, 2024</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

まずは JuliaTokyo #11 です。 30分トーク枠で自動微分について話しました。


Juliaコンパイラを作っている [@aviatesk](https://github.com/aviatesk) さんに懇親会とその後 Twitterで褒めてもらえたのが嬉しかったです。


Juilaの対面のイベントは5年前、高校1年生の時のJuliaTokai以来だったですが、いろんな人に再会できてとても楽しかったです。

最近は Juliaの日本語コミュニティが Discordで発足して割と動いていたり、コミュニティが活性化していてなんかいい感じです。


自分も Juliaのコミュニティに育てられたので、色々と還元できるように頑張ります。

## ALMO関連
振り返ってみると、後期は結構ALMOの開発にリソース使ってました。

このブログを動かしてるので、欲しい機能を追加し続けていく過程で色々やっていたみたいです。

例えば [https://github.com/abap34/ALMO-extension](https://github.com/abap34/ALMO-extension) はALMOのVSCode拡張です。

他にも [https://github.com/abap34/ALMO-blog-template](https://github.com/abap34/ALMO-blog-template) とかもあります。
ぽちぽちでブログが作れるやつです。


本体も結構アップデートされています。 リリースは 20回を超えて v0.7.0 まできました。 
[https://github.com/abap34/ALMO/releases](https://github.com/abap34/ALMO/releases)

ひとまず今の issue を全て片付けて、 v1 のリリースを目指しています。

![https://github.com/abap34/ALMO-extension によるプレビュー](https://github.com/abap34/ALMO-extension/raw/main/assets/almo-ext-demo.gif)


ついでにこのブログ自体にも、

- 記事の検索機能
- タグ機能
- RSS

などなどついて結構便利になりました。

トップページとかのデザインも割と綺麗になった気がします。

## Minia.jl
Juliaで書いた処理系です。

PEGで構文を書いて、JuiaのASTに変換して実行するみたいなやつです。 


<a href="https://github.com/abap34/Minia.jl"><img src="https://gh-card.dev/repos/abap34/Minia.jl.svg"></a>


どちらかというと、付随して書いた [3時間で作る自作言語のJuliaトランスパイラ](https://www.abap34.com/posts/mini-lang.html) の評判が良かったです。

それと、 Miniaのパーサは PEG.jl という既存のパーサジェネレータを使っているのですが、せっかくなのでこれも自前で書きました。


これもブログの [【週刊 PEGパーサジェネレータ を作ろう】](https://www.abap34.com/posts/tinypeg.html) の方が価値がある気がしますが...

## atmaCup

[atmaCup #16 in collaboration with RECRUIT](https://www.guruguru.science/competitions/22) に参加しました。

宿のレコメンドというタスクでしたが、ユーザの行動履歴が短く、めちゃくちゃむずかしかったです。

学生枠でなんとか入賞して表彰式に参加させていただいたんですが、懇親会で色々な方と交流できてめちゃくちゃよかったです！

![懇親会で普通に職人さんが寿司を握っていて嘘だろと思いました](hurikaeri_2023_1/sushi.png)

## age++

ついに 20歳になりました。


祝ってもらいました。マジで恵まれてるなぁと言う感じです。

周りの全部の人に感謝してます。

![](hurikaeri_2023_1/20party.png)

ぜひ🍺誘ってください。




## その他・大学など
- 2回目の作問ハッカソンで作問をしました。 一回目は [†連続最適化な見た目の問題†](https://yukicoder.me/problems/no/2438) を出したので、今回は [†離散最適化†な問題](https://yukicoder.me/problems/10681) になりました。
- 最近スライドを作る機会が多かったので、いい感じのテンプレを作ったら QoL があがりました。 
   <a href="https://github.com/abap34/slide-template"><img src="https://gh-card.dev/repos/abap34/slide-template.svg"></a>
- 大学では、ドイツ語のやる気が出ないことが確実視されたので、履修登録から抹消して代わりに3年次の文系教養の履修を済ませました。
  - これで3年次はドイツ語にさえ集中すればいいわけですが、一年間やる気が出なかった科目に来年度やる気が出るかは不明です。
- 全国医療AIコンテストに参加しました...とは言っても参加した頃には LBでかなり差が開いていて意気消沈状態でした。1subだけして撤退してしまったのですが、
  セグメンテーションのコンペはやったことなかったのと、monaiは初めて使ったのでこれに詳しくなれたのはとてもよかったです。
  - コンペをやっていていい感じに NIfTIをプレビューするツールがなかったので試作したりしました。 速度をマシにしたら公開します。
  - <blockquote class="twitter-tweet"><p lang="ja" dir="ltr">医療AIコンやってて、NIfTI 画像をコマンドライン一発でプレビューできるツールでいい感じのがなかったのが不満でチャッと実装してみた<br>sixel と格闘してたものの全然うまくいかなかったので一旦 GUI版で... 便利！<br>(実際はロード時間が結構かかっているのでいい感じに爆速にして公開したい) <a href="https://t.co/Z6pqseeCll">pic.twitter.com/Z6pqseeCll</a></p>&mdash; abap34 (@abap34) <a href="https://twitter.com/abap34/status/1771371540514247088?ref_src=twsrc%5Etfw">March 23, 2024</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
- 大学で所属しているサークルで「Kaggle班」を立ち上げました。昨年度も色々やってきましたが、今年も面白いことができるよう運営を頑張ります。

# 2024年度の抱負

ついに学部3年生になります。

学部生も折り返しですが、一応卒業要件的なのは大丈夫そうでホッとしています。


目標は色々ありますが、

- Kaggle班運営を軌道に乗せる
- OSS Contribution を積極的にやる

あたりはやりたいところです。

技術面での目標ですが、
特に最近はCSのいろんなことが面白くて色々やっていて、多分来年も同じ調子だと思うので、
そのとき興味あることをちゃんとできればと思います。

なので　**手を動かす！！** ことを忘れずスーパー最強エンジニアになるぞ〜〜


## 今日の一曲

<iframe width="560" height="315" src="https://www.youtube.com/embed/yuNOotQ6mNU?si=wBDdwOiWOuw6o40R" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>