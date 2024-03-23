---
title: n 次精度 k 階数値微分の導出
author: abap34
date: 2023/11/10
tag: [数学, Python, 微分, 日記]
twitter_id: abap34
github_id: abap34
mail: abap0002@gmail.com
ogp_url: https://images.dog.ceo/breeds/cattledog-australian/IMG_2432.jpg
description: n次精度 k階数値微分の係数の導出と実装例
url: https://abap34.com/posts/n-order-diff.html
site_name: abap34's blog
twitter_site: @abap34
---


# Abstract

みなさん微分していますか？私はしています。
数値微分は自動微分のテストに使えるし実装が楽で嬉しいです。
なので精度よくやりたくなってきます。
ところで前進差分の打ち切り誤差が有限の幅 $h$ に対して $O(h)$ な一方、
中心差分は $O(h^2)$ であるというのは割と有名ですが、
各 $n$ に対して $O(h^n)$ で計算する式が常に存在します。(たぶん)

調べたのですが出てこなかったので導出してみます。


## 前進差分・中心差分の精度の確認

まずは前進差分と中心差分の精度を確認してみます。


前進差分は以下のような計算で得られます。


:::definition
$f$ の $x$ における $h$ 差分の前進差分による近似 $f_{forward}' (x; h)$ は、

$$
f_{forward}'(x; h) = \frac{f(x+h) - f(x)}{h} 
$$

:::


これが一次精度、つまり誤差 $e(h)$ が $O(h)$ であることを確かめます。

上の式の右辺をテイラー展開すると、
 
