---
title: 最急降下法の収束定理の主張とその証明
author: abap34
date: 2024/06/30
tag: [数学, 最適化, 機械学習]
twitter_id: abap34
github_id: abap34
mail: abap0002@gmail.com
ogp_url: https://images.dog.ceo/breeds/kombai/Kombai-indian-Dog.jpg
description: 直線探索法を用いた最急降下法の収束定理の主張とその証明を紹介します。
url: https://abap34.com/posts/gd_convergence_theorem.html
site_name: abap34's blog
twitter_site: abap34
---

## あらすじ

最近 Webとかあまり慣れていないことばかりブログに書いていたので、数学の話をしようと思います。

まず、数理最適化の授業で頑張って勉強したものがあんまりテストに出なくて悲しかったのでブログにすることで供養しようと思います。

最初は、ならったもののうち一番印象に残った定理について書きます。 
(ちなみにこれはテストに出ました。)

## 前提: 直線探索

直線探索は　$\| \nabla f(\boldsymbol{x}_k) \| < \varepsilon$ になるまで以下のように更新を繰り返すアルゴリズムとします.

$$
\large{\boldsymbol{x}_{k+1} = \boldsymbol{x}_k - \alpha_k \nabla f(\boldsymbol{x}_k)}
$$

(ここで、 $\alpha_k > 0$ は $f(\boldsymbol{x}_k - \alpha \nabla f(\boldsymbol{x}_k))$ を最小にするような $\alpha$ です)


さて、$f$ が凸であるとき、 $f(\boldsymbol{x^*}) = 0$ なる $\boldsymbol{x}^*$ は $f$ の大域的最適解です。

(勾配不等式: $\forall \boldsymbol{x}, \boldsymbol{y} \in \mathbb{R}^n, f(\boldsymbol{x}) \geq f(\boldsymbol{y}) + \nabla f(\boldsymbol{y})^T (\boldsymbol{x} - \boldsymbol{y})$ について $\boldsymbol{y} \leftarrow \boldsymbol{x}^*$ とするとわかります)

したがって、 凸関数 $f$ に対して、それなりに小さな $\varepsilon$ を取ることで最適解を得ることを目指すことができます。

ところで、大域最適解が存在する一般の $f$ について直線探索は終了するとは限りません。　

ここでは、とくに $f$ の勾配に条件をつけて、そのときの収束性とその反復回数についての保証を与える定理を紹介します。


## 最急降下法の収束定理

:::theorem

### 最急降下法の収束定理

$C^1$ 級の関数 $f: \mathbb{R}^n \to \mathbb{R}$ について、 大域的最適解 $\boldsymbol{x}^*$ が存在し、 $\nabla f$ がリプシッツ連続であるとする。


このとき、$\dfrac{2L}{\varepsilon^2} \left( f(\boldsymbol{x}_0) - f(\boldsymbol{x}^*) \right)$ 回以下の反復で、
直線探索は終了する。


( $L$ は $\nabla f$ のリプシッツ定数)


:::

収束の保証だけでなく、速度まで主張していてとても強いです。

さっそく証明をしてみます。


## 証明

次のような方針で証明を進めたいと思います。

### 方針

[1] $f$ がリプシッツ連続であるとき、次の不等式が成り立つことを示す

$$
| f(\boldsymbol{y}) - f(\boldsymbol{x}) - \nabla f(\boldsymbol{x})^T (\boldsymbol{y} - \boldsymbol{x}) | \leq \dfrac{L}{2} \| \boldsymbol{y} - \boldsymbol{x} \|^2
$$

この不等式を使うことで、各反復での更新を評価することができます。


[2] 各反復における更新の評価を使って $\dfrac{2L}{\varepsilon^2} \left( f(\boldsymbol{x}_0) - f(\boldsymbol{x}^*) \right)$  までの反復で収束条件を満たすことを示す


それでは、1. からいきます。

:::lemma

$f$ がリプシッツ連続であるとき、次の不等式が成り立つ。

$$
| f(\boldsymbol{y}) - f(\boldsymbol{x}) - \nabla f(\boldsymbol{x})^T (\boldsymbol{y} - \boldsymbol{x}) | \leq \dfrac{L}{2} \| \boldsymbol{y} - \boldsymbol{x} \|^2
$$

