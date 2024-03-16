---
title: (WIP) 【週刊 PEGパーサジェネレータ を作ろう】 [創刊号] [最終号]
author: abap34
date: 2024/03/06
tag: [Julia, PEG, パーサ]
twitter_id: abap34
github_id: abap34
mail: abap0002@gmail.com
ogp_url: https://images.dog.ceo/breeds/bluetick/n02088632_419.jpg
description: PEGパーサジェネレータを作ります。いろいろな構文解析アルゴリズムの計算量の話もします。
url: https://abap34.com/posts/tinypeg.html
site_name: abap34's blog
---


## 創刊

この前こんな記事を書きました。 [3時間で作る自作言語のJuliaトランスパイラ](https://www.abap34.com/posts/mini-lang.html)


この記事では Julia製の PEGパーサジェネレータ [PEG.jl](https://github.com/wdebeaum/PEG.jl) を使ってパーサを作りましたが、せっかくPEGを勉強したので自分でも作ってみようと思います。


## いろいろな言語の解析の計算量

PEG自体は上について説明を書きましたが、パーサジェネレータを作るからには吐かれるパーサのパフォーマンスも気になります。

そこで一旦、 いろんな文法で定義された構文の計算量の話をしようと思います。

### 1. バックトラックなしの正規言語(表現) の計算量 (DFA型の正規表現エンジン)

形式言語の講義で習うような、定義通りの正規言語($\leftrightarrow$ 正規表現で表現された) 言語 $L$ について考えてみると、
入力文字列 $S$ の長さを $n$ として　毎回 $\Theta(n)$ で  $S \in L$ かを判定できます。


というのも、全ての正規言語に対して対応するDFAが存在するので、これをあらかじめ作っておけば、 $n$ ステップで受理できるか判定できるからです。


実用的には、$L$ は正規表現で書かれることが多いでしょうから、DFAの構築自体も考えなければいけません。


正規表現をNFAに変換するのは正規表現の長さに対して時間・空間ともに線形でできます。

DFAにNFAを変換する際はナイーブにやると状態が正規表現の長さに対して指数オーダーになってしまいますが、
遅延評価で必要な状態だけを作ることで正規表現の長さに対して線形時間・空間 + 入力文字列の長さに対しても線形時間・空間で出来ます。


grepや[https://github.com/google/re2](https://github.com/google/re2) などはこうして実装されています。


というわけで安心─というわけにもいきません。

### 2. バックトラックありの正規言語の計算量 (VM型の正規表現エンジン)

世の中で「正規表現」という顔をして提供されている `regex` みたいな名前のパッケージたちは
形式言語理論の正規言語の範囲を逸脱した機能が提供されていることが多いです。


例えば後方参照などは正規文法では表現できません。
Perl が これらの「拡張」正規表現を採用し、 PCREとして広く普及してしまったためにこのような拡張が一般化してしまいました。
(ただ、最初に導入したのは SNOBOL という言語らしいです。)


では、このような「拡張」正規表現によって表現される言語の解析はどれくらい難しいでしょうか？


バックトラックが...とか書こうと思ったのですが、そのような記事は結構ある("ReDoS" とかで検索すると出てくる)ので、

ここではちょっと面白い結果でおそらく線形時間ではできないだろう、もっと進んで多項式時間まで緩めても
できないだろうということを主張したいと思います。


[Reduction of 3-CNF-SAT to Perl Regular Expression Matching](https://perl.plover.com/NPC/NPC-3SAT.html) によれば、
Perlの正規表現エンジンは、3SATを解くことが出来ます。 

3SAT は NP困難な問題なので、もしこの正規表現が多項式時間で解析できたら 
無事に P=NP となります。　


なので、少なくとも Perlの正規表現を常識的な (?) 多項式時間で解析するアルゴリズムにお目にかかれる日が来るかは怪しいところです。

(常識的でなくてもお目にかかれたらすごいですが)


### 3. 文脈自由言語の計算量

有名なものとして、CYKアルゴリズムがあります。


これは DPを使って 時間計算量 $\Theta(n^3)$ で動作するアルゴリズムです。

また、 Earleyアルゴリズムという改良もあります。曖昧でない文脈自由言語に対しては $\Theta(n^2)$ で、
一般の文脈自由言語に対しても $O(n^3)$ で解析できます。


とはいえこれでもあまり実用的なパフォーマンスが出にくく、
任意の文脈自由言語に対して高速になるようアルゴリズムを改良するのではなく、

解析しやすい性質のいい言語を考える方向性で頑張るという方向性に進んでいったようです。


この辺の流れは全然体験しておらず、読んだ文章を鵜呑みにしています。歴史とかいずれ調べてみたいです。


そのため、多くのプログラミング言語などは LALR(1) などで解析できるものになっています。

(ということになっていますが実際はあれやこれやと補っていることも多いようです。
例えば C は `typedef` 構文の存在によって文脈依存言語になっています。)

## PEG と Packrat Parsing
### PEG vs CFG

さて、となると気になるのは PEGです。

直感的には、文法の表現能力が高いほど解析も難しくなるのではないかという気になるので、PEGの表現能力について考えてみます。

まず、有名な話として $L = \{ a^n b^n \mid n \geq 0 \}$ は正規言語ではありません。

さらに、　$L = \{ a^n b^n c^n \mid n \geq 0 \}$ まで行くと文脈自由言語でもありません。

そこでこれを PEG で表現できるかを考えてみると、PEG では以下のようにすると $L$ が表現できます。

```
S = &(A !b) a + B
A = a A? b
B = b B? c
```

逆に文脈自由文法では表現できないが、PEGでは表現できる、という言語が存在するかは未解決のようです。


まとめると、PEG は少なくとも文脈自由言語と同等あるいはそれ以上の表現能力を持っていると言えます。

したがって、直感的には PEGで書かれた言語の解析は難しそうな気がします。

### (wip) PEG の計算量


まず、ナイーブにやると最悪計算量は普通に $\Omega(2^n)$ になります。

PEGは順序付き選択をサポートしているので、ここでバックトラックが発生してしまうためです。

しかし、 解析を進める際に、その時見ている非終端記号と位置をキーにして結果をメモ化しておくだけで、
なんと一挙に $O(n)$ が保証されます。

これが **Packrat Parsing** と呼ばれる手法です。

### Packrat Parsingは本当に効率的？

さて、かなり劇的な性能改善が起きていて採用待ったなしのように見える Packrat Parsing ですが、
実際これがどれくらい実際のパフォーマンスに影響するかを考えてみます。


驚くべきことに**、「ふつうの」解析の場面では Packrat Parsing はあまり効果を発揮しない**
という意見がかなり多いようです。


まず、一般的に非終端記号の使われる頻度はかなり偏っています。

プログラミング言語なら `EXPR` などはしょっちゅう使われると思いますが、
例えば `GOTOSTMT` などはほとんど使われないと思います。


さらに、世の中で使われている多くの文法は LALR(1) などで解析できるものでした。

たとえ PEG を前提に文法を組み立てても、これらに近い見た目のものを自然と作ることで、
結果的にバックトラックが結果としてあまり発生しない文法になリます。


これらの理由から、何でもメモ化するとオーバーヘッドが大きくなってかえって非効率になることが多いようです。


したがって、設計者が指定する、あるいは実際に参照される頻度に基づいて特定の数個の非終端記号に対してのみメモ化を行う
というのがよく取られる戦略です。


(todo: この辺りを実測した結果を載せる)



## (WIP) PEGパーサジェネレータを作る。 

さて、 本題です。 まずは一旦計算量とかの話は忘れて、素直に意味論に従って PEGパーサジェネレータを作ってみたいと思います。

### デザイン
#### サポートする構文

次の構文をサポートすることにします。

- 文字列(`PStr`)
- 正規表現 (`PRegex`)
- 連接(`PSeq`)
- 選言(`PChoice`)
- 否定先読み(`PNot`)
- 任意文字(`PAny`)
- 0回以上繰り返し(`PMany`)

`PMany` や `PRegex` は PEG自体には本来ないですが、
記法として便利なので追加します。

**`PRegex` を正規言語の範囲内で使えば**、これによって表現能力が変わることはありません。

### 実装

実装していきます。　

まずはパースコンテクストを定義します。

```julia
@enum State UN FAIL FINISHED

mutable struct ParseContext
    input::String
    pos::Int
    endpos::Int
    failpos::Int
    state::State
end


function watching(context::ParseContext)
    return SubString(context.input, context.pos, context.endpos)
end
```

ここで、文字列のスライスは allocation が発生するので、これを避けるために `SubString` を使います。

```julia
julia> S = randstring(10^6)
"mx ⋯ 999175 bytes ⋯ EA"

julia> @benchmark S[100:10^6-100]
BenchmarkTools.Trial: 10000 samples with 1 evaluation.
 Range (min … max):  14.500 μs … 146.375 μs  ┊ GC (min … max): 0.00% … 0.00%
 Time  (median):     42.166 μs               ┊ GC (median):    0.00%
 Time  (mean ± σ):   41.786 μs ±   9.610 μs  ┊ GC (mean ± σ):  0.00% ± 0.00%

  ▄▃                                ▆█▄▁▁▁ ▁▂▂▃▃▃▃▂▂▁          ▂
  █████▇▇███▅▁▃▃▁▁▃▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁███████████████████▇▇▇▆▇▆▇ █
  14.5 μs       Histogram: log(frequency) by time      61.6 μs <

 Memory estimate: 976.50 KiB, allocs estimate: 1.

julia> @benchmark SubString(S, 100, 10^6-100)
BenchmarkTools.Trial: 10000 samples with 893 evaluations.
 Range (min … max):  126.120 ns …  1.929 μs  ┊ GC (min … max): 0.00% … 0.00%
 Time  (median):     131.205 ns              ┊ GC (median):    0.00%
 Time  (mean ± σ):   135.445 ns ± 49.261 ns  ┊ GC (mean ± σ):  0.33% ± 2.04%

   ▁▄▂     ▅█▆▄▃▁  ▃▄▃▁                                        ▁
  ▄███▇▅▃▄▄██████▇██████▇▇▇██▇██▆▆▆▆▆▆▅▇█▇█▇▇▇▇▇▅▅▅▅▅▅▅▄▄▄▅▃▄▃ █
  126 ns        Histogram: log(frequency) by time       154 ns <

 Memory estimate: 32 bytes, allocs estimate: 1.
```

ので、パースコンテクストは入力文字列だけ持って、 `SubString` を返すようにしておきます。


`startswith` とかはもちろん `AbstractString` なら使えるので、これで色々実装していきます。

例えば `PStr` :

```julia
struct PStr <: TerminalExpression
    text::String
end

function match(expr::PStr, context::ParseContext)
    if startswith(watching(context), expr.text)
        newpos = context.pos + length(expr.text)
        return MatchResult(true, expr.text, newpos, newpos)
    else
        return MatchResult(false, nothing, context.pos, context.pos)
    end
end
```

`PAny`:

```julia
struct PAny <: TerminalExpression end


function match(::PAny, context::ParseContext)
    if context.pos <= context.endpos
        newpos = context.pos + 1
        return MatchResult(true, watching(context)[1], newpos, newpos)
    else
        return MatchResult(false, nothing, context.pos, context.pos)
    end
end
```

完成したものがこちらになります。


<a href="https://github.com/abap34/TinyPEG.jl"><img src="https://gh-card.dev/repos/abap34/TinyPEG.jl.svg"></a>


## 廃刊

おもしろいです！


[正規表現技術入門](https://gihyo.jp/book/2015/978-4-7741-7270-5) 
とか、 あるいはもっと実践的な(?) コンパイラとかで使われる話が乗ってる本を読んでみたいなと思いました。


## 今日の一曲


<iframe width="560" height="315" src="https://www.youtube.com/embed/yVWCezwyEsM?si=Tx-kE-6UpcvlPFYb" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>





