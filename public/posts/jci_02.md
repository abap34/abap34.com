---
title: Julia Compiler Internals (02) - Lowering (2) for の linearize
author: abap34
date: 2024/09/21
tag: [JuliaCompilerInternals, Julia, Scheme, コンパイラ, Lowering]
twitter_id: abap34
github_id: abap34
mail: abap0002@gmail.com
ogp_url: https://images.dog.ceo/breeds/dachshund/Dash_Dachshund_With_Hat.jpg
description: Julia コンパイラの内部実装を調べるシリーズの第2回目です。今回は Lowering における for文の処理について少し書きます。
url: https://abap34.com/posts/jci_02.html
site_name: abap34's blog
twitter_site: @abap34
---

## あらすじ

Juliaのコンパイラの内部実装を読んでいくシリーズです。

シリーズ自体については [第0回](https://abap34.com/posts/jci_00.html) を見てください。

## Lowering

[前回](https://abap34.com/posts/jc2_00.html) は Lowering について概観しました。

今回は、Lowering における for文の処理について少し書きます。

### for の出自

for はいうまでもなくトップクラスに使われる制御構文ですが、 Juliaにおいては for は以下のような対応の糖衣構文です。

```julia
for i in 1:10
    println(i)
end
```

$\Leftrightarrow$

```julia
_next = iterate(1:10)
while _next !== nothing
    (i, state) = _next
    println(i)
    _next = iterate(1:10, state)
end
```

(このあたりのことは、 [@antimon2](https://x.com/antimon2) さんに教えてもらいました。ありがとうございます。)


`while` は前回見たように `compile` でバラされていましたが、この糖衣構文を desugar するのはどこでやっているのか見てみます。

### desugar

degugar は `julia-syntax.scm` で行われています。

例えばわかりやすそうなのでいくと `julia-syntax.scm#L44` に

```scheme
;; generate first comparison call, converting e.g. (a < b < c)
;; to ((call < a b) b < c)
(define (compare-one e)
  (let* ((arg   (caddr e))
         (arg2  (if (and (pair? arg)
                         (pair? (cdddr e)))
                    (make-ssavalue) arg)))
    (if (and (not (dotop-named? (cadr e)))
             (length> e 5)
             (pair? (cadddr (cdr e)))
             (dotop-named? (cadddr (cddr e))))
        ;; look ahead: if the 2nd argument of the next comparison is also
        ;; an argument to an eager (dot) op, make sure we don't skip the
        ;; initialization of its variable by short-circuiting
        (let ((s (make-ssavalue)))
          (cons `(block
                  ,@(if (eq? arg arg2) '() `((= ,arg2 ,arg)))
                  (= ,s ,(cadddr (cdr e)))
                  (call ,(cadr e) ,(car e) ,arg2))
                (list* arg2 (cadddr e) s (cddddr (cdr e)))))
        (cons
         (add-init arg arg2
                   `(call ,(cadr e) ,(car e) ,arg2))
         (cons arg2 (cdddr e))))))
```

とあります。

これは `a < b < c` という糖衣構文を `(a < b) < c` に desugar する処理です。

このまま見ていくと `julia-syntax.scm#L1791` に 以下のようなものを見つけることができます。


```scheme
(define (expand-for lhss itrs body)
  (define (outer? x) (and (pair? x) (eq? (car x) 'outer)))
  (let ((copied-vars  ;; variables not declared `outer` are copied in the innermost loop
         ;; TODO: maybe filter these to remove vars not assigned in the loop
         (delete-duplicates
          (filter (lambda (x) (not (underscore-symbol? x)))
                  (apply append
                         (map lhs-vars
                              (filter (lambda (x) (not (outer? x))) (butlast lhss))))))))
    `(break-block
      loop-exit
      ,(let nest ((lhss lhss)
                  (itrs itrs))
         (if (null? lhss)
             body
             (let* ((coll  (make-ssavalue))
                    (next  (gensy))
                    (state (make-ssavalue))
                    (outer (outer? (car lhss)))
                    (lhs   (if outer (cadar lhss) (car lhss)))
                    (body
                     `(block
                       ,@(if (not outer)
                             (map (lambda (v) `(local ,v)) (lhs-vars lhs))
                             '())
                       ,(lower-tuple-assignment (list lhs state) next)
                       ,(nest (cdr lhss) (cdr itrs))))
                    (body
                     (if (null? (cdr lhss))
                         `(break-block
                           loop-cont
                           (soft-let (block ,@(map (lambda (v) `(= ,v ,v)) copied-vars))
                             ,body))
                         `(scope-block ,body))))
               `(block (= ,coll ,(car itrs))
                       (local ,next)
                       (= ,next (call (top iterate) ,coll))
                       ;; TODO avoid `local declared twice` error from this
                       ;;,@(if outer `((local ,lhs)) '())
                       ,@(if outer `((require-existing-local ,lhs)) '())
                       (if (call (top not_int) (call (core ===) ,next (null)))
                           (_do_while
                            (block ,body
                                   (= ,next (call (top iterate) ,coll ,state)))
                            (call (top not_int) (call (core ===) ,next (null))))))))))))
```

ちょっと長いですが、 どうも for を先ほどの while に書き直す処理がなされていることがわかります。

なので、 for は

desugar → (while として) `compile` というながれで AST から linearize されて IR になることがわかりました。


## まとめ

ヤクルト最近ちょっと強いですね〜

## 今日の一曲

何かの間違いでヤクルトに入団してほしい。



<iframe width="560" height="315" src="https://www.youtube.com/embed/BtH57Tku3qY?si=aMpxcnxTpfFvwmbf" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