:::

:::proof

$f(\boldsymbol{x} + \tau (\boldsymbol{y} - \boldsymbol{x}))$ を $\tau$ について微分すると、

$$
\begin{aligned}
\frac{d}{d \tau}\{f(\boldsymbol{x}+\tau(\boldsymbol{y}-\boldsymbol{x}))\} & =\left.\sum_i^n \frac{\partial f(\boldsymbol{z})}{\partial \boldsymbol{z}_i}\right|_{\boldsymbol{z}=\boldsymbol{x}+\tau(\boldsymbol{y}-\boldsymbol{x})} \frac{d\left([\boldsymbol{x}+\tau(\boldsymbol{y}-\boldsymbol{x})]_i\right)}{d \tau} \\
& =\sum_i^n[\nabla f(\boldsymbol{x}+\tau(\boldsymbol{y}-\boldsymbol{x}))]_i[\boldsymbol{y}-\boldsymbol{x}]_i \\
& =\nabla f(\boldsymbol{x}+\tau(\boldsymbol{y}-\boldsymbol{x}))^{\top}(\boldsymbol{y}-\boldsymbol{x})
\end{aligned}
$$


すると、

$$
\begin{aligned}
\int_0^1 \nabla f(\boldsymbol{x}+\tau(\boldsymbol{y}-\boldsymbol{x}))^{\top}(\boldsymbol{y}-\boldsymbol{x}) d \tau &=\int_0^1 \frac{d}{d t}\{f(\boldsymbol{x}+\tau(\boldsymbol{y}-\boldsymbol{x}))\} d \tau \\
&=f(\boldsymbol{y}-\boldsymbol{x}) 
\end{aligned}
$$

したがって、

$$
\begin{aligned}
& \left|f(\boldsymbol{y})-f(\boldsymbol{x})-\| f(\boldsymbol{x})^{\top}(\boldsymbol{y}-\boldsymbol{x})\right| \\
&= \left| \int_0^1 \nabla f(\boldsymbol{x}+\tau(\boldsymbol{y}-\boldsymbol{x}))^{\top}(\boldsymbol{y}-\boldsymbol{x}) d \tau - \nabla f(\boldsymbol{x})^{\top}(\boldsymbol{y}-\boldsymbol{x}) \right| \\
&= \left| \int_0^1 \left( \nabla f(\boldsymbol{x}+\tau(\boldsymbol{y}-\boldsymbol{x}))^{\top}(\boldsymbol{y}-\boldsymbol{x}) - \nabla f(\boldsymbol{x})^{\top}(\boldsymbol{y}-\boldsymbol{x}) \right) d \tau \right| \\
&\leq \int_0^1 \left| \nabla f(\boldsymbol{x}+\tau(\boldsymbol{y}-\boldsymbol{x}))^{\top}(\boldsymbol{y}-\boldsymbol{x}) - \nabla f(\boldsymbol{x})^{\top}(\boldsymbol{y}-\boldsymbol{x}) \right| d \tau \quad (\because \text{三角不等式}) \\
&\leq \int_0^1 \left\| \nabla f(\boldsymbol{x}+\tau(\boldsymbol{y}-\boldsymbol{x})) - \nabla f(\boldsymbol{x}) \right\| \left\| \boldsymbol{y}-\boldsymbol{x} \right\| d \tau \quad (\because \text{コーシーシュワルツの不等式}) \\
&\leq \int_0^1 L \left\| \boldsymbol{x} + \tau(\boldsymbol{y}-\boldsymbol{x}) - \boldsymbol{x} \right\| \left\| \boldsymbol{y}-\boldsymbol{x} \right\| d \tau \quad (\because \text{リプシッツ連続性}) \\
&= \int_0^1 L \tau \left\| \boldsymbol{y}-\boldsymbol{x} \right\|^2 d \tau \\
&= \dfrac{L}{2} \left\| \boldsymbol{y}-\boldsymbol{x} \right\|^2
\end{aligned}
$$

よって、

