---
title: GSoC 2025 Final Report (日本語)
author: abap34
date: 2025/08/26
tag: [Julia, Language Server, コンパイラ, GSoC]
twitter_id: abap34
github_id: abap34
mail: abap0002@gmail.com
ogp_url: https://images.dog.ceo/breeds/retriever-flatcoated/n02099267_979.jpg
description: GSoC 2025 の最終レポートです。Julia Language Serverの開発に関する内容をまとめています。
url: https://abap34.com/posts/gsoc2025_final_report.html
site_name: abap34's blog
twitter_site: @abap34
---

## GSoC 2025 最終レポート

このブログは，
Google Summer of Code 2025 において私が取り組んだ [Development of a New Language Server for Julia](https://summerofcode.withgoogle.com/programs/2025/projects/9PZY6C2m) の最終レポートです．


## プロジェクトの概要

Google Summer of Codeでは、「Julia向けの新しい言語サーバーの開発」というプロジェクトに取り組みました。

これは、Juliaの最新のコンパイラ基盤を活用し、
強力な静的解析を提供する全く新しい言語サーバーを構築するという、
非常に刺激的なプロジェクトです。

この新しい言語サーバーは、JET（私のメンターであり、このプロジェクトも主導している門脇修平氏が開発）、
JuliaSyntax.jl、JuliaLowering.jlといったツールを効果的に活用します。

これにより、潜在的なバグをより効果的に検出し、正確かつ迅速な診断結果を報告し、
そして高い保守性を維持できる言語サーバーを開発できます．

## 取り組んだ成果

このプロジェクトは非常に早期の段階なので，
プロポーザルではメンターと協議して臨機応変に様々なタスクに取り組むことにしていましたが，実際に私が取り組んだものは様々な細かいものが多くなりました．

![](gsoc2025_final_report/image.png)


画像は私が JETLS 本体に open した PR の一部です．

そのコメントの数からわかるように，非常に多くの努力を払って私の貢献をサポートしてくれた
メンターの aviatesk 氏をはじめとしたコミュニティの皆さんにとても感謝しています．

### 特に大きな貢献

私の貢献のうち機能として大きなものはいくらかあります．

- [local binding の Go to Definition の実装](https://github.com/aviatesk/JETLS.jl/pull/115)
  - まさに JuliaLowering が素晴らしい役割を果たしているものです！
  
<!-- <video controls width="600">
  <source src="https://github.com/user-attachments/assets/cb924339-4475-4171-b390-db3c88ddc257" type="video/mp4">
  Your browser does not support the video tag.
</video> -->


- [method の Go to Definition の実装](https://github.com/aviatesk/JETLS.jl/pull/61)
  - JETLS はマクロによって定義された関数へのジャンプもできます :)
  
<img src="https://private-user-images.githubusercontent.com/53076594/452608655-4c7c3571-d7f9-4f14-a431-eb794afe9ffc.gif?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NTY0NTQyMDAsIm5iZiI6MTc1NjQ1MzkwMCwicGF0aCI6Ii81MzA3NjU5NC80NTI2MDg2NTUtNGM3YzM1NzEtZDdmOS00ZjE0LWE0MzEtZWI3OTRhZmU5ZmZjLmdpZj9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNTA4MjklMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUwODI5VDA3NTE0MFomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTU4NzdlNjFmNWFlNjEwYTg0MWM5YmVhNTA1NmYyMzJjMTlmMDg1YTc0ZmZlNTdmMmNhNDA3MWZlNDNkNGEzMzUmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.WZqFCh8CPNXOoBrmi-7-XKKW-mX2Wau-A2tYVRXhRos" alt="image-1" width="600"/>

- [LaTeX Symbol, emoji の Completion の実装](https://github.com/aviatesk/JETLS.jl/pull/31)


<!-- <video controls width="600">
<source src="https://github.com/user-attachments/assets/0ee649ae-5404-4553-8b12-fe0858cd60fc" type="video/mp4">
Your browser does not support the video tag.
</video> -->


- [基本的な Configuration System の実装](https://github.com/aviatesk/JETLS.jl/pull/185)

<!-- <img src="https://github.com/user-attachments/assets/8128f891-cbfb-490d-a905-aa342c82d9fc" alt="config_demo_v1" width="600"/> -->


- [再帰的な解析機能の実装 (WIP ですが終わりが近いです．この blog が publish される頃には完了しているかもしれません)](https://github.com/aviatesk/JETLS.jl/pull/236)

<figure>

<img src="gsoc2025_final_report/image-2.png" alt="image-2" width="600"/>

<figcaption>図: 再帰的な解析機能のデモ</figcaption>
</figure>


#### そのほかの詳細

概要でも述べたように，この Language Server は Julia の新しいコンパイラインフラを活用しています．
これらは非常に素晴らしく， Language Server 開発において本当に素晴らしいものです．

これらも依然として活発に開発が行われている最中であり，まだ不安定なところもあります．
Language Server の開発を通してこれらへの理解を深められたことも私にとっては素晴らしいことでした．

プロジェクトの最中には， Language Server の開発中に気がついた複数のバグの修正パッチを送信できたこと [https://github.com/c42f/JuliaLowering.jl/pull/37](https://github.com/c42f/JuliaLowering.jl/pull/37), [https://github.com/c42f/JuliaLowering.jl/pull/41](https://github.com/c42f/JuliaLowering.jl/pull/41) は非常に良かったと思います．

他にも， Julia コンパイラおよび JET.jl についても非常に理解が深まりました．
とくに，この LS における 「グローバルな実行」について aviatesk 氏と多く議論できたことは LS 開発において非常に重要なことでした．

#### LS の現状

⚠️ このセクションは私の貢献だけではなく，この LS に興味を持ってくれた人のための LS 全体の進歩について書いたものです．

[README.md のロードマップ](https://github.com/aviatesk/JETLS.jl?tab=readme-ov-file#roadmap) にあるように， 
JETLS はすでに様々な機能をサポートしています．エラーの検出はもちろん，フォーマットや素晴らしいテストランナーも組み込まれています．

実用にはまだパフォーマンスや安定性で非常に大きな課題がありますが，多くの進歩がう