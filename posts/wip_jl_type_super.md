---
title: Julia の型とはなんたるや
author: abap34
date: 2025/10/28
tag: [Julia, コンパイラ, 型システム, gdb]
twitter_id: abap34
github_id: abap34
mail: abap0002@gmail.com
ogp_url: https://abap34.com/posts/jl_type_super/thumbnail.png
description: gdb で実行を追いながら Julia コンパイラのデバッグをする便利な方法と型システムの正確な理解を試みます．
url: https://abap34.com/posts/jl_type_super.html
site_name: abap34's blog
twitter_site: abap34
---

:::info
この記事の内容は全て `065ec06a5f` の実装に基づいています．

Julia の基本的な知識がある中級者の人向けの記事のつもりです．
:::

なお，この記事で登場する言葉は全て Julia の実行時オブジェクトに関しての議論です．

バッククォートで囲まれているものは全て Julia のオブジェクトやプログラムを指しています．

## はじめに

次のような Julia の仕様に関する記述は正しいでしょうか？

1. `T` が concrete type のとき `S <: T` となる `S` は存在しない．
2. そうでした， `T == S` のとき `S <: T` ですね． でも他の型に対して `S <: T` となることはないです．
3. あ， `Union{}` という例外がありました．
   まとめると， concrete type `T` と 型 `S` が `S <: T` を満たすのは `T == S` か `T == Union{}` のときに限ります．

他にも，こんな主張はどうでしょうか？

1. Julia の型は concrete type と abstract type に分けられる．
1. `supertype(T)` は `Union` 型( `Union{}` を含む) 以外の型を受け取り直接の親の型を返す関数である．
   ここで，`T` の直接の親とは `T <: U` なる `U` であって `S <: U` なる `S` が存在しないもの．
2. `a isa T` とは `typeof(a) <: T` のことである．

私はこの記述は全て誤り (もしくは曖昧，不正確) と考えています．


この記事では `supertype`，それと `Type{T}` を中心に，
この辺りの仕様をなるべく正確に解説することを試みてみます．


正直なところあまり役には立たないと思いますが，細かいところが気になる人は暇つぶしにどうぞ．


## Julia の型のキホン
### インスタンスであるとは？

「`a` が `T` のインスタンスである」とはどういうことでしょうか？

一旦全ての知識や考察を吹き飛ばしたことにすると，二つ定義の仕方があると思っています．

1. `typeof(a) == T` であること
2. `a isa T` とか `typeof(a) <: T` であること

もちろん定義ですからどちらを採用しても直ちにダメになるというわけではないですが， Julia のドキュメントでは 2 の定義が採用されているように見えます．
(他のプログラミング言語でも普通 2 の意味だと思います．)

例えば `::` は "is an instance" と説明されていますが，

