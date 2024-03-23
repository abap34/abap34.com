---
title: 3時間で作る自作言語のJuliaトランスパイラ
author: abap34
date: 2024/02/22
tag: [日記, Julia, コンパイラ]
twitter_id: abap34
github_id: abap34
mail: abap0002@gmail.com
ogp_url: https://images.dog.ceo/breeds/dane-great/n02109047_6265.jpg
description: Julia言語で簡易処理系を爆速で作ります。
url: https://abap34.com/posts/mini-lang.html
site_name: abap34's blog
twitter_site: @abap34
---


## Abstract

- Julia で簡単な処理系を作ります
- PEG.jl を使うと簡単に厳密な構文を定義・解析できます
- 入力をJuliaのASTに変換して実行する方式だと簡単にできて便利で楽しいです

## はじめに

I県の国立T大学の講義では、簡易インタプリタを作る課題が出るらしいです。

また、言語が指定されていないようで色々な言語での実装を GitHubで見かけて、
[実装がまとまっているgist](https://gist.github.com/eggplants/fbd3422839653b211b314d2bb151c1d7) なんかもあったりしていいなぁと思ったので Juliaでも作ってみました。


というか [元の講義](https://kdb.tsukuba.ac.jp/syllabi/2022/GB27001/jpn/0) がイケてるエンジニアの人呼んで面白そうな話が並んでいて羨ましいです。
T工業大学でも同じようなテイスト(卒業生が来る系)の講義があったような気がしますが、卒業生でえんえんビジネス人生を語る皆様がたくさんいらっしゃるのでそういう話に興味がある人が受講するといいかもしれません。


それはそれとして、いろんな言語で実装されてるなら自分もなんかでやりたくなってくるところです。

今までの自分の構文解析遍歴は、

- 講義(形式言語とオートマトン) で理論かじったり
- 自作の拡張 Markdownパーサの [ALMO](https://github.com/abap34/ALMO) とか 
- 大学のアセンブリ言語の課題で数式をパースしてみたり 

みたいな感じなのですが、 C/C++ でしかやったことがありません。
C++ はまだしも Cは全然自分の手足感がないので、慣れている Python / Julia あたりでやりたいと思っていて、
さっきの gist をみていると Python実装はもう結構あるみたいなので Juliaでやってみることにします。


それに加えて、自分で素のパーサを書くのは Markdownパーサを書いたときに、もうこりごりだ〜〜(本当に)と思ったので、今回はパーサジェネレータを使っていい感じにやることに決めました。
(Markdown の仕様によるところもある気がしますが...)

## PEG.jl で構文を書く
### PEG とは

さて、プログラミング言語を作るからにはパーサを作らなくてはいけないですが、今回は


<a href="https://github.com/wdebeaum/PEG.jl"><img src="https://gh-card.dev/repos/wdebeaum/PEG.jl.svg?fullname="></a>


を使います。

そもそも PEGという耳馴染みのない(僕はありませんでした)という単語について説明しておきます。

PEGは Parsing Expression Grammar の略で、日本語だと解析表現文法とか言われるものです。 


その名の通り文法なのですが、多くのプログラミング言語の構文の記述に使われる $^1$ 文脈自由文法とは違い、
構文木が常に一意に定まるという特徴があります。


さらに、PEGは文脈自由文法ではできない $\{a^n b^n c^n \mid n \ge 1\}$ を受理する構文を定義することができ、
また 「PEGで記述不可能だが文脈自由文法で記述可能な構文」 は今のところ見つかっていないので、
PEGは文脈自由文法よりも表現力のある文法だと考えられているようです。


PEGは、技術としては思ったよりだいぶ最近のもので、なんと提案されたのは 2004年です。 
大学の講義でも多分扱っていなかったと思うのですが(先生へ: 扱ってたらすいません)、たまたま大学図書館で
[Pythonで学ぶ解析表現文法と構文解析](https://www.morikita.co.jp/books/mid/085651)  という本を見つけて読んでへ〜となったので使ってみることにしました。

(この本では構文解析自体の説明から平易に書かれていて実装もPythonで読みやすく、おすすめです。最後の方の章の計算量とかのところでこれは大丈夫か...? と思うところもありますが、全体としては実践的で好きです。)

しかも、Python 3.9からはPythonのパーサがPEGベースになり、JuliaのパーサもScheme製だったのが Julia製になって Syntax Error がだいぶ見やすくなったりと、
世はまさに大パーサ改善時代と言えそうです。


構文解析がそこまで最近に進化しているのは正直イメージと違ったのでびっくりしました。　もっと早く知ってたらもう少しオートマトンにやる気が出たかもしれない...

### PEG の特徴と PEG.jl を使った実践

PEG.jl はそんな PEGを使って構文を定義・解析してくれるライブラリです。
最終更新はとても前ですが、READMEに書いてある通り機能がすでに十分に揃っているので特に困るポイントはありません。

さて、PEG.jl を使って構文を定義してみます。
見た目は拡張BNF記法そっくりで、直感的に書けるのでとても使いやすいです。

例えば、一桁の数字同士の足し算を定義するとこんな感じになります。

```julia
julia> using PEG

julia> @rule add = r"[0-9]" & "+" & r"[0-9]"  # 一桁の足し算
add (generic function with 2 methods)

julia> parse_whole(add, "1+2")
3-element Vector{Any}:
 "1"
 "+"
 "2"
```

このように、

- `@rule` マクロでルールを定義
- `parse_whole(rule, src)` でパース

という 2ステップで簡単に構文を定義・解析できます。

さらに、 `@rule` ではパース結果を渡す関数も同時に定義できます。

例えば、 文字列 `x` を `parse(Int, x)`  で整数に変換して、計算式をその場で評価してみます。

```julia
julia> @rule add = (r"[0-9]" & "+" & r"[0-9]") |>  (w -> (parse(Int, w[1]) + parse(Int, w[3])))
add (generic function with 2 methods)

julia> parse_whole(add, "1+2")
3

julia> parse_whole(add, "1+4")
5
```

足し算のパース・解釈ができるようになりました。



ここまでだとあまりBNFと変わらないように見えますが、違うポイントを見てみます。

といっても違うポイントは一つだけで、選言(`|`) と順序付き選言(`/`) です。

例えば BNF記法で

```plaintext
A ::= B | C
```

と書いた場合、 `A` は `B` または `C` どちらにマッチしてもかまいません。


これにたいして PEG では順序付きの選言を使います。

```plaintext
A = B / C
```

と書いたとき、 `A` は `B` にマッチするか試し、成功したら `B` にマッチし、そして失敗したその時に限り `C` にマッチを試みます。

したがって結果は必ず一意に定まります。


さらに、これは選言がプログラムでの `||` に対応してほしいという気持ちになると割と自然です。
ふつうの処理系では `(f() > 0) || (g() > 0)` という式の `g` は短絡評価で `f() > 0` が　`false` だったその時に限り評価されるわけですから、
どちらかというと順序付きの選言の方が `||` に近い感じがします。

### Julia の ASTへの変換

上の例ではパースしたものをその場で解釈していましたが、これだと評価を自分で書く必要があってめんどくさいため、誰かに実行をやってほしくなります。

…よくよく考えてみるとパースを動かしている処理系、Juliaがすでに手元にあるわけですから、なんならパースだけでなく実行もやってほしいような気がします。


**つまりは、Juliaへのトランスパイラが書きたくなってきます。**


大変な仕事に見える人もいるかもしれませんが、実はこれは本当に簡単な作業です。


Julia はそれ自身の構文を普通のデータとして扱うことができます。
これは同図像性(Homoiconicity)などと呼ばれる性質で、同様の性質を持つ言語として、代表的なものに Lisp があります。

Lisp の構文はただの(?) リストなので、 Lisp のコードの表現は Lisp の基本的なデータ構造に過ぎません。


Julia においては、 `Expr` 型によってその構文を表現できます。実例で見てみます。 

(出力は一部省略しています)

```julia
julia> ex = quote
                  x = 10
                  y = x * 2
                  if y > 15
                      println("OK")
                  else
                      println("!?")
                  end
            end

julia> typeof(ex)
Expr

julia> dump(ex)
Expr
  head: Symbol block
  args: Array{Any}((6,))
    1: LineNumberNode
      line: Int64 2
      file: Symbol REPL[16]
    2: Expr
      head: Symbol =
    ...
    5: LineNumberNode
      line: Int64 4
      file: Symbol REPL[16]
    6: Expr
      head: Symbol if
      args: Array{Any}((3,))
        1: Expr
          head: Symbol call
          args: Array{Any}((3,))
            1: Symbol >
            ...
            2: Expr
              head: Symbol call
              args: Array{Any}((2,))
                1: Symbol println
                2: String "!?"
```

`quote ... end` で囲むと中の式を評価せずに、その式自体の構造、つまりはASTを得ることができます。
これは `typeof` でわかるように `Expr` 型で保持されていて、 `dump` で中身を見ると、確かに元の式の構造っぽいものが保存されているようです。

あるいは、 S式の形で出力することもできます。

```julia
julia> Meta.show_sexpr(ex)
(:block,
  :(#= REPL[50]:2 =#),
  (:(=), :x, 10),
  :(#= REPL[50]:3 =#),
  (:(=), :y, (:call, :*, :x, 2)),
  :(#= REPL[50]:4 =#),
  (:if, (:call, :>, :y, 15), (:block,
      :(#= REPL[50]:5 =#),
      (:call, :println, "OK")
    ), (:block,
      :(#= REPL[50]:7 =#),
      (:call, :println, "!?")
    ))
)
```

そしてこのASTを作る手段は当然開かれています。

例えば、 `1 + 2` を計算して出力するようなASTを、「手で」作ってみることにします


```julia
julia> ex = Expr(:call, :println, Expr(:call, :+, 1, 2))
:(println(1 + 2))

julia> println(ex) 
println(1 + 2)

julia> eval(ex)
3
```

こんな感じで、 ASTを直接作って、 `println(1+2)` に相当するコードを表現・実行することができました。

(`println(ex)` によって、式の結果ではなく式そのものが保持されていることがわかることに注目してください！)

これで、最初の例の足し算のパーサを書き換えて、ASTを作るようにすれば、自動的にJuliaのコードに変換できるようになります。

```
julia> @rule add = (r"[0-9]" & "+" & r"[0-9]") |>  (w -> Expr(:call, :+, parse(Int, w[1]), parse(Int, w[3])))
add (generic function with 2 methods)

julia> parse_whole(add, "1+2")
:(1 + 2)

julia> eval(ans)
3
```

`"1+2"` という単なる文字列から `1 + 2` を表現する **Juliaの** AST を得ることができました。
つまり、

🎉 **まさに今、自作言語をJuliaにトランスパイルするプログラムが動きました。** 🎉

もはやあとは作業ゲーで、これを気合いで拡張していけば完成です。

ひとまず、どんな言語にするか考えてみることにします。


## 言語の設計
### イメージ

さて、本格的に言語を作り始めます。

だいたい、次の要素を含むプログラミング言語を作ることにします

- 基本的な二項演算(四則演算, 剰余, べき乗, 比較演算)
- 変数
- 関数定義 / 呼び出し / `return`
- ブロック
- `while`, `if`
- 整数, 浮動小数点数, 文字列　あたりのリテラル

これだけあれば十分実用的な感じの言語な感じがします。
構文は、元の実装を参考にしてよくある感じの波括弧を使うものにすると、だいたいイメージとしては以下のように 
FizzBuzz が書ける言語を作るのが目標になります。　結構見た目は立派な言語ですね。


```julia
function fizzbuzz(n) {
    i = 0
    while (i < 100){
        i = i + 1
        if (i % 15 == 0) {
            println("FizzBuzz")
        } elseif (i % 3 == 0) {
            println("Fizz")
        } elseif (i % 5 == 0) {
            println("Buzz")
        } else {
            println(i)
        }
    }
}

fizzbuzz(100)
```

### PEG.jl による記述

あとは対応を考えてえいやえいやと文法を定義します、

例えば自然数リテラルはこんな感じになります。

```julia
@rule int = (
                r"0"p, 
                r"[1-9]" & r"[0-9]"[*]
            )
```

定義したら REPL に送って試してみます。

```julia
julia> parse_whole(int, "0")
"0"

julia> parse_whole(int, "123")
2-element Vector{Any}:
 "1"
 Any["2", "3"]

julia> parse_whole(int, "01")
ERROR: ParseError("On line 1, at column 1 (byte 1):\n01\n^ here\nexpected one of the following: r\"^(0)\\s*\", int\n")
Stacktrace:
 [1] parse_next(rule::typeof(int), input::String; whole::Bool)
   @ PEG ~/.julia/packages/PEG/ruwsb/src/PEG.jl:394
 [2] parse_whole(rule::Function, input::String)
   @ PEG ~/.julia/packages/PEG/ruwsb/src/PEG.jl:401
 [3] top-level scope
   @ REPL[25]:1
```

いい感じですね。リテラルはJuliaのASTでもそのまま表現は変わりませんから、普通に `parse` で `Int` に変換してしまいます。 

こんな感じの再帰的に `Vector` を flatten して結合してくれるやつを用意しておくと便利です。

```julia
julia> recjoin(arr::AbstractArray) = join(recjoin.(arr))
recjoin (generic function with 2 methods)

julia> recjoin(s::AbstractString) =  s
recjoin (generic function with 2 methods)

julia> build_int(w::AbstractArray) = parse(Int, recjoin(w))
build_int (generic function with 3 methods)

julia> @rule int = (
                       r"0"p, 
                       r"[1-9]" & r"[0-9]"[*]
                   ) |> build_int
int (generic function with 2 methods)

julia> parse_whole(int, "123")
123
```

浮動小数点数リテラルも同様に定義します。

```julia
julia> @rule float = (
                       r"[0-9]"[+] & r"." & r"[0-9]"[+]
                   ) |> build_float
float (generic function with 2 methods)

julia> parse_whole(float, "12.3")
12.3

julia> parse_whole(float, "0.1")
0.1

julia> parse_whole(float, "3")
ERROR: ParseError("On line 1, at column 2 (byte 2):\n3\n ^ here\nexpected one of the following: r\"^([0-9])\", r\"^(.)\"\n")
Stacktrace:
 [1] parse_next(rule::typeof(float), input::String; whole::Bool)
   @ PEG ~/.julia/packages/PEG/ruwsb/src/PEG.jl:394
 [2] parse_whole(rule::Function, input::String)
   @ PEG ~/.julia/packages/PEG/ruwsb/src/PEG.jl:401
 [3] top-level scope
   @ REPL[64]:1

julia> parse_whole(float, ".3")
ERROR: ParseError("On line 1, at column 1 (byte 1):\n.3\n^ here\nexpected one of the following: r\"^([0-9])\", float\n")
Stacktrace:
 [1] parse_next(rule::typeof(float), input::String; whole::Bool)
   @ PEG ~/.julia/packages/PEG/ruwsb/src/PEG.jl:394
 [2] parse_whole(rule::Function, input::String)
   @ PEG ~/.julia/packages/PEG/ruwsb/src/PEG.jl:401
 [3] top-level scope
   @ REPL[65]:1
```

これで数字リテラルが使えるようになりました。 表記に応じて適切なパースができています。

```
julia> @rule num = float, int
num (generic function with 2 methods)

julia> parse_whole(num, "123.45")
123.45

julia> parse_whole(int, "123")
123
```


さて、今回は浮動小数点数の左右(?)の省略は許さないことにしたので `".3"` がエラーになるのは意図した挙動ですが、
どうしてもこういう場合意図した挙動にできてるかを見逃してしまいがちです。


なので、構文を定義して動かす前に必ずテストケースを十分用意しておきましょう。

テストケース作る $\to$ 構文一個作る $\to$ テストケース通る $\to$ 次の構文一個作る $\cdots$ のループを踏まなかった人には等しく死が訪れます。

例えばこんな感じの実装の仕方がありそうです。

```julia
using PEG
using Test

onfail(body, _::Test.Pass) = true
onfail(body, _::Union{Test.Fail,Test.Error}) = body()

testcases = [
    ("1", int) => (isequal(1)),
    ("10", int) => (isequal(10)),
]


function check(src, rule, expected)
    ast = parse(src, rule=rule)
    result = eval(ast)
    success = expected(result)
    onfail(@test success) do
        @info "Failed. Expected: $expected, got: $result"   
        @info "AST: $ast"
    end
end


@testset "Testset" begin
    for ((src, rule), expected) in testcases
        @info "Test for... \n$src"
        check(src, rule, expected)
    end
end
```

`isequal(x)` は `x` と等しいか判定する関数を返してくれます. 
値を直接書いて比較するより、この形で書いておくとエラーさえ起きなければいい、とか割と自由にテストを書けるので便利です。

正直これ以上はもはや書くことがあんまりなく、

- `@rule` で構文を定義
- REPL に送ってパースしてみて吐かれる解析結果を見る
- それの対応を見て、 AST を作る

というのを繰り返していけば良いです。

完成したものがこちらになります。　実装に詰まったら見てみてください。


<a href="https://github.com/abap34/Minia.jl"><img src="https://gh-card.dev/repos/abap34/Minia.jl.svg?fullname="></a>


## 感想

もし自分が生まれるのが10年, 20年早かったら Lispとかどハマりしてそうだな〜　とおもいました


## 今日の一曲

<iframe width="560" height="315" src="https://www.youtube.com/embed/u5KV0B0teIA?si=BExLRLOYtO5nDJZj" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>




---


$1$ 文脈自由文法の日本語のWikipediaに残ってるレスバの痕跡が好きです。 [ref](https://ja.wikipedia.org/wiki/%E6%96%87%E8%84%88%E8%87%AA%E7%94%B1%E6%96%87%E6%B3%95#cite_ref-3)　


      