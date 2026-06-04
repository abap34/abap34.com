## Resume

<p class="cv-name">Yuchi Yamaguchi (山口 悠地)</p>

<img src="/yuchi.png" alt="Yuchi" width="200" height="200" >

### 連絡先

Email: [yuchi@abap34.com](mailto:yuchi@abap34.com)

GitHub: [@abap34](https://github.com/abap34)

Twitter: [@abap34](https://twitter.com/abap34)

SpeakerDeck: [@abap34](https://speakerdeck.com/abap34)

Website: [abap34.com](https://abap34.com)

### 興味の方向性

とくに大目標を定めない (より過激には，定めるべきではないと思っている) タイプで，細かい取り組んでいるトピックはかなり流動的です．

ただ，大雑把にはさまざまな問題のための一般的な解決策を見出すことに楽しさを感じることが多く，基盤となるソフトウェアや理論に興味が向いていることが多いです．

ただし，そのために個別の問題に向き合うことをやめるわけではなく，

- 個別の問題に対する解決策の追求
- そこから得られた知見をもとに一般的な解決策を見出す

というサイクルを回すことが大事だと思っています．

#### 具体的な興味

中学生・高校生ごろには主に機械学習に興味を持っており，
データ分析コンペティションへの参加や数理最適化の勉強などをしていました．

大学入学以降はコンパイラやプログラミング言語そのものに対する興味が増し，関連する分野の研究と開発を行っています．

現在主に興味があるトピックは以下の通りです．

- プログラム解析関連
  - とくに抽象解釈などによる静的解析の理論
  - 開発支援ソフトウェアの実装
- 最適化コンパイラ
- 形式検証
- コンパイラインフラ (LLVM, MLIR など)
- ML System

### 経歴

#### 学歴

- -2022 年3月 東海高等学校
-  2022 年4月- 東京工業大学情報理工学院
-  2023 年4月- 東京工業大学情報理工学院情報工学系
-  2025 年4月- 東京工業大学情報理工学院 情報工学系 Programming Systems Group (渡部研究室)

#### 職歴

- 2022 年 7月 - 2022年 9月 DENSO IT Laboratory
  - DNN を用いた超高解像度画像に対する異常検知の研究開発
- 2023 年 3月 - 2023年 4月 株式会社サイカ
  - Julia 言語を用いたハイパフォーマンスな数理最適化ライブラリの開発
- 2024 年 11月 - 2025年 5月 日本経済新聞社
  - LLM を用いたサービスのバックエンド開発，データ分析コンペの作問・運営

#### その他

- 2025年 Google Summer of Code 2025 ─ Development of a New Language Server for Julia (Org: Julia Language)
  - [[Final Report]](https://www.abap34.com/posts/gsoc2025_final_report.html)
- 2025年 Teaching Assistant: 関数型プログラミング基礎

### スキル

コンピュータサイエンス (とくにプログラミング言語処理系，静的プログラム解析，機械学習) に関する基本的な知識と 10 年以上のプログラミング経験があります．

よく使うプログラミング言語は Julia, Python, C++, JavaScript, Scheme などですが，基本的に特定の言語に対する苦手意識などはあまりなく，必要に応じて新しい言語を学びながらプロジェクトを進めたいタイプです．

Git/GitHub や CI/CD，Docker などの基本的な開発ツールも日常的に使用しています．

プロジェクトの一覧などは [[abap34.com/works]](https://abap34.com/works) あるいは GitHub を確認してください．

#### 専門分野に関連するもの

プログラミング言語処理系に対する知識と開発経験があります．例えば

- 停止性の保証や各種エディタ支援，インクリメンタル・並列ビルドなどを備えたスライド記述言語 [[abap34/ss]](https://github.com/abap34/ss)
- 抽象解釈による型解析を備えたインタプリタ: [[abap34/mu]](https://github.com/abap34/mu)
- call/cc, TCO などが実装された Scheme インタプリタ: [[abap34/eta]](https://github.com/abap34/eta)
- 拡張 Markdown パーサ [[abap34/almo]](https://github.com/abap34/almo)

などを開発しています．

OS などのシステムソフトウェアの知識が必要な開発の経験があります．例えば

- libuv などを使わない自作 JS Runtime [[abap34/KoBun]](https://github.com/abap34/KoBun)

などを開発しています．

これらを横断する例として

- Julia の次世代 Language Server [[aviatesk/JETLS.jl]](https://github.com/aviatesk/JETLS.jl)

の Core Contributor をしていました．

抽象解釈などによるプログラム解析の理論や，モデル検査，定理証明支援系など形式検証についての基本的な知識があります．
例えば

- LK にもとづく定理証明支援系 [[lapisla-prover/lapisla-prover]](https://github.com/lapisla-prover/lapisla-prover)

をチームで開発したことがあります．

#### データサイエンス・機械学習・数理最適化に関連するもの

機械学習に対しても長く興味を持っています．

例えば，高校生のときにはデータ分析コンペティションにいくらか参加しており，

- 第 85 回日本循環器学会学術集会 における心筋梗塞の検出予測コンペでの優勝経験 [[solution]](https://speakerdeck.com/chizuchizu/quan-guo-yi-liao-aikontesuto-2021-1st-place-solution)

などがあります．

また，データ分析コンペの運営経験もあり，大学のサークルにおいて立ち上げたコミュニティにおいて 5 回コンペティションを開催しました．

どのコンペティションも大きな問題なく終了することができ，その準備のために BigQuery などを用いた大規模データの収集や処理の経験もあります．

機械学習のソフトウェア的な基盤に対する興味を持っており，例えば

- 自動微分の理論と実装に関する発表 [[slide]](https://speakerdeck.com/abap34/julia-tokyo-number-11-toku-juliadebu-kuzi-dong-wei-fen)
- 並列計算における乱数生成に関する発表 [[slide]](https://speakerdeck.com/abap34/bing-lie-hua-shi-dai-noluan-shu-sheng-cheng)
- 自作の深層学習フレームワークの開発 [[abap34/JITrench.jl]](https://github.com/abap34/JITrench.jl)

などの経験があります．

#### その他の細かいスキル

初歩的な Web 開発の経験があります．

React / Next.js を使ったフロントエンド開発，FastAPI などを使ったバックエンド開発の経験，streamlit などを使ったサービスの開発経験などがあります．

例えば
- オンラインジャッジシステム (React, FastAPI) [[post]](https://www.abap34.com/posts/oj_abap34.html)
- コンペプラットフォーム (streamlit) [[post]](https://www.abap34.com/posts/dacq.html)
- 個人サイト (React) [[abap34.com]](https://abap34.com)

などを開発しています．

そのほかにも普段使っているさまざまなソフトウェアでバグや機能不足などに気がついたときにはいろいろとパッチを送っています．

また，技術発信も比較的積極的に行っており，[[ブログ]](https://www.abap34.com/posts/) や [[SpeakerDeck]](https://speakerdeck.com/abap34) などに記事や発表資料を公開しています．


人前での発表や講義は比較的得意だと思っており，クオリティに対して高い評価をもらえることが非常に多いです．


#### 言語・コミュニケーション

- 日本語: ネイティブ
- 英語: 日常会話レベル (TOEIC L&R 860)

### リーダシップをとった経験

所属するサークルにおいて，データ分析コンペティションに取り組むコミュニティを立ち上げ

- 5 回のコンペティションを開催し，うち 2 回は企業の協賛のもと開催
- 新入生教育のための講義 (約10時間) とオンラインジャッジ・コンペプラットフォームの開発

などを行いました．

- [[資料などをまとめたページ]](https://abap34.github.io/ml-lecture/)

コンペティションの規模は徐々に拡大し，最終的に 110 人以上の参加者から 1700件以上の提出を集めるまで成長しました．

- [[関連ツイート 1]](https://x.com/abap34/status/1811009775033078126/photo/)
- [[関連ツイート 2]](https://x.com/abap34/status/1813519964734910959/photo/1)

この際，新入生へのヒアリングを通して
「コンペティションの最初の提出までのハードルの高さ」を課題として特定し，
それを解決するための手段として初心者講座や Starter Notebook といった仕組みを整備しました．

その結果，最終的にどのコンペでもほぼ全員がコンペに複数回提出するという目標を達成することができました．

具体的な取り組みなどは開催ブログとして共有し，後輩や他大学の学生などが参考にできるようにしています．

- 初年度の開催記録 [[post]](https://trap.jp/post/1918/)
- 開催経験から得られた知見をまとめたブログ [[post]](https://www.abap34.com/posts/community_competetion_tips.html)

### 取り組みたい仕事・働き方など

これまでの一般に公開した成果が次の面白い仕事につながってきた経験から，成果を OSS や論文などのかたちで対外発表に繋げられることを強く希望しています．


できればなるべくオフィスに出社したいタイプですが，リモートワークでもあまり気にはしません．


経済的な問題がクリアできれば博士後期過程へ進学するか，あるいは社会人博士などで博士号を取得したいと考えています．
