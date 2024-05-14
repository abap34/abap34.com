---
title: pybind11 を使って C++の関数をバインドして Pythonから呼び出す (m1mac)
author: abap34
date: 2024/05/14
tag: [C++, Python, pybind11, 日記]
twitter_id: abap34
github_id: abap34
mail: abap0002@gmail.com
ogp_url: https://images.dog.ceo/breeds/bulldog-french/n02108915_311.jpg
description: pybind11 を使って C++の関数を .so にして Python から呼び出す方法を紹介します。
url: https://abap34.com/posts/pybind11.html
site_name: abap34's blog
twitter_site: @abap34
---

## ことの経緯

今日も自作マークダウンパーサである [https://github.com/abap34/ALMO](https://github.com/abap34/ALMO) の開発をしています。

昨今の機能拡張にともなって色々なライブラリを使いたくなってきたのですが、
C++のパッケージマネージャにあまりちゃんとしたものがなく、**C++を使うのがかなりしんどくなってきました。**


Rust とかで書き換えるのは個人的にありでしたが、開発メンバは C++ なら書けるという人が多い (というか、それが C++で書かれた理由です)　ので
みんなに働いてもらうためにもあまり大幅な変更は避けたいところです。


というわけで、最終的に現在の内部実装には手を入れず、外部から Python で呼び出せるようにすることにしました。


実際にパースするところなど、パフォーマンス的に重要な部分は今の C++で書かれたままにして、 
Front YAML のパースやリアルタイムのプレビュー、 Jupyter Notebook の解析のような、
パフォーマンスにそこまで影響せずかつライブラリに頼りたい部分はライブラリが豊富な Python で書く案です。　


## pybind11

<a href="https://github.com/pybind/pybind11"><img src="https://gh-card.dev/repos/pybind/pybind11.svg"></a> 


**pybind11** は、 C++の関数やクラスをバインドして Python から呼び出すためのライブラリです。

PyTorch や TensorFlow もこれを使っています。

かなり少ないコード量でかつオーバーヘッドもかなり少なく Python から C++ を呼び出すことができます。


### セットアップ

環境は以下の通りです。

```
---------------------
OS: macOS 13.5 22G74 arm64
Host: Mac14,2
Kernel: 22.6.0
Uptime: 1 day, 4 hours, 21 mins
Packages: 170 (brew)
Shell: fish 3.6.1
Resolution: 1470x956
DE: Aqua
WM: Quartz Compositor
WM Theme: Blue (Light)
Terminal: iTerm2
Terminal Font: JuliaMono-Regular 12
CPU: Apple M2
GPU: Apple M2
Memory: 3397MiB / 24576MiB
```

m1mac なので色々とめんどそうな予感もしますがやっていきます。

さて、pybind11 は親切にも pip でインストールできます。


バージョンとかにかなりセンシティブなので pipenv とかを使うと良さそうです。

```bash
$ pipenv --python 3.9
```

```bash
$ pipenv install pybind11
```

これだけでインストールは完了です。すごい。

早速 Pythonで動かしたい C++ の関数を書いてみます。

```cpp
#include <pybind11/pybind11.h>

int add(int i, int j) {
    return i + j;
}
```

これを `example` という名前のモジュールにバインドしてみます。
 

```cpp
PYBIND11_MODULE(example, m) {
    m.doc() = "pybind11 example plugin"; // optional module docstring

    m.def("add", &add, "A function which adds two numbers");
}
```

コンパイルしてみます。

```bash
g++ \
 -O3 -shared -std=c++23 -undefined dynamic_lookup \
 $(python3 -m pybind11 --includes) \
 example.cpp -o example.so
```

`example.so` が生成されました。 早速動かしてみます。

```bash
$ pipenv run python3 -c "import example; print(example.add(1, 2))"
3
```


$1 + 2$ が計算されてます！
無事に Python から C++ の関数を呼び出すことができました！　革命ですね 


Apple Silicon だと `-undefined dynamic_lookup` というオプションをつけないとエラーが出るので注意してください。


## 実践編

ALMO の関数もバインディングすると...


<a href="https://asciinema.org/a/659310" target="_blank"><img src="https://asciinema.org/a/659310.svg" /></a>


Python から `almo.md_to_html` するだけで HTML が生成されるようになりました　🥳

たいていの型はいい感じに 対応づけられているので、そこまで変なことをしていなければかなり簡単にバインドできると思います。

## まとめ
割とお手軽に C++ の関数を Python から呼べました。

良くも悪くも最近の機械学習のソフトウェアによくある構成なので一応動かし方がわかってﾊｯﾋﾟｰﾊｯﾋﾟｰハッピー

## 今日の一曲


<iframe width="560" height="315" src="https://www.youtube.com/embed/FEfJB32wvsk?si=JQzQdx6nhqMSXlw8" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>



