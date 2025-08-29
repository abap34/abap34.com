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

このブログは，　Google Summer of Code 2025 において私が取り組んでいた [Development of a New Language Server for Julia](https://summerofcode.withgoogle.com/programs/2025/projects/9PZY6C2m) の最終レポートです．

これは、Juliaの最新のコンパイラ基盤を活用し、
強力な静的解析を提供する全く新しい言語サーバーを構築するという、
非常に刺激的なプロジェクトです。

## 取り組んだ成果

このプロジェクトは非常に早期の段階なので，
プロポーザルではメンターと協議して臨機応変に様々なタスクに取り組むことにしていましたが，
実際に私は非常に広い範囲のタスクに取り組みました．

![](gsoc2025_final_report/image.png)


画像は私が JETLS 本体に open した PR の一部です．

そのコメントの数からわかるように，メンターの aviatesk 氏をはじめとしたコミュニティの皆さん
非常に多くの努力を払って私の貢献をサポートしてくれました．

### 詳しい貢献

私の貢献のうち機能として大きなものはいくらかあります．

#### method の Go to Definition の実装


<img src="https://private-user-images.githubusercontent.com/53076594/452608655-4c7c3571-d7f9-4f14-a431-eb794afe9ffc.gif?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NTY0NTQyMDAsIm5iZiI6MTc1NjQ1MzkwMCwicGF0aCI6Ii81MzA3NjU5NC80NTI2MDg2NTUtNGM3YzM1NzEtZDdmOS00ZjE0LWE0MzEtZWI3OTRhZmU5ZmZjLmdpZj9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNTA4MjklMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUwODI5VDA3NTE0MFomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTU4NzdlNjFmNWFlNjEwYTg0MWM5YmVhNTA1NmYyMzJjMTlmMDg1YTc0ZmZlNTdmMmNhNDA3MWZlNDNkNGEzMzUmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.WZqFCh8CPNXOoBrmi-7-XKKW-mX2Wau-A2tYVRXhRos" alt="image-1" width="600"/>


- [https://github.com/aviatesk/JETLS.jl/pull/61](https://github.com/aviatesk/JETLS.jl/pull/61)

- JETLS はマクロによって定義された関数へのジャンプもできます :)
- 将来的には JETLS が行う高度な型解析の結果に基づいて， 実際に呼ばれうるメソッドのみを候補に出すような拡張を行う予定です．

#### local binding の Go to Definition の実装


<video controls width="600">
  <source src="https://github.com/user-attachments/assets/cb924339-4475-4171-b390-db3c88ddc257" type="video/mp4">
  Your browser does not support the video tag.
</video>



- [https://github.com/aviatesk/JETLS.jl/pull/115](https://github.com/aviatesk/JETLS.jl/pull/115)
- まさに JuliaLowering が素晴らしい役割を果たしているものです！

<!-- #### LaTeX Symbol, emoji の Completion の実装

- https://github.com/aviatesk/JETLS.jl/pull/31 -->

#### 基本的な Configuration System の実装


<img src="https://github.com/user-attachments/assets/8128f891-cbfb-490d-a905-aa342c82d9fc" alt="config_demo_v1" width="600"/>


- [https://github.com/aviatesk/JETLS.jl/pull/185](https://github.com/aviatesk/JETLS.jl/pull/185)
- 起動後に動的に変更も可能になっています．
- 将来的にはスキーマを公開して，多くのエディタで補完やバリデーションを行えるようにする予定です．

#### 再帰的な解析機能の実装 (WIP ですが終わりが近いです．この blog が publish される頃には完了しているかもしれません)

![再帰的な解析によって依存パッケージのエラーを発見する様子](gsoc2025_final_report/image-2.png)

- [https://github.com/aviatesk/JETLS.jl/pull/236](https://github.com/aviatesk/JETLS.jl/pull/236)
- Julia のパッケージローディングの仕組みを詳しく調べる必要があり，とても大変でした．

その他にも関連パッケージや細かい修正を含めて 30個近くの PR がマージされました :)

<details>

<summary>完全なリスト</summary>

- [https://github.com/aviatesk/JETLS.jl/pull/236](https://github.com/aviatesk/JETLS.jl/pull/236)
- [https://github.com/JuliaStrings/InlineStrings.jl/pull/88](https://github.com/JuliaStrings/InlineStrings.jl/pull/88)
- [https://github.com/aviatesk/JETLS.jl/pull/228](https://github.com/aviatesk/JETLS.jl/pull/228)
- [https://github.com/c42f/JuliaLowering.jl/pull/41](https://github.com/c42f/JuliaLowering.jl/pull/41)
- [https://github.com/aviatesk/JETLS.jl/pull/223](https://github.com/aviatesk/JETLS.jl/pull/223)
- [https://github.com/c42f/JuliaLowering.jl/pull/37](https://github.com/c42f/JuliaLowering.jl/pull/37)
- [https://github.com/aviatesk/JETLS.jl/pull/206](https://github.com/aviatesk/JETLS.jl/pull/206)
- [https://github.com/aviatesk/JETLS.jl/pull/205](https://github.com/aviatesk/JETLS.jl/pull/205)
- [https://github.com/aviatesk/JETLS.jl/pull/185](https://github.com/aviatesk/JETLS.jl/pull/185)
- [https://github.com/aviatesk/JETLS.jl/pull/148](https://github.com/aviatesk/JETLS.jl/pull/148)
- [https://github.com/aviatesk/JETLS.jl/pull/145](https://github.com/aviatesk/JETLS.jl/pull/145)
- [https://github.com/aviatesk/JETLS.jl/pull/143](https://github.com/aviatesk/JETLS.jl/pull/143)
- [https://github.com/aviatesk/JETLS.jl/pull/139](https://github.com/aviatesk/JETLS.jl/pull/139)
- [https://github.com/aviatesk/JETLS.jl/pull/132](https://github.com/aviatesk/JETLS.jl/pull/132)
- [https://github.com/aviatesk/JETLS.jl/pull/123](https://github.com/aviatesk/JETLS.jl/pull/123)
- [https://github.com/aviatesk/JETLS.jl/pull/115](https://github.com/aviatesk/JETLS.jl/pull/115)
- [https://github.com/aviatesk/JETLS.jl/pull/104](https://github.com/aviatesk/JETLS.jl/pull/104)
- [https://github.com/aviatesk/JETLS.jl/pull/79](https://github.com/aviatesk/JETLS.jl/pull/79)
- [https://github.com/aviatesk/JETLS.jl/pull/77](https://github.com/aviatesk/JETLS.jl/pull/77)
- [https://github.com/aviatesk/JETLS.jl/pull/72](https://github.com/aviatesk/JETLS.jl/pull/72)
- [https://github.com/aviatesk/JETLS.jl/pull/69](https://github.com/aviatesk/JETLS.jl/pull/69)
- [https://github.com/aviatesk/JETLS.jl/pull/61](https://github.com/aviatesk/JETLS.jl/pull/61)
- [https://github.com/aviatesk/JETLS.jl/pull/56](https://github.com/aviatesk/JETLS.jl/pull/56)
- [https://github.com/aviatesk/JETLS.jl/pull/40](https://github.com/aviatesk/JETLS.jl/pull/40)
- [https://github.com/aviatesk/JETLS.jl/pull/31](https://github.com/aviatesk/JETLS.jl/pull/31)
- [https://github.com/aviatesk/JETLS.jl/pull/11](https://github.com/aviatesk/JETLS.jl/pull/11)
- [https://github.com/aviatesk/JETLS.jl/pull/10](https://github.com/aviatesk/JETLS.jl/pull/10)

</details>

#### そのほかの詳細

概要でも述べたように，この Language Server は Julia の新しいコンパイラインフラを活用しています．

Language Server の開発を通してこれらへの理解を深められたことも私にとっては素晴らしいことでした．

プロジェクトの最中には， Language Server の開発中に気がついた複数のバグの修正パッチを送信できたこと [https://github.com/c42f/JuliaLowering.jl/pull/37](https://github.com/c42f/JuliaLowering.jl/pull/37), [https://github.com/c42f/JuliaLowering.jl/pull/41](https://github.com/c42f/JuliaLowering.jl/pull/41) は非常に良かったと思います．

他にも， Julia コンパイラおよび JET.jl についても非常に理解が深まりました．

とくに，この LS における 「仮想的なグローバルな実行」について 
aviatesk 氏と多く議論できたことは LS 開発において非常に重要なことでした．

#### 残りの仕事

[README.md のロードマップ](https://github.com/aviatesk/JETLS.jl?tab=readme-ov-file#roadmap) にあるように， JETLS はすでに様々な機能をサポートしています．エラーの検出はもちろん，フォーマットや素晴らしいテストランナーも組み込まれています．
(⚠️ 明確化: このセクションは私の貢献だけではなく，この LS に興味を持ってくれた人のための LS 全体の進歩について書いたものです．)


ただ，実用にはまだパフォーマンスや安定性で非常に大きな課題があります．私はこの解決に強い関心があるので，
起動の高速化のための様々な知られた技法の適用，そしてこの LS にもっとも適したキャッシュ戦略の研究などに取り組みたいと考えています．


## 結論

このプロジェクトは Julia のエコシステムに大きな影響を与える可能性があり，私はこのプロジェクトの一部であることを誇りに思います．

GSoC 全体を通じて，暖かく指導をしてくれたメンターの aviatesk 氏，そして Julia コミュニティの皆さんに心から感謝します．
また，さまざまな方法でサポートしてくれた大学の友人と研究室の先輩および指導教員にも感謝します．


今後もこのプロジェクトの成功のために貢献し続けていきたいと思います！

