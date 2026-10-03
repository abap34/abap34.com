---
title: 2026年度　前期振り返り
author: abap34
date: 2026/10/02
tag: [日記, 振り返り]
twitter_id: abap34
github_id: abap34
mail: abap0002@gmail.com
ogp_url: https://mqxmujnlndxwmeoq.public.blob.vercel-storage.com/posts/hurikaeri_2026_0/image-20261002184809-b9d0fe8f.webp
description: 2026年度前期の振り返りです
url: https://abap34.com/posts/hurikaeri_2026_0.html
site_name: abap34's blog
twitter_site: @abap34
featured: false
---

2026年度前期の振り返りです．ブログを書くために CMS を作っていたら遅刻してしまいました．すみません．
あとそもそも去年の後期を書きそびれていました．すいません．せっかくなのでこちらにまとめて書きます (タイトル詐欺)


過去の振り返り記事は  [⇨ こちら](https://www.abap34.com/blog?tags=%E6%8C%AF%E3%82%8A%E8%BF%94%E3%82%8A)


※ 今年からは書くのも作るのも同じ範疇に入ってきつつあるので，その区別を撤廃します．

## ss

最近暇があればやっているものといえば **スライド記述言語 ss** です．

{@ogp https://github.com/abap34/ss}


ss は結構色々新しいものを取り入れており，とくにその実行モデルに関してまとめ来週の SPLASH の SRC (@ Oakland) で発表します．: [https://dl.acm.org/doi/10.1145/3837729.3839571](https://dl.acm.org/doi/10.1145/3837729.3839571)


ブログにもなっていますが，今見ると相当古い感じがしますね．

{@ogp https://www.abap34.com/posts/ss_lang.html}


例えば WYSIWYG エディタはもう普段使いレベルではあると思います．商用の普及しているソフトウェアと比較するとまだまだですが．

![](https://mqxmujnlndxwmeoq.public.blob.vercel-storage.com/posts/hurikaeri_2026_0/image-20261002164217-dc227f42.webp)

パフォーマンスについても WYSIWYG エディタによる位置変更は再レンダまで **<15ms** という当初の目論見よりも非常にいいパフォーマンスが得られています．


また，幾らかの Contributor (と言っても知り合いですけど) からパッチが飛んでくるのは嬉しいですね．どうもありがとうございます　🙇


せっかくなので最近の ss の面白い設計の一つを紹介したいと思います．


前提として，ss の基本的な目標の一つに「ごく簡単なスライドはごく簡単に作れるようにしたい」，というものがあります．

そのため，例えば "Hello" と書いてあるだけのページを作りたい場合は「"Hello"」というテキストだけを定義するだけで済み，それを「いい感じに」配置するのは勝手にやって欲しいです．


今のところ，ss ではこのいい感じの配置は `LayoutPolicy` という名前をつけている機能が担っています． ss におけるオブジェクトの配置は制約を記述して求解することによって決定されますが，この際残った自由度は `LayoutPolicy` が解消します．現在は「上寄せ」「中央寄せ」が実装されていて，例えば先ほどのような何も制約がない場合ではこれらが中央や上のいい感じの位置に置いてくれますし，二つのなんの制約もないオブジェクトをいい感じに上から順に置いてくれます．


ここで，これに関連する最近実装された非常に便利な機能としてグリッドレイアウトを作る演算子があります．
`a // b`, `a  || b` などと書くとそれぞれ「a と b を上下に並べる制約」「a と b を左右に並べる制約」を作ってくれます．


ところが，先ほど書いたように ss では普通にしていたらオブジェクトは縦に並ぶわけですから `a // b` はいらなさそうです．

ではなぜ今のところ意味がなさそうな `a // b` があるかというと， `LayoutPolicy`　を拡張する，もっと言えば高度な機能としてユーザが拡張可能にすることを考えているからです．


`LayoutPolicy` は ss レベルではなく一つ上の処理系のレイヤにあるものです．したがって ss レベルでは実現できない言及ができます．
これにより，一部の極めて定型的だが非標準的なレイアウトまで制御できないか？
具体的にはグラフ (ノードがある方) や各種図表をこの機能によって実現するというかなり非自明だが面白い抽象化ができる気がしており，今後考えたいと思っています．


このような拡張をした後ではオブジェクトは縦に積まれるとは限らないですから，それを見越して今のうちに `a // b`　を実装しておいたと言うわけです．
(こうすると後方互換を気にする親切なソフトウェアと思えるかも知れませんが日々破壊的変更を繰り返しています．すみません)



## 卒論

今後世に出すつもりなのであんまり詳細は書かないでおきますが，非常に基本的なプログラム解析の道具であるデータフロー解析を特別な場合に高速にする方法について書きました．


書き始めて大体終わるまではかなり早目に終わらせておいたのですが，案の定直前に直しで大変なことになるなどしました．修論はもっと計画的にやりたい．


後輩のみなさんはぜひ反面教師にしてください．


## abap34.com / cms.abap34.com

またまたトップページのデザインを刷新したのと，cms を作りました．


![](https://mqxmujnlndxwmeoq.public.blob.vercel-storage.com/posts/hurikaeri_2026_0/image-20261002191120-29dfc26d.webp)

CMS は md パーサとして [abap34/almo](https://github.com/abap34/almo) を WebAssembly で動かすおもしろ構成として出発しましたが，
その後

- 画像貼り付けのサポート
  - 執筆時はメモリに持っておいて保存時に Vercel Blob Storage にアップロード
- 執筆時に間違えてタブを閉じても事故らないように明示的な保存とは別で本文だけは localStorage に自動保存


などなど進化してまともな使い心地になっています．almo についてもパフォーマンスを向上させたいですね．


## JETLS.jl

最近はほとんどできていないですがちょくちょくパッチは投げていました．また， PPL 2026 (@香川) でポスター発表しました．


香川では美味しいご飯はもちろん (先生ありがとうございます　🤲)，憧れの STORES の遠藤さんや笹田さんとご飯をご一緒させていただいたり，他の大学の人との交流できて楽しかったです．
またカツオ食べたい ^ __ ^



![香川に行く飛行機がまさかの整備不良で飛ばず，先輩と電車旅でした．写真は瀬戸内海．おにぎり美味しかったです．](https://mqxmujnlndxwmeoq.public.blob.vercel-storage.com/posts/hurikaeri_2026_0/image-20261002174055-55fa97f5.webp)


## JuliaLang Japan

科学大で日本の Julia コミュニティが集まって研究集会 (?) をしました．

[実行委員会](https://julialangja.github.io/julialangja2025/) の一人として会場準備など含め中核的に関わりました．

![](https://mqxmujnlndxwmeoq.public.blob.vercel-storage.com/posts/hurikaeri_2026_0/image-20261002174815-8db3010f.webp)


また，メイントークの一つとして [JETLS の話](https://speakerdeck.com/abap34/jetls-dot-jl-a-new-language-server-for-julia) もしました．


## KoBun

良くも悪くも某 JS Runtime が話題になっていたときに作ってみた JS Runtime です．

{@ogp https://github.com/abap34/KoBun}


こう書くと，

```js

const server = Kobun.serve({
  port: 3000,

  fetch(req) {
    console.log(req.method, req.path);

    if (req.path === "/hello") {
      return new Response("hello from kobun\n", {
        headers: {
          "content-type": "text/plain",
          "x-kobun-path": req.path,
        },
      });
    }

    return new Response("not found\n", { status: 404 });
  },
});

console.log("listening", server.hostname, server.port);
```


![](https://mqxmujnlndxwmeoq.public.blob.vercel-storage.com/posts/hurikaeri_2026_0/image-20261002185510-60365179.webp)


こんな感じになります．

ちょうどいい教材な気がするので，システムプログラミングの復習・勉強にいかがでしょうか？


本当は「5 日で作ろう JS Runtime」みたいなブログにすることを目論んで書き始めましたが，あんまり面白くならなさそうなのでやめてしまいました．

## そのほかの作っているものなど

一年もあると流石に書くのが面倒なため，主要でパブリックなものだけ箇条書きでサッと紹介します．

- [abap34/disable-workflows](https://github.com/abap34/disable-workflows)
  - GitHub Actions を一覧表示して disable することができる TUI ツール．謎 CompatHelper とかに CI 時間吸われたり通知がウザかったりするのを解消するために作りました．結構便利．
- [abap34/Struct2JSONSChema.jl](https://github.com/abap34/Struct2JSONSchema.jl)
  - Julia の struct を対応する JSONSchema にするやつ．結構便利．JETLS.jl で使われてます．
- [abap34/abstract-interpretation.lean](https://github.com/abap34/abstract-interpretation.lean)
  - 抽象解釈の理論の形式化
- [abap34/TerminationAnalyzer.jl](https://github.com/abap34/TerminationAnalyzer.jl)
  - 停止性解析をするやつ
- [abap34/better-search-highlighter](https://github.com/abap34/better-search-highlighter)
  - 標準のよりもうちょっと目立って見つけやすい検索ができる Chrome 拡張．文字多いページだと標準の検索で引っかかってもどこにあるかわかんないんですよね．
- [https://light.abap34.com/](https://light.abap34.com/)
  - 今住んでいる家はインフラがイカれており，LED 電球だろうと一ヶ月くらいで切れ始めるで有名です．そこで家の電気のうちどれが生きていてどれが死んでいるかのステータスサイトを作りました．隠し要素もあるので遊んでみてください．また，お金持ちの読者の方がいたらどうか電球を買ってください．

他にも頼まれて多少お金がパソコンカタカタなどしていて，おかげさまで電球を買い換えることができています．みなさまありがとうございます．引っ越したい．



## 本

新コーナーです．真面目に書評を書くのはめちゃくちゃ真剣にやらないといけないと思うのでごく簡潔に書きます　🙏
専門書は当然ありすぎるためそれ以外について書きます．

- [ナショナリズムとは何か](https://www.chuko.co.jp/shinsho/2025/11/102880.html)
  - 全ページに非自明なことが書いてあり非常に面白かったです．おすすめ
- [福音派 ─終末論に引き裂かれるアメリカ社会](https://www.chuko.co.jp/shinsho/2025/09/102873.html)
  - アメリカ政治の意味不明パートがかなり理解できてよかったです．おすすめ
- [身体の美学入門 感性から捉えなおす人間の本質](https://www.chuko.co.jp/shinsho/2026/06/102916.html)
  - [このツイート](https://x.com/gubibibi/status/2078469531597783553) を見て買ってみたけどちょっとツイートの議論(?)  までは辿り着かなかった感がありました(入門なのでそれはそうなのかも)．とはいえ内容自体は面白かったです．
- [表層 UI デザインの解剖学](https://gihyo.jp/book/2026/978-4-297-15706-7)
  - 常人向けソフトウェアを作る際，UI はもっぱら AI にやってもらいがちですが，デザインに関してなんの知識もないので微妙さなどを言語化できずに良い指示ができて来なかったので買ってみました．かなり一から説明してくれておりデザインミリしら人間でもよく理解できました．おすすめ


## その他

- 前期の Contributions 数は 1957 件でした．
- 修士課程に進学します．引き続き同じ研究室でプログラミング言語の研究に取り組んでいくつもりです．とくに，強い計算機を使って強いことを示すタイプの解析手法に取り組んでいこうと思っています．詳しいことを知りたい方はお酒に誘ってください.

![学生室の自分のデスク．こんなに対策しているのになぜか左肩が痛すぎて上がらなくなってしまいました](https://mqxmujnlndxwmeoq.public.blob.vercel-storage.com/posts/hurikaeri_2026_0/image-20261003074430-a8d859bf.webp)

- 食洗機を買いました．ご飯食べる用の椅子と机を買いました．掃除機を買い替えました．だからお金がないのではないでしょうか
- 東京ヤクルトスワローズは現在 5 位です．4 年連続 B クラス...　いつか優勝をこの目で神宮球場で見てみたい．

![ただ，山田哲人のサヨナラホームランを見ることができるなど現地は悪くない一年でした](https://mqxmujnlndxwmeoq.public.blob.vercel-storage.com/posts/hurikaeri_2026_0/image-20261003074639-47e6ba9d.webp)



## 抱負・二大ヒーローについて

※ 過去の記事の傾向と対策からいって，この章は高い確率で後で削除されるのでスクリーンショットを撮っておくのがいいと思います．


小学校 1 年生で野球を始めたとき，自分はかなり背が低く (クラスで一番前とかだった気がします)
苦労することもいろいろありました．


ですが，当時ヤクルトのエースだった石川雅規はプロ野球選手，ましては投手としては非常に小柄にもかかわらず大活躍していて，
ポジションは違えどすぐに自分にとっての大ヒーローとなり，以来，15 年間 (!) 応援してきました，


その石川が今シーズン限りで現役を引退するらしいです．


実は引退発表の直前，石川は急遽一軍に上がってきていました．自分の中ではその昇格の意味がなんとなくわかってしまっため，慌ててチケットを取り急遽神宮球場に行くことができました．


結果として石川は 1 イニングも持たずに降板し，その後引退を発表したわけですが，最後の本気の公式戦での登板を見届けることができたのは非常に幸運だったと思います，


さらに，翌月には 4 年最推しだったアイドルである増本綺良さんの卒業ライブがありました．


これは自分の個人的な思想ですが，本気の努力は人に見せないべき，と思っています．

この点で言うと全くその通りの人で，全ての点で裏の努力が滲み出てきていて，それが自分をめちゃくちゃモチベートしてくれていました．


なんてったって人間なわけですから，当然その人が好きなようにやるべきなので，結果として


「俺が推してた時間と金返せ！！」とか「他のことに時間使ったらもっと有意義だったかなぁ」ということが起きるのは至極当然だと思うのですが，


そうは一切ならず．ライブが終わった後もなんてキレイに終わったんやろう，と感慨に耽ることができたのは本当に幸せなことだったと思っています．



二人とも本当にお疲れ様でした！自分もかくあろうと思います．


![TOYOTA ARENA TOKYO にて](https://mqxmujnlndxwmeoq.public.blob.vercel-storage.com/posts/hurikaeri_2026_0/image-20261002184249-ae735653.webp)


## 今日の 1 曲

<iframe width="560" height="315" src="https://www.youtube.com/embed/F2lWsUJotmc?si=QkNxNldlRfKcFAZp" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>






