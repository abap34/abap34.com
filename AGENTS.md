# AGENTS.md

このファイルは、Codex (Codex.ai/code) がこのリポジトリで作業する際のガイダンスを提供します。

## 概要

https://abap34.com の個人ブログサイト。ハイブリッド構成になっています:
- **ブログ記事**: Markdown で書き、自作 C++ Markdown コンパイラ [almo](https://github.com/abap34/almo)（`almo/` に git submodule として配置）で HTML に変換
- **フロントエンド**: React (Create React App) SPA。ホーム・Works・ナビゲーションページを担当
- **ビルドパイプライン**: Python（`uv` で依存管理）。almo コンパイル・OGP 取得・TF-IDF 関連記事計算・RSS 生成を統括

## 主なコマンド

### 開発

```bash
# 新規記事のスキャフォールド生成
./gen.sh <post-name>

# ウォッチモード: posts/ の変更を監視して自動リビルド
./watch.sh

# 単一記事を高速ビルド（ナビゲーション無し）
uv run blog_builder/build.py -a <post-name> --no-navigation

# 単一記事をナビゲーション・関連記事付きでビルド
uv run blog_builder/build.py -a <post-name>

# 全記事フルリビルド
REBUILD=true uv run blog_builder/build.py

# React 開発サーバー起動
npm start
```

### 本番ビルド (Vercel)

```bash
bash scripts/vercel-build.sh
# almo C++ コンパイラのビルド → REBUILD=true SKIP_WIP_ARTICLES=true uv run blog_builder/build.py → RSS 生成 → npm run build
```

## アーキテクチャ

```
posts/           ← ブログ記事の Markdown ソース
posts/<name>/    ← 記事ごとのアセットディレクトリ（画像など）
blog_builder/    ← Python ビルドパイプライン（uv インラインスクリプト形式）
  build.py       ← ビルドのメインエントリ
  generate.py    ← 記事スキャフォールド生成スクリプト
  watch.py       ← ファイル監視 / ライブリロード開発サーバー
  rss.py         ← RSS フィード生成
  tfidf_similarity.py / precompute_vectors.py  ← TF-IDF 関連記事計算
almo/            ← Git submodule: C++ Markdown-to-HTML コンパイラ
config/
  config.json    ← サイト全体設定（root_url・author・almo フラグ・tfidf パラメータ）
  external_articles.json  ← posts.json に含める外部記事
assets/          ← template.html（almo テンプレート）と style.css
src/             ← React アプリ (CRA)
  pages/         ← Home.js, Blog.js, Works.js
  components/    ← Navbar.js
public/
  posts.json     ← 全記事のインデックス（React が読み込む）
  posts/         ← almo によるコンパイル済み HTML
```

## ビルドパイプラインの流れ

1. `build.py` が `posts/*.md` を読み込み、OGP URL 展開（`{@ogp <url>}` 記法）を行い、中間 `.md` を `public/posts/` に書き出す
2. `almo/build/almo` を呼び出して各 `.md` → `.html` にコンパイル。`{{navigation}}` / `{{related_articles}}` プレースホルダーを埋め込む
3. TF-IDF 類似度（`public/tfidf_cache.pkl` にキャッシュ）とタグベースで関連記事を計算し、HTML のプレースホルダーを置換する
4. `public/posts.json` に記事メタデータ（title・date・tags・url・thumbnail）を追記
5. `config/external_articles.json` の外部記事を `posts.json` にマージ

## 記事フォーマット

almo の Markdown + YAML frontmatter 形式。主な frontmatter フィールド:
- `title`、`date`（YYYY/MM/DD）、`tag`（文字列形式の JSON 配列、例: `[Julia, 最適化]`）、`ogp_url`、`featured`

本文中の特殊記法:
- `{@ogp <url>}` — ビルド時に OGP リンクカードの HTML に置換される

WIP 記事: `wip_` で始まるファイルは `SKIP_WIP_ARTICLES=true` のとき除外される（Vercel 本番ビルドで設定）。

## almo submodule のセットアップ

記事をビルドする前に almo コンパイラのビルドが必要:
```bash
git submodule update --init --recursive
cd almo && bash ./scripts/setup.sh && g++ -std=c++23 ./build/almo.cpp -o ./build/almo
```
