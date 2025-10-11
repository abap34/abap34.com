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

:::info
研究室でやった [Principle of Program Analysis](https://link.springer.com/book/10.1007/978-3-662-03811-6) の輪講で
Galois 接続についてやり面白いなと思ったので，その内容を多少再構成したり，証明を納得がいくもので書き直したり， Lean で形式化したりなどしながらまとめてみます．


**おかねがある人はこちらを購入することをおすすめします．**
:::

## プログラム解析と抽象解釈，Galois 接続

この記事では，プログラム解析という言葉をざっくり

「(みんなが思うふつうの) 実行前にプログラムの性質を調べる技術」という意味で使います．


例えば (できるかはさておき)

- ある変数の値がある時点で `null` になるかを調べる
- ある関数呼び出しが例外を投げうるかを調べる
- あるプログラムが停止するかを調べる (!)

などです．


ほとんどのプログラマは日々プログラム解析の恩恵を受けてプログラムを書いています．

例えば補完などはプログラムのある位置で存在しうる変数名の解析が必要ですし，
型推論などもプログラム解析の一種と言えます．


プログラム解析とひとくちに言っても膨大な種類がありますが，
これを **抽象解釈 (abstract interpretation)** という枠組みによって包摂的に捉えることができることが知られています．


そして，その基礎づけの一つとして「**Galois 接続 (Galois connection)**」　という概念を使ったものがあります．


[抽象解釈やプログラム解析についてはこれまでいくらか扱ってきましたが](https://www.abap34.com/search?tag=%E6%8A%BD%E8%B1%A1%E8%A7%A3%E9%87%88)，
今回は Galois 接続をつかったプログラム解析の基礎づけについて紹介します．


さらに，**これを使ってさまざまな実践的なプログラム解析の枠組みを簡単に構成できること**を紹介します．


また， Julia コンパイラを例に，実践的な抽象解釈の実装設計との関連についても考えてみます．


また，その内容の一部について Lean 4 による形式化にも挑戦してみます．

[mathlib にはすでに Galois 接続のさまざまな性質が収録されている](https://leanprover-community.github.io/mathlib4_docs/Mathlib/Order/GaloisConnection/Defs.html) のですが，
勉強も兼ねてコアの部分はなるべく使わず自分で書くことにします．


大抵の定義や証明に切り替えボタンを置いておきます．押すと Lean のコードが見られます．

:::warn
**⚠️** 筆者は専門家ではないので誤りが含まれる可能性があります．

さらに重要なこととして，**Lean に関しては初心者** なので，それを念頭に読んでいただけるとありがたいです．
誤り等あればコメントからご指摘いただけると幸いです．

:::

### Introduction: プログラム解析と抽象化

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


しかし，このような解析は常にリーズナブルに可能，あるいはそもそも計算可能であるとは限りません．
そのため，多くのプログラム解析は「いい感じの」ところまで抽象化された値を求めることになります．

例えば
　
- 偶奇のみを考える
- 区間のみを考える
- 型のみを考える

みたいなことです．

プログラム解析はこのような抽象化された評価を考えることといえます．

つまり
- 具体的なもの (例えば典型的には値の集合) と
- 抽象的なもの (偶奇，区間，型など) 

を対応させていくことが必要になります．
このうち，ある種の望ましい性質を持ったものが Galois 接続です．
これからの実際にそのことを確認していきます・

## Galois 接続

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


### γ の α による一意な決定


ところで，初めて私が Galois 接続の定義を見たときに抱いた疑問として， $\gamma$ の役割があります．

一旦 Galois 接続がちゃんとプログラム解析のモデルとして妥当なことにして，
$\mathbb{Z}$ を値として持つ言語のプログラムの偶奇解析をすることにしてみます．


すると「抽象的な値」となる:


- 偶数
- 奇数

(実際には「偶数または奇数」などもあります)

に対して，　$\gamma$ はそれぞれ $2\mathbb{Z}$, $2\mathbb{Z}+1$ を返す以外に妥当な結果があるようには思えません．


結論から言うとこのような感覚は正しく，次のようなことがいえます．

:::theorem
**$\alpha$ に対する $\gamma$ の一意性**

半順序集合 $(L, \leq_L)$， $(M, \leq_M)$, $\alpha : L \to M$, $\gamma_1, \gamma_2 : M \to L$ に対して

$(L, \alpha, \gamma_1, M)$ と $(L, \alpha, \gamma_2, M)$ がともに Galois 接続であるならば $\gamma_1 = \gamma_2$

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
$\alpha$ の性質に関する議論と $\gamma$ の性質に関する議論はかなり似たものになります．
記事がいたずらに長くなってしまうので，そのような場合の証明はこの後は適宜省略します．
:::

これを使うと，まず次のような重要な性質がいえます．


:::theorem
完備束 $(L, \leq_L)$, $(M, \leq_M)$ と $\alpha: L \to M$ について， Galois 接続 $(L, \alpha, \gamma, M)$ が存在するとき，任意の $L' \subseteq L$ に対して

$$
\alpha \left( \bigsqcup L' \right) = \bigsqcup \alpha \left[L'\right]
$$

:::

:::proof

Galois 接続であることから随伴なので

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
\forall l \in L', \alpha(l) \leq_M m \iff \bigsqcup \alpha \left[L'\right] \leq_M m
$$


よって 

$$
\alpha \left( \bigsqcup L' \right) \leq_M m \iff \bigsqcup \alpha \left[L'\right] \leq_M m
$$

が成立する．とくに $m \leftarrow \alpha \left( \bigsqcup L' \right)$ と
$m \leftarrow \alpha \left( \bigsqcup L' \right)$ とすれば $\leq_M$ の反対称性から

$$
\alpha \left( \bigsqcup L' \right) = \bigsqcup \alpha \left[L'\right]
$$

:::

これらを使って目標を示しましょう．先ほどの定理を再掲します．

:::theorem
**$\alpha$ に対する $\gamma$ の一意性**

半順序集合 $(L, \leq_L)$， $(M, \leq_M)$, $\alpha : L \to M$, $\gamma_1, \gamma_2 : M \to L$ に対して
$(L, \alpha, \gamma_1, M)$ と $(L, \alpha, \gamma_2, M)$ がともに Galois 接続であるならば $\gamma_1 = \gamma_2$．

さらに， $(L, \leq_L)$， $(M, \leq_M)$ が完備束のとき
$$
\gamma_1(m) = \gamma_2(m) = \bigsqcup \{ l \in L \mid \alpha(l) \leq_M m \}
$$

:::

:::proof

- **$\gamma$ の一意性**

Galois 接続であることから任意の $l \in L, m \in M$ に対して

$$
\begin{align}
  \alpha(\gamma_1(m)) \leq_M m \\
  \alpha(\gamma_2(m)) \leq_M m
\end{align}
$$

随伴の性質を (1) に対して $\gamma \leftarrow \gamma_2$，(2) に対して $\gamma \leftarrow \gamma_1$ として使うと

$$
\begin{align}
  \gamma_1(m) \leq_L \gamma_2(m) \\
  \gamma_2(m) \leq_L \gamma_1(m)
\end{align}
$$

なので $\leq_L$ の反対称性から $\gamma_1(m) = \gamma_2(m)$．


---

- **完備束であるとき $\gamma_1(m) = \gamma_2(m) = \bigsqcup \{ l \in L \mid \alpha(l) \leq_M m \}$**

一意性から $\bigsqcup \{ l \in L \mid \alpha(l) \leq_M m \}$ が Galois 接続の条件:

1. 単調性
2. $\forall l \in L, m \in M, l \leq_L \gamma(\alpha(l)) \land \alpha(\gamma(m)) \leq_M m$

を満たすことを示せばよい．

まず単調性を示そう．

$m_1 \leq_M m_2$ なる $m_1, m_2 \in M$ に対して

$\leq_M$ が推移的であることに注意すれば

$\alpha(l) \leq_M m_1 \implies \alpha(l) \leq_M m_2$ なので

$$
\{ l \in L \mid \alpha(l) \leq_M m_1 \} \subseteq \{ l \in L \mid \alpha(l) \leq_M m_2 \}
$$

よって $a \subseteq b \implies \bigsqcup a \leq \bigsqcup b$ であることから

$$
\gamma(m_1) = \bigsqcup \{ l \in L \mid \alpha(l) \leq_M m_1 \} \leq_L \bigsqcup \{ l \in L \mid \alpha(l) \leq_M m_2 \} = \gamma(m_2)
$$

となって単調性がしたがう．

つぎに条件 2 を示そう．

$\gamma(\alpha(l)) = \bigsqcup \{ l' \in L \mid \alpha(l') \leq_M \alpha(l) \}$ なので， $\leq_M$ の反射律から $l \in \{ l' \in L \mid \alpha(l') \leq_M \alpha(l) \}$ となる． $\bigsqcup S$ が $S$ の上界であることから $l \leq_L \gamma(\alpha(l))$．


同様に $\bigsqcup \{ \alpha(l) \mid \alpha(l) \leq_M m \} \leq_M m$．


定理 3 から

$$
\begin{align*}
  \bigsqcup \{ \alpha(l) \mid \alpha(l) \leq_M m \} & = \alpha \left( \bigsqcup \{ l \in L \mid \alpha(l) \leq_M m \} \right) \\
                                           & = \alpha(\gamma(m))
\end{align*}
$$

なので $\alpha(\gamma(m)) \leq_M m$．


したがって $\gamma$ は 条件を満たす．

:::


というわけで， **「抽象化」さえ決まれば「具体化」は一意に定まる** ということがわかった上に， 
$\alpha$ によって具体的に $\gamma$ が決定できることもわかりました．

<details>
<summary>対応するプログラム</summary>

最後にここ埋める

</details>

### Galois 接続は正当性関係を保つ

Galois 接続がプログラム解析の適切な抽象化であることを確認するために， Galois 接続が「正当さ」を保つことを確認してみます．

値 $V$ と性質 $L$ の間の関係 $R \subseteq V \times L$ であって，次のような性質を満たすものを**正当性関係** と呼ぶことにしましょう．


任意の $v \in V, l_1, l_2 \in L, L' \subseteq L$ に対して

1. $v \mathrel{R} l_1 \land l_1 \leq_L l_2 \implies v \mathrel{R} l_2$
2. $\forall l' \in L', v \mathrel{R} l' \implies v \mathrel{R} \bigsqcup L'$


これは直感的には

### Galois 挿入の定義


### reduction operator による Galois 接続の構成

## Galois 接続による実践的なプログラム解析の構成

### Galois 接続を組み合わせる

### extraction function

### 環境と意味論の抽象化


## 実践的な抽象解釈の実装設計との関連

### Julia コンパイラの型推論おける束の構成

### Galois 接続と解析のための束の構成


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

---

## 今日の一曲

<iframe width="560" height="315" src="https://www.youtube.com/embed/mWYk273lZOs?si=WeGA-TY5I9gZvAkz" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>