---
title: あなたがまだ知らない素数　(by noya2)
author: noya2
date: 2024/10/08
tag: [competitive_programming]
twitter_id: noya2
github_id: noya2
mail: abap0002@gmail.com
ogp_url: https://images.dog.ceo/breeds/pinscher-miniature/n02107312_4943.jpg
description: あなたがまだ知らない素数　(by noya2)
url: https://abap34.com/posts/random_prime_generator_.html
site_name: abap34's blog
twitter_site: @noya2
---


## はじめまして

はじめまして、noya2 です。普段は競技プログラミングをしています。almo の contributors の一人です。はじめての寄稿です。

## あなたがまだ知らない素数

次の python プログラムを実行してみましょう。あなたがまだ知らない素数を $1$ つ得ることができます。

:::loadlib
sympy
:::

:::code
import random
import sympy

# 素数の範囲
start = 10**9
end = 2*10**9

# start から end の範囲の素数を生成し、その中からランダムに1つ選択
random_prime = sympy.randprime(start, end)

print(random_prime)
:::

このコード中の `start` と `end` を調節することで、所望の範囲内の素数をランダムに得ることができます。

## おわりに

競技プログラミングで **乱択素数 $\bmod$** が欲しくなったときに使ってください。