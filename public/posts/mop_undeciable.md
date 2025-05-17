---
title: 定数伝播の MOP 解の決定不能性の証明
author: abap34
date: 2025/04/07
tag: [静的解析, コンパイラ,  データフロー解析, 抽象解釈, 計算可能性, 定数伝播]
twitter_id: abap34
github_id: abap34
mail: abap0002@gmail.com
ogp_url: https://images.dog.ceo/breeds/leonberg/n02111129_4246.jpg
description: 定数伝播の MOP 解は一般には決定不能であることを示します。
url: https://abap34.com/posts/mop_undeciable.html
site_name: abap34's blog
twitter_site: abap34
---

## あらすじ

データフロー解析における MOP (Meet Over Path) 解の求解は、一般には決定不能であることを用いて示します。

MPCP (Modified Post Correspondence Problem) に帰着させることで示します。 内容は Principles of Program Analysis に載っていたものにほぼ沿っています。

## 前提: MPCP

有名な決定不能問題の一つに PCP (Post Correspondence Problem) があります。

PCP は次のような問題です。

:::definition

**Post Correspondence Problem**

有限な文字列の組の集合: $\{(u_1, v_1), (u_2, v_2), \ldots, (u_n, v_n)\}$ が与えられたとき、
次を満たす有限の添え字の列 $i_1, i_2, \ldots, i_k$ が存在するか?

$$
u_{i_1} u_{i_2} \ldots u_{i_k} = v_{i_1} v_{i_2} \ldots v_{i_k}
$$

:::

つまり、上下に文字列が書いてある「ドミノ」を (複数回の選択を許して) 並べたとき、上と下の文字列が一致するような並べ方があるか? を判定するという問題です。


この問題決定不能なのですが、少し変形した以下のような問題 MPCP (Modified Post Correspondence Problem) も決定不能であることが知られています。


:::definition

**Modified Post Correspondence Problem, MPCP**

有限な文字列の組の集合: $\{(u_1, v_1), (u_2, v_2), \ldots, (u_n, v_n)\}$ が与えられたとき、
次を満たす有限の添え字の列 $i_1, i_2, \ldots, i_k$ が存在するか?

$$
u_{1} u_{i_1} u_{i_2} \ldots u_{i_k} = v_{1} v_{i_1} v_{i_2} \ldots v_{i_k}
$$

:::


つまり、最初のドミノが固定されたバージョンです。　が、これも決定不能であることが知られています。今回はこれを使います。

## 証明

次のことを示します。

:::theorem

**定数伝播の MOP 解は一般には決定不能である。**

:::


以下のようなプログラムを考えます。

`u1`, `u2` を　`n` 個のドミノの上下として、

```julia
x = u1[1]
y = u2[1]

while (cond) 
    if (cond1)
        x = append(x, u1[1])  # x の末尾に u1[1] を追加
        y = append(y, u2[1])
    end

    if (cond2)
        x = append(x, u1[2])
        y = append(y, u2[2])
    end

    ...

    if (condn)
        x = append(x, u1[n])
        y = append(y, u2[n])
    end
end

z = (x == y) 

```

このプログラムの最後の `z` の定数伝播の結果を考えましょう。

`z = (x == y)` に至る CFG 上のパスはドミノの並べ方に 1対1 で対応していることから、
$\text{MOP}$ 解 における `z` の値は `u1`, `u2` が MPCP の解をもたないとき、またそのときに限り `false` になります。




したがって、 $\text{MOP}$ 解が求まるとすると MPCP が解けてしまいます。

したがって $\text{MOP}$ 解の求解は決定不能です。

## 感想

任意の選択を任意回させる、みたいなのでポストの対応問題族に帰着させるのができるわけですね。

決定不能であることを示すやつで毎回天才証明に唸ってしまうので、同じ作戦で何か証明してみたいところです。

## 参考文献

- [Principles of Program Analysis](https://link.springer.com/book/10.1007/978-3-662-03811-6)





