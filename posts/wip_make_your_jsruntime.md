---
title: 5日で小さな JavaScript ランタイムを実装してみる
author: abap34
date: 2026/05/22
tag: [プログラミング言語処理系, JavaScriptランタイム, OS, C, JavaScriptCore, Non-blocking I/O, 非同期IO, システムプログラミング]
twitter_id: abap34
github_id: abap34
mail: abap0002@gmail.com
ogp_url: https://abap34.com/posts/wip_make_your_jsruntime/image.png
description: JavaScriptCore を使った小さな JavaScript ランタイムを作ることで JS ランタイムへの理解を深めます．最終的に自作ランタイムで Web サーバを動かします．
url: https://abap34.com/posts/wip_make_your_jsruntime.html
site_name: abap34's blog
twitter_site: @abap34
---

## 5日で小さな JavaScript ランタイムを実装してみる

みなさん走っていますか？abap34 です．


最近，Bun が話題ですね．

{@ogp https://github.com/oven-sh/bun/pull/30412}


1000 件以上コメントがついた PR は初めて見たかもしれません．


弊研究室でもこの件が話題になったのですが，V8 や JavaScriptCore, SpiderMonkey などの JS エンジンの技術はしばしば話題になる一方で，
JS ランタイム自体の話をすることはありませんでした．


私も JS / TS は書かないわけではないですが，99% は React でフロントを書くためで，ほぼ React のコンポーネントを表現するための言語扱いしています．
そのため，Node.js, Deno, Bun などの JS ランタイムについてはあまり深く考えたことがありませんでした．


そこで実際に JS ランタイムを実装してみることで JS ランタイムについて多少理解を深めてみようと思います．

また，それを通じて JavaScript 自体の知識 (ECMAScript, JS における非同期処理などなど) も同時に深めていきたいと思います．


当たり前ですが， Production-Ready な JS ランタイムを実装するのは難しいですから，今回は JavaScriptCore を使って Bun のサブセット...をさらに簡略化したかなり小さなナニカを実装することにします．


一応有識者の人に聞いてみたところ，だいたい「C コンパイラを作りました」でいうところの

Level 1. 四則演算ができる
Level 2. 変数と制御構文ができる
Level 3. 関数と型ができる
Level 4. メモリ管理ができる
Level 5. セルフホストができる


TODO: ↑ これどれ？

くらいらしいです．

つらつら書いても少しまどろこっしいと思うので，7 つのステップに分割して day1, day2, ... day7 という 7日間で完成させていくディアゴスティーニ形式でやっていきたいと思います．


最終的には以下のようなコードが動きます．

```js
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const server = Kobun.serve({
  port: 3000,

  async fetch(req) {
    console.log(req.method, req.path);

    if (req.path === "/slow") {
      await delay(10);
      return new Response("slow hello\n", {
        headers: { "content-type": "text/plain" }
      });
    }

    return new Response("hello from kobun\n", {
      headers: { "content-type": "text/plain" }
    });
  }
});

console.log("listening", server.hostname, server.port);
```


名前は Bun の小さいバージョンということで `Kobun` ということにしましょう．[^1]


{@ogp https://github.com/abap34/KoBun}


[^1]: こういう日本語ベースの短い名前は食傷気味，もうこういうのいい，と周りによく言っているのですが，絶対 KoBun がいいと主張する友人 A の意見を尊重してこの名前にしました．元の名前案は `kk` でした．(タイプしやすいので)


## 対象読者

この記事は次のような人を対象としています．

- JavaScript ランタイムに興味がある人
- OS・C 言語の初歩的な知識がある人

次の知識は不要です．

- JavaScript そのものの知識
  - 必要な部分は本記事で解説します．逆に，これらの知識がある人は退屈な部分があるかもしれません．
- JavaScriptCore などの JS エンジンの知識
  - 今回は JS エンジンをライブラリとして使うだけなので，内部構造などの知識は不要です．

## 免責

筆者はコンパイラや OS には必要最低限の知識がありますが，JS そのものには全く詳しくないです．


本記事では JS ランタイムの実装を通じて諸々の仕様や概念についても述べていきますが，その内容はあくまで筆者の理解に基づくものであり，正確でない可能性があります．
誤りがあればコメントから指摘していただけるとありがたいです．


:::info
本記事の内容は macOS 上で実装・動作確認を行っています．Linux などの他の OS で動かす場合は適宜コードなどの修正が必要になる可能性があります．
:::

3
## 本編

### Day 1: JavaScriptCore と外の世界をつなぐ

### Day 2: イベントループを実装して非同期処理を動かす

### Day 3: HTTP サーバの C 側を実装する

### Day 4: KoBun.serve を実装する

### Day 5: Non-blocking I/O を実装する

