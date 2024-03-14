---
title: Juliaで実行時間を制限する用のタイマー
author: abap34
date: 2023/09/24
tag: [Julia, 競技プログラミング, 日記]
twitter_id: abap34
github_id: abap34
mail: abap0002@gmail.com
ogp_url: https://images.dog.ceo/breeds/spaniel-sussex/n02102480_4923.jpg
description: Juliaで実行時間を計測してタイムアウトしたら中断する簡単な例を書きました。
url: https://abap34.com
site_name: abap34.com
twitter_site: @abap34
---


ヒューリスティックな手法などで、 適当に定めた時間だけ探索して打ち切りたいという場合があります。

競プロなどでも使える簡単めでシンプルめなJuliaでの実装を書きました。


```julia
mutable struct Timer
    timeout::Millisecond
    created::DateTime
end

function Timer(timeout_ms::Int)
    return Timer(Millisecond(timeout_ms), Dates.now())
end


function is_timeout(x::Timer)
    now_time = Dates.now()
    elapsed_time = now_time - x.created
    return elapsed_time >= x.timeout
end

 
function reset!(x::Timer)
    x.created = Dates.now()
end

 
function rate(x::Timer)
    now_time = Dates.now()
    elapsed_time = now_time - x.created
    return x.timeout / elapsed_time
end
```


使い方は、

```julia
function solve()
    # 1000 [ms] (1 [s]) でタイムアウトするタイマーを作成
    timer = Timer(1000)
    while !(is_timeout(timer))
        do_something()
    end
end
```


という感じです。

`reset!` で計測のリセット、 `rate` で経過時間の割合を取得できます。 (焼きなまし法などで使う用です。)


 