$$
| f(\boldsymbol{y}) - f(\boldsymbol{x}) - \nabla f(\boldsymbol{x})^T (\boldsymbol{y} - \boldsymbol{x}) | \leq \dfrac{L}{2} \| \boldsymbol{y} - \boldsymbol{x} \|^2
$$

:::


以上で補題1.が示されました。

これを使って各反復での更新を評価していきます。

:::lemma

### 各反復での更新の評価

$\{ \boldsymbol{x}_k \}$ を直線探索による最急降下法によって得られる点列とする。

このとき、次の不等式が成り立つ。

$$
f(\boldsymbol{x}_{k+1}) - f(\boldsymbol{x}_k) \leq - \dfrac{1}{2L} \| \nabla f(\boldsymbol{x}_k) \|^2
$$

:::


:::proof

Lemma1. について $\boldsymbol{x} \leftarrow \boldsymbol{x}_k$, $\boldsymbol{y} \leftarrow \boldsymbol{x}_{k+1}$ として


$$
| f(\boldsymbol{x}_{k+1}) - f(\boldsymbol{x}_k) - \nabla f(\boldsymbol{x}_k)^T (\boldsymbol{x}_{k+1} - \boldsymbol{x}_k) | \leq \dfrac{L}{2} \| \boldsymbol{x}_{k+1} - \boldsymbol{x}_k \|^2 
$$


ここで、直線探索で最小化するように選ぶ $\alpha$ に対して $\boldsymbol{x}_{k+1} - \boldsymbol{x}_k = - \alpha \nabla f(\boldsymbol{x}_k)$ であることを使うと


$$
| f(\boldsymbol{x}_{k+1})  - f(\boldsymbol{x}_k) +  \alpha \| \nabla f(\boldsymbol{x}_k) \|^2 |  \leq \dfrac{L}{2} \alpha^2 \| \nabla f(\boldsymbol{x}_k) \|^2 
$$

すると

$$
f(\boldsymbol{x}_{k+1})  - f(\boldsymbol{x}_k) +  \alpha \| \nabla f(\boldsymbol{x}_k) \|^2  \leq \dfrac{L}{2} \alpha^2 \| \nabla f(\boldsymbol{x}_k) \|^2
$$

結局

$$
\begin{equation}
f(\boldsymbol{x}_{k+1}) \leq f(\boldsymbol{x}_k) + \left(\dfrac{L}{2} \alpha^2 - \alpha \right) \| \nabla f(\boldsymbol{x}_k) \|^2
\end{equation}
$$

よって

$$
\min_{\alpha > 0} \ f(\boldsymbol{x}_k - \alpha \nabla f(\boldsymbol{x}_k)) \leq \min_{\alpha > 0} \ f(\boldsymbol{x}_k) + \left(\dfrac{L}{2} \alpha^2 - \alpha \right) \| \nabla f(\boldsymbol{x}_k) \|^2
$$

したがって、


$$
\begin{aligned}
f(\boldsymbol{x}_{k+1}) &= \min_{\alpha > 0} \ f(\boldsymbol{x}_k - \alpha \nabla f(\boldsymbol{x}_k)) \\
&\leq \min_{\alpha > 0} \ f(\boldsymbol{x}_k) + \left(\dfrac{L}{2} \alpha^2 - \alpha \right) \| \nabla f(\boldsymbol{x}_k) \|^2 \\
&= f(\boldsymbol{x}_k) - \dfrac{1}{2L} \| \nabla f(\boldsymbol{x}_k) \|^2
\end{aligned}
$$

<!-- (二行目について、各 $\alpha$ について (1) が成り立つので、 $\forall x, f(x) \leq g(x) \Rightarrow \min_x f(x) \leq \min_x g(x)$ を使った) -->
$$
\therefore f(\boldsymbol{x}_{k+1}) - f(\boldsymbol{x}_k) \leq - \dfrac{1}{2L} \| \nabla f(\boldsymbol{x}_k) \|^2
$$

:::


以上で補題2.が示され、各反復での改善幅をリプシッツ定数で評価することができました。

続いて、これを使って $M$ 回反復したときの改善幅を考えます。

### M回反復の評価

lemma1. を $\boldsymbol{x}_0$ から順に $M$ 回適用すると、

