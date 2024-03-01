---
title: 作問ハッカソン 002で作問しました 
author: abap34
date: 2024/02/17
tag: [競プロ, traP, 日記]
twitter_id: abap34
github_id: abap34
mail: abap0002@gmail.com
ogp_url: https://images.dog.ceo/breeds/rottweiler/n02106550_3528.jpg
description: 
url: https://abap34.com/posts/sakumon2.html
site_name: abap34.com
twitter_site: @abap34
---

## Don't cut line!


[@noya2](https://twitter.com/noya2ruler) が運営してくれている traPのアルゴ班作問部で2回目の作問ハッカソンが開催されました。


実は一回目も参加していて、こんな問題: [Double Lease Squares](https://yukicoder.me/problems/no/2438) を作ったのですが、
今回も参加して問題を出しました！ 

**[Don't cut line!](https://yukicoder.me/problems/10681)**  

![](sakumon2/image.png)


題材としては、最近クラスカル法やプリム法の最適性の証明とかを勉強したので、この辺使いたいなぁと思って作ってみました。

実は、元の問題は $P(T) = \sum_{i \in I}p_i$ と定義されていたのですが、これのいい感じの解法がわからなかったので
$P(T) = \max_{i \in I} p_i$ として出題しました。(調査の結果、元のやつは NP-hard で、色々となんか手法の提案はみたのですがいまいちわからずでした.)



感想としては、テストケースを作るのがとても難しかったです.

問題の性質上、 $n$ 番目の(?) 最小全域木からがコストの制約を満たす...みたいな感じにしなくてはいけない上、
そもそも入力は連結で単純にしないといけないので、脳死でランダムに作るみたいなことは当然ダメで、解法からいい感じに逆算して作る必要があったので色々と勉強になりました。

コンテスト中の提出を見ていると、この辺頑張って作ったテストケースがかなり撃墜してくれていたのでとてもよかったです。


前回のコンテストではかなり後ろの方の問題だったのでそこまで大量の提出が飛んでこなくて暇だな〜と思っていたのですが、
今回は70以上の提出があり、30人以上の方に解いていただけてとても嬉しかったです、ぜひ解いてみてください〜〜！！！

 
また、準備でいろいろと　[@noya2](https://twitter.com/noya2ruler) と [@ponjuice](https://twitter.com/PonponJuice0) くんにめちゃくちゃ助けてもらいました、
大変ありがとうございました(土下座)　🙇‍♂️🙇‍♂️🙇‍♂️🙇‍♂️🙇‍♂️🙇‍♂️🙇‍♂️🙇‍♂️🙇‍♂️🙇‍♂️🙇‍♂️🙇‍♂️ 


