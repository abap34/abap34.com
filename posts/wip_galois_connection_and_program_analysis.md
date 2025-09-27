---
title: Galois 接続とプログラム解析 (Lean もあるよ)
author: abap34
date: 2025/09/11
tag: [プログラム解析, Galois 接続, 抽象解釈, 静的解析, コンパイラ, プログラミング言語, Lean]
twitter_id: abap34
github_id: abap34
mail: abap0002@gmail.com
ogp_url: https://images.dog.ceo/breeds/corgi-cardigan/n02113186_9807.jpg
description: Galois 接続とプログラム解析への応用についての記事です． Lean による形式化もあります．
url: https://abap34.com/posts/galois_connection_and_program_analysis.html
site_name: abap34's blog
twitter_site: abap34
---

## プログラム解析と抽象解釈，Galois 接続

この記事では，プログラム解析という言葉をざっくり「(みんなが思う) ふつうの実行前にプログラムの性質を調べる技術」という意味で使います．

例えば (できるかはさておき)

- ある変数の値がある時点で `null` になるかを調べる
- ある関数呼び出しが例外を投げうるかを調べる
- あるプログラムが停止するかを調べる (!)

などです．

ほとんどのプログラマは日々プログラム解析の恩恵を受けてプログラムを書いています．
例えば補完などはプログラムのある位置で存在しうる変数名の解析が必要ですし，
型推論などもプログラム解析の一種と言えます．


さて，プログラム解析といってもいろいろあり日々研究されていますが，
そのうち  **抽象解釈 (abstract interpretation)** という枠組みによって解析自体を議論する方法があります．

そして，その基礎づけの一つとして「Galois 接続 (Galois connection)」　という概念を使ったものがあります．