$$
\begin{aligned}
f(\boldsymbol{x}_1) &\leq f(\boldsymbol{x}_0) - \dfrac{1}{2L} \| \nabla f(\boldsymbol{x}_0) \|^2 \\
f(\boldsymbol{x}_2) &\leq f(\boldsymbol{x}_1) - \dfrac{1}{2L} \| \nabla f(\boldsymbol{x}_1) \|^2 \\
&\leq f(\boldsymbol{x}_0) - \dfrac{1}{2L} \| \nabla f(\boldsymbol{x}_0) \|^2 - \dfrac{1}{2L} \| \nabla f(\boldsymbol{x}_1) \|^2 \\
f(\boldsymbol{x}_3) &\leq f(\boldsymbol{x}_2) - \dfrac{1}{2L} \| \nabla f(\boldsymbol{x}_2) \|^2 \\
&\leq f(\boldsymbol{x}_0) - \dfrac{1}{2L} \| \nabla f(\boldsymbol{x}_0) \|^2 - \dfrac{1}{2L} \| \nabla f(\boldsymbol{x}_1) \|^2 - \dfrac{1}{2L} \| \nabla f(\boldsymbol{x}_2) \|^2 \\
&\vdots \\
f(\boldsymbol{x}_M) &\leq f(\boldsymbol{x}_0) - \dfrac{1}{2L} \sum_{k=0}^{M-1} \| \nabla f(\boldsymbol{x}_k) \|^2
\end{aligned}
$$

が得られます。

さらに、$f(\boldsymbol{x}^*)$ は大域的最適解であるので、 $f(\boldsymbol{x}_* ) \leq f(\boldsymbol{x}_0)$ が成り立ちます。

したがって、

$$
\begin{equation}
\sum_{k=0}^{M-1} \| \nabla f(\boldsymbol{x}_k) \|^2 \leq 2L \left( f(\boldsymbol{x}_0) - f(\boldsymbol{x}^*) \right)
\end{equation}
$$

です。

### 収束回数の評価

いよいよ最後です。

各 $\varepsilon > 0$ に対して、 $M$ を 

$$
\dfrac{2L}{\varepsilon^2} \left( f(\boldsymbol{x}_0) - f(\boldsymbol{x}^*) \right) < M \leq \dfrac{2L}{\varepsilon^2} \left( f(\boldsymbol{x}_0) - f(\boldsymbol{x}^*) \right) + 1
$$

を満たすただ一つの自然数として定めます。

このとき、 $\forall k \in \{0, 1, \ldots, M-1\}$ について $\| \nabla f(\boldsymbol{x}_k) \| > \varepsilon$ と仮定します。

すると 

$$
M \varepsilon^2 < \sum_{k=0}^{M-1} \| \nabla f(\boldsymbol{x}_k) \|^2 
$$


しかし、$M$ の定義より

$$
2L \left( f(\boldsymbol{x}_0) - f(\boldsymbol{x}^*) \right) < M \varepsilon^2
$$

なので、結局

$$
2L \left( f(\boldsymbol{x}_0) - f(\boldsymbol{x}^*) \right) < \sum_{k=0}^{M-1} \| \nabla f(\boldsymbol{x}_k) \|^2
$$

が成り立ちますが、これは (2) と矛盾します！

したがって、 $\| \nabla f(\boldsymbol{x}_k) \| \leq \varepsilon$ を満たす $k$ が少なくとも一つ存在します。

これが示したかったことでした。


## 感想

俺はお祈り勾配降下法をやめるぞ！！ジョジョー！！！ 
(ここであまり理解していない謎の Warm up をペタリ)


## 今日の一曲

東京ドームライブ行きました。よかったです。


<iframe width="560" height="315" src="https://www.youtube.com/embed/Rs-Y9MtHsoo?si=POEXpQZVHFLE3TRh" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## 参考文献

だいたい同じ話が載っています。
> 山下信雄, and 上田健詞. "制約なし最小化問題に対する勾配法, ニュートン型手法の反復回数の見積もり." 日本オペレーションズ・リサーチ学会和文論文誌 56 (2013): 15-30.