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

データフロー解析における MOP (Meet Over Path) 解の求解は、一般には決定不能であることを定数伝播の例を用いて示します。

MPCP (Modified Post Correspondence Problem) に帰着させることで示します。 内容は Principles of Program Analysis に載っていたものにほぼ沿っています。


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

$\text{MOP}$ 解 では最後の `z`  は `u1`, `u2` が MPCP の解をもたないとき、またそのときに限り `false` になります。

`z = (x == y)` にたどり着く経路は、 (左端を `u1[1], u2[1]` というドミノで固定した) すべての並べ方を網羅しているからです。

したがって、 $\text{MOP}$ 解が求まるとすると MPCP の解が求まることになりますがこれは決定不能です。

したがって $\text{MOP}$ 解は決定不能です。

## 感想

任意の選択を任意回させる、みたいなのでポストの対応問題に帰着させるのができるわけですね。

決定不能であることを示すやつで毎回天才証明に唸ってしまうので、同じ作戦で何か証明してみたいところです。

## 参考文献

- [Principles of Program Analysis](https://link.springer.com/book/10.1007/978-3-662-03811-6)





