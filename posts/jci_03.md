---
title: Julia Compiler Internals (03) - Introduction to Type Inference 
author: abap34
date: 2024/10/15
tag: [JuliaCompilerInternals, Julia, 型推論, コンパイラ]
twitter_id: abap34
github_id: abap34
mail: abap0002@gmail.com
ogp_url: https://abap34.com/posts/jci_03/image.png
description:  Julia コンパイラの内部実装を調べるシリーズの第3回目です。今回は Julia の型推論を概観します。
url: https://abap34.com/posts/jci_03.html
site_name: abap34's blog
twitter_site: @abap34
---

## あらすじ

Juliaのコンパイラの内部実装を読んでいくシリーズです。

シリーズ自体については [第0回](https://abap34.com/posts/jci_00.html) を見てください。

## Type Inference

[前回](https://abap34.com/posts/jci_02.html) は Lowering について概観しました。

今回からは Julia の型推論について概観します。


今回は具体的な型推論アルゴリズムについて詳しく調べる前に、それ以外の部分について整理します。

:::danger
Julia の型推論について学ぶためにこの記事を読むのはオススメしません。

もっと多くのことが、もっとわかりやすく、正確に書いてある文章があるからです。

勉強記録を読む感覚でお願いします。おそらく間違いがたくさんあるので見つけたら↓のコメント欄にお願いします。
:::

もっと良い文章の例:

- [random grad thesis about Julia](https://github.com/aviatesk/grad-thesis)
- [Inference Convergence Algorithm in Julia](https://info.juliahub.com/blog/inference-convergence-algorithm-in-julia)


### What is Type Inference?

まずは (**Juliaにおける**) 型推論とは何かを説明します。


Julia は動的型付けのプログラミング言語です。実行時に $(変数, 場所)$ の型は定まります。

一方で、 Juliaコンパイラは、各コントロールフローにおける変数の型を実際に実行する前に可能な限り推論します。

それによって最適化─ 例えば多重ディスパッチで実際に呼び出すメソッドを静的に解決したりします。


さらに、Juliaの型推論は inter-procedural に行われていて、その関数の中で呼び出される関数にも飛んでいって解析を行います。

この辺どこまで潜るかのトレードオフは大変そうに見えますが、実際大変なようです。 [^1]

[^1]: https://techblog.recruit.co.jp/article-912/

### Example

例えば `f(x) = 2x` という関数を考えます。

これは、 `x::Int` なら `Int` が帰ってきます。

```julia-repl
julia> f(x) = 2x
f (generic function with 1 method)

julia> @code_typed f(2)
CodeInfo(
1 ─ %1 = Base.mul_int(2, x)::Int64
└──      return %1
) =>
Int64
```     

`@code_typed` マクロで実際推論できているのがわかります。

さらに `x::Float64` なら `Float64` が帰ってきます。

```julia-repl
julia> @code_typed f(2.0)
CodeInfo(
1 ─ %1 = Base.mul_float(2.0, x)::Float64
└──      return %1
) => Float64
```

推論できてますね。さらに、内部的には　`mul_int` と `mul_float` が使われています。


ではもう少し意地悪な例を検討してみます。

```julia-repl
julia> a = 2
2

julia> f(x) = a * x
f (generic function with 1 method)

julia> f(3)
6
```

グローバル変数 `a` を定義して　`f(x) = a * x` とします。 `f(3)` は 6 と正しく計算できていますが、

```julia-repl
julia> @code_typed f(2)
CodeInfo(
1 ─ %1 = Main.a::Any
│   %2 = (%1 * x)::Any
└──      return %2
) => Any
```

と、 `Any` となりました。  これは `Main.a` の型を考慮した型推論は Julia は行わないためです。 (これがなぜかは分かりません。)

さらに、出力をよく見るとこれまで特化した関数 (`mul_int`, `mul_float`) が使われていたところが `*` になっています。


(`@code_typed` によって行われるものという意味で、) 

Julia の型推論プロセス全体は 

<div style="text-align: center;">

**引数の実際の型**　

⬇︎ から、 

**各処理における型を推論** (推測ではない) 

⬇︎  して、 

**最適化を行う** 

</div>

 ものと言えます。


### How Julia's Type Inference Works (アルゴリズム以外)

まず、具体的な型推論アルゴリズムに入る前に、一旦読むべきところだけ整理します。



第 0 回で掲載した Julia の処理系の概観図を再掲します。

![](jci_03/image-1.png)


Julia の型推論は、 Lowering されて得た IR に対して行われます。


前回まででみたように IR は以下のようなものでした.

- マクロは全て展開済み
- ループなども分解されて、全て直列の命令に書き換えられている


型推論の「入力」はこれになります。 `CodeInfo` という型のオブジェクトです。

```julia-repl
julia> ci = @code_lowered f(2)
CodeInfo(
1 ─ %1 = Main.a * x
└──      return %1
)

julia> dump(ci)
Core.CodeInfo
  code: Array{Any}((2,))
    1: Expr
      head: Symbol call
      args: Array{Any}((3,))
        1: GlobalRef
          mod: Module Main
          name: Symbol *
          binding: Core.Binding
            value: #undef
            globalref: GlobalRef#= circular reference @-2 =#
            owner: Core.Binding
              value: * (function of type typeof(*))
              globalref: GlobalRef
                mod: Module Base
                name: Symbol *
                binding: Core.Binding
              owner: Core.Binding#= circular reference @-1 =#
              ty: #undef
              flags: UInt8 0x07
            ty: #undef
            flags: UInt8 0x00
        2: GlobalRef
          mod: Module Main
          name: Symbol a
          binding: Core.Binding
            value: Int64 2
            globalref: GlobalRef#= circular reference @-2 =#
            owner: Core.Binding#= circular reference @-1 =#
            ty: Any
            flags: UInt8 0x00
        3: Core.SlotNumber
          id: Int64 2
    2: Core.ReturnNode
      val: Core.SSAValue
        id: Int64 1
  codelocs: Array{Int32}((2,)) Int32[0, 0]
  ssavaluetypes: Int64 2
  ssaflags: Array{UInt32}((2,)) UInt32[0x00000000, 0x00000000]
  method_for_inference_limit_heuristics: Nothing nothing
  linetable: Array{Any}((1,))
    1: Core.LineInfoNode
      module: Module Main
      method: Symbol f
      file: Symbol REPL[19]
      line: Int32 1
      inlined_at: Int32 0
  slotnames: Array{Symbol}((2,))
    1: Symbol #self#
    2: Symbol x
  slotflags: Array{UInt8}((2,)) UInt8[0x00, 0x08]
  slottypes: Nothing nothing
  rettype: Any
  parent: Nothing nothing
  edges: Nothing nothing
  min_world: UInt64 0x0000000000000001
  max_world: UInt64 0xffffffffffffffff
  inferred: Bool false
  propagate_inbounds: Bool false
  has_fcall: Bool false
  nospecializeinfer: Bool false
  inlining: UInt8 0x00
  constprop: UInt8 0x00
  purity: UInt16 0x0000
  inlining_cost: UInt16 0xffff
```

と、こんな感じです。

型推論の本質パートは `typeinfer.jl`, `abstractinterpretation.jl` などにあり、 `typeinf` とその中身である `_typeinf` などを見ると良いです。

:::warning
このあたりのフローはバージョン違いでかなり構造が変わっていました。初回記事に見ているコミットが載っているので確認してください。
:::

なんやかんやあるのですが、 (え？) 最終的にはおそらく `abstract_call_*` 関数たちが実際に型推論を行っているのだと思います。

なんやかんやはメモ用の scrapbox にあります: [https://scrapbox.io/reading-julia-internal/](https://scrapbox.io/reading-julia-internal/)


あまりにも中身がないですが、一応今回 具体的な型推論アルゴリズムについて詳しく調べる前に、それ以外の部分について整理する記事、なのでここまでです。


(毎記事頑張って中身を詰めることにすると全然 Publish されなくなってしまうので...)


次回は、 @aviatesk さんの解説記事を参考に実際の Julia の型推論のアルゴリズムについて見ていきます。


## 今日の一曲

<iframe width="560" height="315" src="https://www.youtube.com/embed/EsJGbHJyXYc?si=ICCQt996hR6xyQR5" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>