$$
\begin{align}
f_{forward}'(x; h) &= \frac{f(x+h) - f(x)}{h} \\
&= \frac{f(x) + f'(x)h + \frac{f''(x)}{2!}h^2 + \frac{f'''(x)}{3!}h^3 + \cdots - f(x)}{h} \\
&= \frac{f'(x)h + O(h^2)}{h} \\
&= f'(x) + O(h)
\end{align}
$$


中心差分についても、全く同様に右辺をテイラー展開することで確かめられます。

Pythonでそれぞれ実装してみます。

:::loadlib
numpy
matplotlib
:::

:::code
import numpy as np

import matplotlib
import matplotlib.pyplot as plt

matplotlib.use("module://matplotlib_pyodide.html5_canvas_backend")

def numerical_diff(f, x, h):
    return (f(x+h) - f(x)) / h

def numerical_diff_center(f, x, h):
    return (f(x+h) - f(x-h)) / (2*h)

def f(x):
    return np.sin(x)

h = np.logspace(0, -20, num=100)
grad_forward = numerical_diff(f, np.pi/3, h)
grad_center = numerical_diff_center(f, np.pi/3, h)
grad_true = np.cos(np.pi/3)

error_forward = np.abs(grad_forward - grad_true)
error_center = np.abs(grad_center - grad_true)

plt.plot(h, error_forward, label='forward')
plt.plot(h, error_center, label='center')
plt.xscale('log')
plt.yscale('log')
plt.xlabel('h')
plt.ylabel('grad')
plt.legend()
plt.show()
plt.close()
:::



よく言われる、打ち切り誤差と桁落ちのトレードオフが確認できます


## 任意の k 階 n 次精度数値微分

本題を導出しようと思います。 まずは議論のしやすさのために特に $n$ が偶数の場合について考えます。


:::theorem

任意の $n, \ k \leq n + 1$ に対して、$n$ が偶数のとき、
ある $\boldsymbol{w_{n,k}} \in \mathbb{R}^{n+1}$ が存在して


$p = \dfrac{n}{2}$ として


$$
f_{n}^{(k)}(x; h) = \boldsymbol{w_{n,k}} \cdot 
\begin{pmatrix}
f(x - ph) \\
f(x - (p-1)h) \\
\vdots \\
f(x) \\
\vdots \\
f(x + (p-1)h) \\
f(x + ph) \\
\end{pmatrix}^{\top}
$$

は $f_{n}^{(k)}(x; h)   = f^{(k)}(x) + O(h^n)$ を満たす。


:::

つまり、 各 $n$, $k$ に対して中心差分と同様に、微分係数を求めたい点から左右に $h$ ずつ幅をとって点を取り評価した $n + 1$点に対して、適切な重み付き和が存在して
$k$ 階導関数の $n$ 次精度の数値微分を実現できるということです。


証明してみます。

:::proof

$f(x + kh) = f(x) + \dfrac{f'(x)}{1!}kh + \dfrac{f''(x)}{2!}k^2h^2 + \cdots + \dfrac{f^{(n)}(x)}{n!}k^nh^n + O(h^{n+1})$ より、


これを $k = -p, -p+1, \cdots, p-1, \ p$ について足し合わせて $k + 1$ 番目の項以外の係数を $0$ にすればよい。


したがって、

$$
A = \begin{pmatrix}
1 & 1 & \cdots & 1 & 1 & 1 & \cdots & 1 & 1 \\
-p & (-p + 1) & \cdots & 1 & 0 & 1 & \cdots & (p-1) & p \\
(-p)^2 & (-p + 1)^2 & \cdots & (-1)^2 & 0 & 1^2 & \cdots & (p-1)^2 & p^2 \\
\vdots & \vdots & \ddots & \vdots & \vdots & \vdots & \ddots & \vdots & \vdots \\
(-p)^{n} & (-p + 1)^{n} & \cdots & (-1)^{n} &0 & 1^{n} & \cdots & (p-1)^{n} & p^{n} \\
\end{pmatrix} \in \mathbb{R}^{(n+1) \times (n+1)}
$$


と $A$ を定めたときに $A \boldsymbol{w} = \boldsymbol{e}_{k+1}$ を満たす $\boldsymbol{w} \in \mathbb{R}^{n+1}$ が存在すればよい。

ここで、 $A$ は **ヴァンデルモンド行列** で、 $p \neq 0$ のとき正則。 

したがって、 $\boldsymbol{w} = A^{-1}\boldsymbol{e}_{k+1}$ なる $\boldsymbol{w}$ がただ存在して条件を満たす。
:::

<details>
<summary>正則性について</summary>
ヴァンデルモンド行列は、
$$
A = \begin{pmatrix}
1 & 1 & \cdots & 1 & 1 & 1 & \cdots & 1 & 1 \\
x_1 & x_2 & \cdots & x_{n-1} & x_n & x_1 & \cdots & x_{n-1} & x_n \\
x_1^2 & x_2^2 & \cdots & x_{n-1}^2 & x_n^2 & x_1^2 & \cdots & x_{n-1}^2 & x_n^2 \\
\vdots & \vdots & \ddots & \vdots & \vdots & \vdots & \ddots & \vdots & \vdots \\
x_1^{n-1} & x_2^{n-1} & \cdots & x_{n-1}^{n-1} & x_n^{n-1} & x_1^{n-1} & \cdots & x_{n-1}^{n-1} & x_n^{n-1} \\
x_1^{n} & x_2^{n} & \cdots & x_{n-1}^{n} & x_n^{n} & x_1^{n} & \cdots & x_{n-1}^{n} & x_n^{n} \\
\end{pmatrix} \in \mathbb{R}^{n \times n}
$$

という各列が等比数列のようになっている行列のことを言います。 
(各行の派閥もいるらしいです。)

ヴァンデルモンド行列は、その行列式が

$$
\det A = \prod_{1 \leq i < j \leq n} (x_j - x_i)
$$

となることが知られていて、 $x_i$ がすべて異なるときには $0$ でないことがわかります。

したがって今回の場合は $x_i = -p + i$ であり、 $p \neq 0$ のときはすべて異なるので正則であることがわかります。

</details>


というわけで確かに存在したうえに一意で、また具体的に計算することができました。

実際に計算してみようと思います。

右から $e_k$ をかけるのはちょうど $k$ 列目のベクトルを取り出すことなのでそう実装します。


:::code
import numpy as np
import matplotlib.pyplot as plt

def central_weight(n, k):
    p = n // 2
    A = np.zeros((n+1, n+1), dtype=float)
    r = np.arange(-p, p+1)
    
    for i in range(n+1):
        A[i] = r**i
        
    w = np.linalg.inv(A)[:, k]
    return w

def numerical_diff(f, x, n, h=1e-5, k=1):
    w = central_weight(n, k)
    p = n // 2
    
    w = central_weight(n, k)
    x = np.arange(-p, p+1) * h + x
    y = f(x)

    return np.dot(w, y) * np.prod(np.arange(1, k+1)) / h**k


def f(x):
    return np.sin(x)

def df(x):
    return np.cos(x)

x = np.pi / 3


print('w_2,1 =', central_weight(2, 1))
print('w_4,1 =', central_weight(4, 1))
print('w_4,2 =', central_weight(4, 2))

print(numerical_diff(f, x, 2))
print(numerical_diff(f, x, 4))    
print(numerical_diff(f, x, 4, k=2))
:::


と、いい感じに計算できています。

桁落ちとのトレードオフも確認してみます。

:::code
n = range(2, 12, 2)
x = np.pi / 3
h = np.logspace(0, -10, 100)

label = [f'O(h^{i})' for i in n]

err = np.zeros((len(n), len(h)))

for i, _n in enumerate(n):
    for j, _h in enumerate(h):
        err[i, j] = abs(numerical_diff(f, x, _n, h=_h) - df(x))

plt.figure(figsize=(8, 6))
for i in range(len(n)):
    plt.loglog(h, err[i], label=label[i])

plt.legend()
plt.grid()
plt.xlabel('h')
plt.ylabel('Error')
plt.show()
:::


打ち切り誤差の変化によって最適な点が変化していることがわかります。


## 感想
線形代数が役に立ってすごい

また、上のアルゴリズムは逆行列を求めるところがボトルネックで　時間計算量は $O(N^3)$　ですが、
調べたところによるとヴァンデルモンド行列の逆行列は $O(N^2)$ で求められるようなのでそうすればもう少し早くなりそうです。
(中心差分よりも正確にやろうとする場面すらなかなかみないので実用的ではないですが)



## 今日の一曲

<iframe width="560" height="315" src="https://www.youtube.com/embed/YJRFD1AdaUE?si=as37IuuxoUS9LP5U" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
 
 
MV良すぎてめちゃくちゃ好きです。



    