> **the :: operator is read as "is an instance of".**  [(https://docs.julialang.org/en/v1/manual/types/)](https://docs.julialang.org/en/v1/manual/types/)

`3::Number` ですし， `3::Any` です． (全てのオブジェクトは `Any` のインスタンスであるとも書かれていますね)

そのため 2 を採用することにしましょう． `a isa T` と `typeof(a) <: T` は違うと書きましたが，「だいたい」同じなのでそこは後で追及します．

### サブタイプであるとは？

「`S` が `T` のサブタイプ (部分型) である」とはどういうことでしょうか？
そもそも `S` や `T` が型であるとはどういうことでしょうか？

### 型であるとは？

Julia の型システムでは型は concrete type と abstract type に分類できるとよく言われます．

よくなされる説明は次のようなものだと思います．

- concrete type とはインスタンスが存在する型で， abstract type とはインスタンスが存在しない型である．

しかしこれは上のインスタンスの説明から考えると不適切です．
`Number` は abstract type なのですが `3 isa Number` ですし `typeof(3) <: Number` なので， `Number` はインスタンスが存在する型になってしまいます．


この定義が意図するところを汲んだより正確な表現は


- `T` が concrete type である とは `typeof(a) == T` となる `a` が存在することであり， abstract type であるとはそうでないことである．


ということだと思います． 実際にオブジェクトにタグとしてつきうるものが concrete type である，と言ってもいいです．

ではこれで大丈夫でしょうか？実際には以下のような例があります:

```julia
julia> isconcretetype(Array)
false

julia> isabstracttype(Array)
false
```

このように `isconcretetype` も `isabstracttype` も `false` を返す型っぽいオブジェクトが存在します．さすがに `isconcretetype` は concrete type であるかを判定して
`isabstracttype` は abstract type であるかを判定する関数であって欲しいところです．これはバグでしょうか？それとも `Array` は型ではないのでしょうか？
そもそも Julia において，`T` が型であるとはどういうことでしょうか？


それを探るため，型を渡して欲しそうな関数に変なものを渡してみると

```julia
julia> 1 <: Any
ERROR: TypeError: in <:, expected Type, got a value of type Int64
Stacktrace:
 [1] top-level scope
   @ REPL[65]:1
```

と出ます．この `expected Type` は特別なエラー特別なものでもなんでもなく， `Type` 型のオブジェクトでなければならない，といういつものやつです．
[https://github.com/JuliaLang/julia/blob/e55ab3c99ace9b1fc08ce5f3ba72fec466e0822a/src/builtins.c#L580-L587](https://github.com/JuliaLang/julia/blob/e55ab3c99ace9b1fc08ce5f3ba72fec466e0822a/src/builtins.c#L580-L587)


つまり， 「`T` が型であるとは `T` が `Type` のインスタンスであること」と言っても良さそうです．そう定義しましょう．

:::definition
`T` が Julia の型である とは `T` が `Type` のインスタンスであることである．
:::

`subtypes(Type)` による出力を調べると

```julia
julia> subtypes(Type)
4-element Vector{Any}:
 Core.TypeofBottom
 DataType
 Union
 UnionAll
```

でした． これらは Julia では **"kind"** と呼ばれています．

いきなり説明をするとこれらは次のようなものです．

1. `Core.TypeofBottom` : `Union{}` の型 ( `typeof(Union{})` )
2. `UnionAll` : 自由な型パラメータを持つ型の型 ( `typeof(Array{T} where T)`, `typeof(Int)` など)
3. `Union` : `Union` 型の型 ( `typeof(Union{Int, String})` など)
4. `DataType` : 自由な型パラメータを持たない型の型 ( `typeof(Int)`, `typeof(String)`, `typeof(Vector{Int})` など)

それぞれについて説明します．

#### Core.TypeofBottom

`Core.TypeofBottom` は `Union{}` の型の型です．
さらにこれは唯一のインスタンスです． つまり `Core.TypeofBottom` はシングルトン型です．

```julia
julia> typeof(Union{})
Core.TypeofBottom

julia> Union{} isa Core.TypeofBottom
truer

julia> Base.issingletontype(Core.TypeofBottom)
true
```

##### Core.TypeofBottom のサブタイピング関係

`Core.TypeofBottom` のインスタンス (`Union{}`) は次のようなサブタイピング関係を持ちます．

**[Core.TypeofBottom のサブタイピング関係]**

すべての型 `T` に対して `Union{} <: T` である．


##### UnionAll

`UnionAll` は自由な型パラメータを持つ型の型です．


例えば単に `Array` と書いたとき，　これは `Array{T, N} where {T, N}` と等価です．


この `Array{T, N} where {T, N}` が `UnionAll` のインスタンスの

```julia
julia> typeof(Array)
UnionAll

julia> typeof(Array{Int, N} where N)
UnionAll
```



##### UnionAll のサブタイピング関係

**[UnionAll のサブタイピング関係]**

`UnionAll` 型は次のようなサブタイピング関係を持ちます．






#### Union

`Union` は `Union` でかなり奥が深いのですが，今回の記事の主題ではないので詳しい説明は割愛します．

```julia
julia> typeof(Union{Int, String})
Union

julia> Union{Int, String} isa Union
```

注意点としては `Union{Int, String}` は 「型パラメータをもつ `Union` のパラメータ `Int` と `String` を割り当てたもの」ではなく，
単に　

```julia
struct Union <: Type{T}
  a::Any
  b::Any
end
```

として実装されていることに注意してください． (サブタイピングやその他では特別に扱われています)

例えば

```julia
julia> Union{Int, String} <: Union
false
```

です．






結論から言うと，
「Julia の型は abstract type と concrete type に分けられる」という説明は
「Julia の `DataType` は concrete type または abstract type に分けられる」とすると
正しい説明になります．

実装から確認してみましょう．

`isconcretetype` と `isabstracttype` はそれぞれ次のように実装されています．

```julia
isconcretetype(@nospecialize(t)) = (@_total_meta; isa(t, DataType) && (t.flags & 0x0002) == 0x0002)


function isabstracttype(@nospecialize(t))
    @_total_meta
    t = unwrap_unionall(t)
    # TODO: what to do for `Union`?
    return isa(t, DataType) && (t.name.flags & 0x1) == 0x1
end
```


一方で，冒頭に書いた

> concrete type `T` と 型 `S` が `S <: T` を満たすのは `T == S` か `T == Union{}` のときに限ります．

に関しては以下のような反例があります:

```julia
julia> T = DataType
DataType

julia> typeof(Int) == T  # `DataType` は concrete type である
true

julia> S = Type{Int}
Type{Int64}

julia> S <: T
true

julia> T == S, T == Union{}
(false, false)
```

`DataType` は concrete type ですが， `Type{Int}` という subtype を持ちます．

というわけで，ここからはイメージと違う挙動をしている `Type{T}` について説明します．

## Type{T} について

`Type{T}` は `Core.Type` 型です．

これは型パラメータ `T` を持つ parametric type です．

```julia
julia> (Type{T} where T) == Core.Type
true

julia> Type{Int}
Type{Int64}

julia> Type{Type{:abc}}
Type{Type{:abc}}
```

先に使いみちの方を説明します． `Type{T}` はインスタンスとして唯一 `T` を持つ型，つまり

- `a` が `Type{T}` のインスタンスであるなら `a == T` である

型です．そのため，次のようなコードを書くことができます．

```julia
julia> f(::Type{Int}) = "This is Int"
f (generic function with 1 method)

julia> f(::Type{String}) = "This is String"
f (generic function with 2 methods)

julia> f(Int)
"This is Int"

julia> f(String)
"This is String"

julia> f(1)
ERROR: MethodError: no method matching f(::Int64)
...
```

上のように，`Type{T}` は型 `T` 自体を引数として受け取るために使うことができます．

例えば `parse(Int, "123")` などが実践的な例ですね． [https://github.com/JuliaLang/julia/blob/065ec06a5fa937ff9748bde2c558f4983b472f13/base/parse.jl#L262-L266](https://github.com/JuliaLang/julia/blob/065ec06a5fa937ff9748bde2c558f4983b472f13/base/parse.jl#L262-L266)

こうなるとここで先ほどふわっと採用された「インスタンスである」の正確な定義が必要になります．


先ほど採用したものを再掲します．

> `a isa T` とか `typeof(a) <: T` であること

ここで `a` を `Int`, `T` を `Type{Int}` とすると

```julia
julia> a = Int
Int64

julia> typeof(a)
DataType

julia> T = Type{Int}
Type{Int64}

julia> typeof(a) <: T, a isa T
(false, true)
```

結果が違ってしまいました！ `DataType <: Type{Int}` ではないですが `Int isa Type{Int}` となっています．
`T` が `Type{T}` のインスタンスであるという性質と合致するのは `isa` の方ですね．


実際こちらがインスタンスの定義として採用されていると思います．
差が生まれているのはここだけでしょうか？実装を確認してみます．

また，ついでに Julia コンパイラの C の部分をデバッグする方法についても紹介しようと思います．


まずは Julia コンパイラをデバッグ用にコンパイルします．

```julia
make debug -j 8 # <- nproc
```

コンパイルにはそこそこ時間がかかります． (手元の PC では 30 分くらいかかりました)

散歩に行くかお風呂に入るなど Twitter 以外をして待ちましょう．



コンパイルが終わると `./usr/bin/julia-debug` という実行ファイルができるのでこれを使ってデバッグします．

`isa` のロジックは [https://github.com/JuliaLang/julia/blob/065ec06a5fa937ff9748bde2c558f4983b472f13/src/subtype.c#L2480-L2532](https://github.com/JuliaLang/julia/blob/065ec06a5fa937ff9748bde2c558f4983b472f13/src/subtype.c#L2480-L2532) にある `jl_isa` 関数で実装されています．


ここに breakpoint を仕掛けて `isa` の挙動を確認してみましょう．

```bash
~/D/julia (master)> sudo gdb --args ./usr/bin/julia-debug --startup-file=no
```

で起動します．　ここで，単純に `jl_isa` に breakpoint を仕掛けるとさまざまな内部の処理でも止まってしまうので，　`Int isa Type{Int}` のときだけ止まるようにします．

```bash
(gdb) run
The program being debugged has been started already.
Start it from the beginning? (y or n) y
Starting program: /home/abap34/Desktop/julia/usr/bin/julia-debug --startup-file=no
[Thread debugging using libthread_db enabled]
Using host libthread_db library "/lib/x86_64-linux-gnu/libthread_db.so.1".
[Detaching after fork from child process 194672]
[New Thread 0x7fffe4bff640 (LWP 194674)]
[New Thread 0x7fffde1fc640 (LWP 194675)]
               _
   _       _ _(_)_     │  Documentation: https://docs.julialang.org
  (_)     | (_) (_)    │
   _ _   _| |_  __ _   │  Type ? for help, ]? for Pkg help.
  | | | | | | |/ _` |  │
  | | |_| | | | (_| |  │  Version 1.13.0-DEV.1389 (2025-10-27)
 _/ |\__'_|_|_|\__'_|  │  Commit 065ec06a5f (⌛ 1 day old master)
|__/                   │

julia> using Base: pointer_from_objref

julia> xp = UInt(pointer_from_objref(Int))
0x00007fffea6b94d0

julia> tp = UInt(pointer_from_objref(Type{Int}))
0x00007fffe64595b0
```

として

```bash
(gdb) set $xp = (uintptr_t)0x00007fffea6b94d0
(gdb) set $tp = (uintptr_t)0x00007fffe64595b0
(gdb) break ijl_isa if (uintptr_t)x==$xp && (uintptr_t)t==$tp
Breakpoint 1 at 0x7ffff70f2bf2: file /home/abap34/Desktop/julia/src/subtype.c, line 2482.
```

のようにすれば `Int isa Type{Int}` のときだけ止まります．

```bash
(gdb) continue
Continuing.
julia> ^C

julia> Int isa Type{Int}

Thread 1 "julia-debug" hit Breakpoint 1, ijl_isa (x=0x7fffea6b94d0 <jl_system_image_data+70288592>, t=0x7fffe64595b0 <jl_system_image_data+689584>) at /home/abap34/Desktop/julia/src/subtype.c:2482
```

というわけで breakpoint に hit しました．

ここから実際にいろいろデバッグしていけるわけですが，次のような Julia コンパイラをデバッグするのに便利な関数を紹介します．

まず `jl_` です．これをすると `jl_value_t*` を既視感のある書式で表示してくれます．

```bash
(gdb) call jl_(t)
Type{Int64}
```

他にも `jl_typeof` で型タグを確認できます．

```bash
(gdb) call jl_(jl_typeof(x))
typeof(DataType)
```