[抽象解釈についてはこれまで散々扱ってきた](https://www.abap34.com/search?tag=%E6%8A%BD%E8%B1%A1%E8%A7%A3%E9%87%88) ので，
今回は Galois 接続を使って抽象解釈を捉え直してみようと思います．

また，その内容の一部 [^1] について Lean 4 による形式化にも挑戦してみます．

[mathlib にはすでに Galois 接続のさまざまな性質が収録されている](https://leanprover-community.github.io/mathlib4_docs/Mathlib/Order/GaloisConnection/Defs.html) のですが， lean の勉強も兼ねてコアの部分はなるべく使わず自分で書くことにします．

[^1]: 一部と書いたのは挫折したものがいくらかあるからです．

大抵の定義や証明の下に展開ボタンを置いておきます．押すと Lean のコードが見られます．

:::warn
**⚠️**

筆者は専門家ではないので誤りが含まれる可能性があります．それを念頭に読んでいただけるとありがたいです．

**特に Lean に関しては初心者** なので，誤り等あればコメントからご指摘いただけると幸いです

:::


先に，この後展開される話についてざっくりとした直感的な説明を軽く書いておきます．

プログラム解析は常に最も具体的なものに対してできるとは限りません．例えば


```tekitou-lang
x = 1;
y = 1;

if rand()
    z = x + y;
else
    z = x - y;

print(z);
```

という感じのプログラムの終了時に `z` がとりうる値に関する何らかの解析を行うことを考えてみます．

最も理想的，具体的な解析結果は **「`z` がとりうる値は `0` または `2` である」** ということでしょう．


しかし，このような解析は常にリーズナブルに可能，あるいはそもそも計算可能とも限りません．

そのため，多くのプログラム解析は「いい感じの」ところまで抽象化された値を求めることになります．

例えば
　
- 偶奇のみを考える
- 区間のみを考える
- 型のみを考える

みたいなことです．

プログラム解析はこのような抽象化された実行を考えることといえます．

つまり具体的なもの (例えば典型的には値の集合) と抽象的なもの (偶奇，区間，型など) を対応させていくことが必要になります．
このうち，ある種の望ましい性質を持ったものが Galois 接続です．

これからの実際にそのことを確認していきます・

## Galois 接続の定義と性質

とくに断りがないときは
- 関数は全て全域関数

### 定義

それでは早速定義から始めましょう．いくらか同値な定義 (この後紹介します) がありますが，今回はとりあえずこれを使います．

:::definition

**Galois 接続 (Galois connection)**


半順序集合 $(L, \leq_L)$ と $(M, \leq_M)$, 
$\alpha : L \to M$, $\gamma : M \to L$ が次の条件を満たすとき $(L, \alpha, \gamma, M)$ は**Galois 接続**であるという．


1. $\alpha, \gamma$ は単調である．
2. 任意の $l \in L, m \in M$ に対して $l \leq_L \gamma(\alpha(l))$ かつ $\alpha(\gamma(m)) \leq_M m$

:::


<details>

<summary>対応するプログラム</summary>


最後にここ埋める

</details>


先ほどの説明でいうところでは，

- $L$: 具体的なものの集合
- $M$: 抽象化されたものの集合
- $\alpha$: 具体的な値を抽象化する関数
- $\gamma$: 抽象化された値から具体的な値を取り出す関数

に対応しています．

#### 具体例: 区間解析

値として整数のみが存在するようなプログラミング言語で，
ある変数がある時点でとりうる値の範囲を解析することを考えてみます．


調べたい最も具体的な値は $\mathcal{P}(\mathbb{Z})$ です．
これは集合の包含関係 $\subseteq$ によって半順序集合をなします．


そして「いい感じに抽象化された」値として整数の区間を考えてみましょう．実際には最大値や最小値が存在しないこともあるので，

$$
\text{Interval} = \{ [a, b] \mid a \in \mathbb{Z} \cup \{-\infty\}, b \in \mathbb{Z} \cup \{\infty\}, a \leq b \} \cup \{ [\infty, -\infty] \}
$$

という集合を考えます．これは以下のように定めた $\leq$ によって半順序集合をなします．

$$
[a, b] \leq [c, d] \iff c \leq a \land b \leq d
$$

このとき $\alpha : \mathcal{P}(\mathbb{Z}) \to \text{Interval}$, $\gamma : \text{Interval} \to \mathcal{P}(\mathbb{Z})$ を 

$$
\begin{align*}
  \alpha(l) & = [\mathrm{inf'}(l), \mathrm{sup'}(l)] \\
  \gamma(m) & = \{ z \in \mathbb{Z} \mid \mathrm{inf}(m) \leq z \leq \mathrm{sup}(m) \}
\end{align*}
$$

と定めると **$(\mathcal{P}(\mathbb{Z}), \alpha, \gamma, \text{Interval})$ は Galois 接続です．** 
(条件を確認してみましょう)

ここで $\mathrm{inf'}$ は上限が存在すればそれを，存在しなければ $-\infty$ を返す関数．
$\mathrm{sup'}$ も下限が存在すればそれを，存在しなければ $\infty$ を返す関数です．

例えば

- $\alpha(\{ 1, 2, 3 \}) = [1, 3]$
- $\alpha(\{1, 4, 5\}) = [1, 5]$
- $\alpha(\{2, 4, 6 \dots\}) = [2, \infty]$
- $\alpha(\emptyset) = [\infty, -\infty]$
- $\gamma([1, 5]) = \{ 1, 2, 3, 4, 5 \}$
- $\gamma([1, \infty)) = \{ 1, 2, 3, \dots \}$
- $\gamma([\infty, -\infty]) = \emptyset$

です．

## 性質

ここからはガロア接続の諸性質を見ていきます．

### γ の決定


ところで，初めて私が Galois 接続の定義を見たときに抱いた疑問として， $\gamma$ の役割があります．

Galois 接続がちゃんとプログラム解析のモデルとして妥当なことにして，
$\mathbb{Z}$ を値として持つ言語のプログラムの偶奇解析をすることにしてみます．


すると，解析結果になる抽象的な値:


- 偶数
- 奇数
- 偶数または奇数
- 偶数でも奇数でもない


に対して，　$\gamma$ はそれぞれ $2\mathbb{Z}$, $2\mathbb{Z}+1$, $\mathbb{Z}$, $\emptyset$ を返す以外に妥当な結果があるようには思えません．


結論から言うとこのような感覚は正しく，次のようなことがいえます．

:::theorem
**$\alpha$ に対する $\gamma$ の一意性**

半順序集合 $(L, \leq_L)$， $(M, \leq_M)$, $\alpha : L \to M$, $\gamma_1, \gamma_2 : M \to L$ に対して 

$(L, \alpha, \gamma_1, M)$ と $(L, \alpha, \gamma_2, M)$ がともに Galois 接続であるならば $\gamma_1 = \gamma_2$．

さらに， $(L, \leq_L)$， $(M, \leq_M)$ が完備束のとき

$$
\gamma_1(m) = \gamma_2(m) = \bigsqcup \{ l \in L \mid \alpha(l) \leq_M m \}
$$
:::


まずはこれを示していきます．

はじめに，今後便利に使える同値な定義を一つ紹介します．

:::theorem

**Adjunction (随伴)**

半順序集合 $(L, \leq_L)$ と $(M, \leq_M)$,
$\alpha : L \to M$, $\gamma : M \to L$ が次の条件を満たすとき $(L, \alpha, \gamma, M)$ は
**Adjunction (随伴)** であるという．

$$
\alpha(l) \leq_M m \iff l \leq_L \gamma(m)
$$

:::

<details>
<summary>対応するプログラム</summary>

最後にここ埋める


</details>


:::theorem

半順序集合 $(L, \leq_L)$ と $(M, \leq_M)$,
$\alpha : L \to M$, $\gamma : M \to L$ に対して，次は同値．

1. $(L, \alpha, \gamma, M)$ は Galois 接続である．
2. $(L, \alpha, \gamma, M)$ は Adjunction である．

:::

:::proof

**(1) $\Rightarrow$ (2)**
$$
\begin{align*}
\alpha(l) \leq_M m
    & \implies \gamma(\alpha(l)) \leq_L \gamma(m)
    &                                                      & \text{(monotonicity of $\gamma$)}        \\
    & \implies l \leq_L \gamma(\alpha(l)) \land \gamma(\alpha(l)) \leq_L \gamma(m)
    &                                                      & \text{(definition of Galois connection)} \\
    & \implies l \leq_L \gamma(m)
    &                 & \text{(transitivity of $\leq_L$)}
\end{align*}
$$

また

$$
\begin{align*}
l \leq_L \gamma(m)
    & \implies \alpha(l) \leq_M \alpha(\gamma(m))
    &                                                      & \text{(monotonicity of $\alpha$)}        \\
    & \implies \alpha(l) \leq_M \alpha(\gamma(m)) \land \alpha(\gamma(m)) \leq_M m
    &                                                      & \text{(definition of Galois connection)} \\
    & \implies \alpha(l) \leq_M m
    &                 & \text{(transitivity of $\leq_M$)}
\end{align*}
$$

なので

$$
\alpha(l) \leq_M m \iff l \leq_L \gamma(m)
$$

**(2) $\Rightarrow$ (1)**

先に Galois 接続の条件2:

$$
\forall l \in L, m \in M,  l \leq_L \gamma(\alpha(l)) \land \alpha(\gamma(m)) \leq_M m
$$

を示す．


$l \in L$ に対して

$$
  \begin{align*}
     & \alpha(l) \leq_M \alpha(l)
     &                                     & \text{(reflexivity of $\leq_M$)}                                      \\
     & \implies l \leq_L \gamma(\alpha(l))
     &                                     & \text{(assumption: $\alpha(l) \leq_M m \implies l \leq_L \gamma(m)$)} \\
  \end{align*}
$$

$m \in M$ に対して

$$
  \begin{align*}
     & \gamma(m) \leq_L \gamma(m)
     &                                     & \text{(reflexivity of $\leq_L$)}                                      \\
     & \implies \alpha(\gamma(m)) \leq_M m
     &                                     & \text{(assumption: $l \leq_L \gamma(m) \implies \alpha(l) \leq_M m$)} \\
  \end{align*}
$$

つぎに $\alpha, \gamma$ が単調であることを示す．


$\alpha$ の単調性: $l_1 \leq_L l_2 \implies \alpha(l_1) \leq_M \alpha(l_2)$ は

$$
  \begin{align*}
    l_1 \leq_L l_2                                                        
     & \implies l_1 \leq_L l_2 \land l_2 \leq_L \gamma(\alpha(l_2))
     & \text{(Galois connection の条件 2)}                                \\                                     
     & \implies l_1 \leq_L \gamma(\alpha(l_2))
    & \text{(transitivity of $\leq_L$)}                                        \\
    & \implies \alpha(l_1) \leq_M \alpha(l_2)
    & \text{(assumption: $l \leq_L \gamma(m) \implies \alpha(l) \leq_M m$)}
  \end{align*}
$$

$\gamma$ の単調性: $m_1 \leq_M m_2 \implies \gamma(m_1) \leq_L \gamma(m_2)$ は

$$
  \begin{align*}
    m_1 \leq_M m_2                                                     
    & \implies m_1 \leq_M m_2 \land \alpha(\gamma(m_1)) \leq_M m_1
    & \text{(Galois connection の条件 2)}                                \\
    & \implies \alpha(\gamma(m_1)) \leq_M m_2
    & \text{(transitivity of $\leq_M$)}                                        \\
    & \implies \gamma(m_1) \leq_L \gamma(m_2)
    & \text{(assumption: $\alpha(l) \leq_M m \implies l \leq_L \gamma(m)$)}
    \end{align*}
$$

:::



<details>

<summary>対応するプログラム</summary>

最後にここ埋める

</details>

:::info
ここまでの証明で察した人もいるかもしれませんが
$\alpha$ と $\gamma$ の性質に関する議論はかなり似たものになります．
記事がいたずらに長くなってしまうので，そのような場合の証明はこの後は適宜省略します．
:::

さらに，次のような重要な性質がいえます．


:::theorem
完備束 $(L, \leq_L)$, $(M, \leq_M)$ と $\alpha: L \to M$ について， Galois 接続 $(L, \alpha, \gamma, M)$ が存在するとき，任意の $L' \subseteq L$ に対して

$$
\alpha \left( \bigsqcup L' \right) = \bigsqcup \{ \alpha(l) \mid l \in L' \}
$$

:::


:::proof

Galois 接続であることから随伴となるから

$$
\alpha \left( \bigsqcup L' \right) \leq_M m \iff \bigsqcup L' \leq_L \gamma(m)
$$

$\bigsqcup L'$ が $L'$ の上界であることから

$$
\bigsqcup L' \leq_L \gamma(m) \Rightarrow \forall l \in L', l \leq_L \gamma(m)
$$

さらに上界における最小性から

$$
\forall l \in L', l \leq_L \gamma(m) \Rightarrow \bigsqcup L' \leq_L \gamma(m)
$$

となり結局 

$$
\alpha \left( \bigsqcup L' \right) \leq_M m \iff \forall l \in L', l \leq_L \gamma(m)
$$


ここでふたたび随伴であることを使えば

$$
\forall l \in L', l \leq_L \gamma(m) \iff \forall l \in L', \alpha(l) \leq_M m
$$

なので

$$
\alpha \left( \bigsqcup L' \right) \leq_M m \iff \forall l \in L', \alpha(l) \leq_M m
$$

さらに先ほどの $\bigsqcup L'$ の議論と同様にすれば

$$
\forall l \in L', \alpha(l) \leq_M m \iff \bigsqcup \{ \alpha(l) \mid l \in L' \} \leq_M m
$$


よって 

$$
\alpha \left( \bigsqcup L' \right) \leq_M m \iff \bigsqcup \{ \alpha(l) \mid l \in L' \} \leq_M m
$$

が成立する．とくに $m \leftarrow \alpha \left( \bigsqcup L' \right)$ と
$m \leftarrow \alpha \left( \bigsqcup L' \right)$ とすれば $\leq_M$ の反対称性から

$$
\alpha \left( \bigsqcup L' \right) = \bigsqcup \{ \alpha(l) \mid l \in L' \}
$$

:::


---

#### そのほかの性質メモ


:::theorem

Galois 接続 $(L, \alpha, \gamma, M)$ について

1. $\alpha \circ \gamma \circ \alpha = \alpha$
2. $\gamma \circ \alpha \circ \gamma = \gamma$

:::

:::proof

$\alpha \circ \gamma \circ \alpha = \alpha$:

$$
\begin{align*}
           & l \leq_L \gamma(\alpha(l))
           &                                            & \text{(Definition of Galois connection)} \\
  \implies & \alpha(l) \leq_M \alpha(\gamma(\alpha(l)))
           &                                            & \text{(Monotonicity of $\alpha$)}        \\
\end{align*}
$$

また

$$
\begin{align*}
           & \gamma(\alpha(l)) \leq_L \gamma(\alpha(l))
           &                                            & \text{(Reflexivity of $\leq_L$)}          \\
  \implies & \alpha(\gamma(\alpha(l))) \leq_M \alpha(l)
           &                                            & \text{(Theorem 1)} \\
\end{align*}
$$

なので $\leq_M$ の反対称性から $\alpha(l) = \alpha(\gamma(\alpha(l)))$


$\gamma \circ \alpha \circ \gamma = \gamma$ も同様に示せる．
:::


<details>
<summary>対応するプログラム</summary>

最後にここ埋める

</details>



## 今日の一曲

<iframe width="560" height="315" src="https://www.youtube.com/embed/mWYk273lZOs?si=WeGA-TY5I9gZvAkz" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>