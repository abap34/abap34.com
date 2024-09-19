---
title: Julia Compiler Internals (01) - Lowering (1)
author: abap34
date: 2024/09/20
tag: [JuliaCompilerInternals, Julia, Scheme, コンパイラ, Lowering]
twitter_id: abap34
github_id: abap34
mail: abap0002@gmail.com
ogp_url: https://images.dog.ceo/breeds/pinscher-miniature/n02107312_3980.jpg
description: Julia コンパイラの内部実装を調べるシリーズの第1回目です。今回は Lowering について概観します。
url: https://abap34.com/posts/jci_01.html
site_name: abap34's blog
twitter_site: @abap34
---

## あらすじ

Juliaのコンパイラの内部実装を読んでいくシリーズです。

シリーズ自体については [第0回](https://abap34.com/posts/jci_00.html) を見てください。

あまり正確なことを書けている自信がないので、誤り等あればコメントで指摘していただけるとありがたいです

## Lowering

[前回](https://abap34.com/posts/jci_00.html) は Juliaの処理系の大まかな流れを見ました。

今回からは、各セクション (Lowering, Type Inference, ...) の処理の大枠を見ていきます。

### What is Lowering?

前回も書きましたが、 Lowering は AST を もう少しネイティブに近い IR に変換する処理です。

例えば、

```julia-repl
julia> ex = quote
       s = 0
       for i in 1:10
           s += i
       end
       end
```

は


```julia-repl
julia> Meta.lower(Main, ex)
:($(Expr(:thunk, CodeInfo(
    @ REPL[1]:2 within `top-level scope`
1 ─       Core.NewvarNode(:(#s1))
│   %2  = Core.get_binding_type(Main, :s)
│         @_4 = 0
│   %4  = @_4 isa %2
└──       goto #3 if not %4
2 ─       goto #4
3 ─       @_4 = Base.convert(%2, @_4)
4 ┄       s = @_4
│   @ REPL[1]:3 within `top-level scope`
│   %9  = 1:10
│         #s1 = Base.iterate(%9)
│   %11 = #s1 === nothing
│   %12 = Base.not_int(%11)
└──       goto #7 if not %12
5 ┄ %14 = #s1
│         i = Core.getfield(%14, 1)
│   %16 = Core.getfield(%14, 2)
│   @ REPL[1]:4 within `top-level scope`
│         s = s + i
│   @ REPL[1]:5 within `top-level scope`
│         #s1 = Base.iterate(%9, %16)
│   %19 = #s1 === nothing
│   %20 = Base.not_int(%19)
└──       goto #7 if not %20
6 ─       goto #5
7 ┄       return nothing
))))
```


と、 `for` ループが 直列の命令と分岐に展開されているのがわかります。


### jl_expand

`base/meta.jl#L161` を見てください。

```julia
lower(m::Module, @nospecialize(x)) = ccall(:jl_expand, Any, (Any, Any), x, m)
```

このように Lowering は `jl_expand` によって行われます。　

`src/ast.jl#L1280` に定義があります。

```c
// Lower an expression tree into Julia's intermediate-representation.
JL_DLLEXPORT jl_value_t *jl_expand(jl_value_t *expr, jl_module_t *inmodule)
{
    return jl_expand_with_loc(expr, inmodule, "none", 0);
}

// Lowering, with starting program location specified
JL_DLLEXPORT jl_value_t *jl_expand_with_loc(jl_value_t *expr, jl_module_t *inmodule,
                                            const char *file, int line)
{
    return jl_expand_in_world(expr, inmodule, file, line, ~(size_t)0);
}

// Lowering, with starting program location and worldage specified
JL_DLLEXPORT jl_value_t *jl_expand_in_world(jl_value_t *expr, jl_module_t *inmodule,
                                            const char *file, int line, size_t world)
{
    JL_TIMING(LOWERING, LOWERING);
    jl_timing_show_location(file, line, inmodule, JL_TIMING_DEFAULT_BLOCK);
    JL_GC_PUSH1(&expr);
    expr = jl_copy_ast(expr);
    expr = jl_expand_macros(expr, inmodule, NULL, 0, world, 1);
    expr = jl_call_scm_on_ast_and_loc("jl-expand-to-thunk", expr, inmodule, file, line);
    JL_GC_POP();
    return expr;
}
```

と、結局 `jl_expand_in_world` が呼ばれています。    

`jl_expand_in_world` では gc・マクロ展開関連の処理もありますが、一旦今回は

`jl_expand_macros` と `jl_call_scm_on_ast_and_loc` に集中することにします。

`jl_call_scm_on_ast_and_loc` では Scheme で書かれた Lowering の処理がよばれます。


(ちなみに、最近では Juliaでこれを書き直すという取り組み[^1]もあるようです。)

### compile-body


さて、 Scheme側ではなんやかんやあって最終的に `src/julia-syntax.scm` にある実装たちが本質パートを担当してくれます。

このファイルは 5000行以上あってかなり大変な見た目をしていますが、一旦やっていることをあたるにはおそらく `src/julia-syntax.scm#L5176` を見れば良さそうです。

```scheme
(define (julia-expand1 ex file line)
  (compact-and-renumber
   (linearize
    (closure-convert
     (analyze-variables!
      (resolve-scopes ex)))) file line))
```


一旦、 Lowering でおそらく一番核心的なことである制御構文をバラして直列の命令にしているところ (= `linearize`) だけ注目してみることにします。

するとこれは `compile-body` という関数がやってくれいていることを読み取れます。


```scheme
(define (linearize e)
  (cond ((or (not (pair? e)) (quoted? e)) e)
        ((eq? (car e) 'lambda)
         (set-car! (cdddr e) (compile-body (cadddr e) (append (car (caddr e))
                                                              (cadr (caddr e)))
                                           e)))
        (else (for-each linearize (cdr e))))
  e)
```

`compile-body` を見ましょう。 `src/julia-syntax.scm#4296` です。


**... 長い！！！ (700行↑)**


一旦真面目に全部読むのは後に回すとして、処理の概略を雰囲気で読み取ることを試みます。

まず、先頭ではラベルのカウンタとかが置いてあります。 これを使って goto のラベルを作っているように見えますね。

```scheme
(define (make-label)
    (begin0 label-counter
            (set! label-counter (+ 1 label-counter))))
(define (mark-label l) (emit `(label ,l)))
(define (make&mark-label)
    (if (and (pair? code) (pair? (car code)) (eq? (caar code) 'label))
        ;; use current label if there is one
        (cadr (car code))
        (let ((l (make-label)))
        (mark-label l)
        l)))
```


続いて、例えば L4663 を見ます。

```scheme
((if elseif)
    (let* ((tests (emit-cond (cadr e) break-labels '_))
        (end-jump `(goto _))
        (val (if (and value (not tail)) (new-mutable-var) #f)))
    (let ((v1 (compile (caddr e) break-labels value tail)))
        (if val (emit-assignment val v1))
        (if (and (not tail) (or (length> e 3) val))
            (begin (emit `(line #f))
                (emit end-jump)))
        (let ((elselabel (make&mark-label)))
        (for-each (lambda (test)
                    (set-car! (cddr test) elselabel))
                    tests))
        (let ((v2 (if (length> e 3)
                    (compile (cadddr e) break-labels value tail)
                    '(null))))
        (if val (emit-assignment val v2))
        (if (not tail)
            (set-car! (cdr end-jump) (make&mark-label))
            (if (length= e 3)
                (emit-return tail v2)))
        val))))
```


どうも `if, elseif` がジャンプに書き換えられていそうです。

実際、


```julia-repl
julia> ex = quote
           if rand() < 0.5
               1
           else
               0
           end
       end
quote
    #= REPL[11]:2 =#
    if rand() < 0.5
        #= REPL[11]:3 =#
        1
    else
        #= REPL[11]:5 =#
        0
    end
end

julia> Meta.lower(Main, ex)
:($(Expr(:thunk, CodeInfo(
    @ REPL[11]:2 within `top-level scope`
1 ─ %1 = rand()
│   %2 = %1 < 0.5
└──      goto #3 if not %2
    @ REPL[11]:3 within `top-level scope`
2 ─      return 1
    @ REPL[11]:5 within `top-level scope`
3 ─      return 0
))))
```

ですね。 最初に見た `make&mark-label` で goto のラベルを作っているのがわかります。


このような定義が前後で延々と続いていて、どうも素直に制御構文ごとにバラし方を考えて、順番にバラしているようです。


## まとめ

julia-syntax.scm の blame をみるとわかるんですが、 10年近く前に Jeff さんが書いたコードが大部分を占めていてすごい。

... すごいんですが、やっぱり読むのはなかなか骨が折れるので、 JuliaLowering には期待したいところですね。

## 今日の一曲

<iframe width="560" height="315" src="https://www.youtube.com/embed/d0ARerCxF8c?si=Gz4RV12QlRHvTJgH" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>


[^1]: JuliaLowering.jl というのがあるみたいです。 (まだ experimental)  [JuliaLowering.jl](https://github.com/c42f/JuliaLowering.jl)  

