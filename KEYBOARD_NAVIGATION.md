# キーボードナビゲーション仕様書

## 概要
abap34.comのWebサイトにキーボード操作機能を実装し、TUI（Terminal User Interface）風の操作体験を提供します。

## 基本仕様

### 1. 初期フォーカス
- ユーザーがサイトにアクセスした時、**サイドバーの「About」リンクに自動的にフォーカスが当たる**
- 初期フォーカスインデックス: `0` (About)

### 2. キーバインディング

#### Helix風ナビゲーション（hjkl）
- `h` または `←`: 左に移動 / 前の要素に移動
- `j` または `↓`: 下に移動 / 次の要素に移動
- `k` または `↑`: 上に移動 / 前の要素に移動
- `l` または `→`: 右に移動 / 次の要素に移動

#### アクション
- `Enter`: 現在フォーカスされている要素を実行（リンクのクリック、作品の詳細表示など）
- `Escape`: フォーカスを解除 / モーダルを閉じる

### 3. フォーカス対象要素

#### サイドバー (Sidebar)
1. About (`/`) - インデックス: 0
2. Background (`/background`) - インデックス: 1
3. Works (`/works`) - インデックス: 2
4. Blog (`/blog`) - インデックス: 3

**動作:**
- `j/k` または `↓/↑` でサイドバー内のリンク間を移動
- `Enter` でそのページに遷移

#### トップページ (TopPage)

**セクション構成:**
1. Introduction（紹介セクション）
2. Recent Blog Posts（最新ブログ投稿）
   - 各投稿アイテム（最大5件）
   - 「すべての投稿を見る」リンク
3. Background（経歴セクション）
4. Works（作品セクション）
   - 各作品アイテム（最大6件、2列グリッド）
   - 「すべての作品をみる」リンク

**動作（階層的ナビゲーション）:**

**レベル1: セクションモード（初期状態）**
- Aboutページ（トップページ）に入ると、**Introductionセクションにフォーカスが当たる**
- `j/k` または `↓/↑` で以下の順にセクション間を移動:
  - Introduction → Recent Blog Posts → Background → Works
- `Enter` キーを押すと、フォーカスされているセクション内に入る（**アイテムモードに切り替え**）

**レベル2: アイテムモード**
- セクション内の個別アイテム（ブログ投稿、作品など）にフォーカスが移動
- `j/k` または `↓/↑` でセクション内のアイテム間を移動
- `h/l` または `←/→` で左右のアイテム間を移動（2列グリッド対応）
- `Enter` でブログ投稿を開く / 作品の詳細モーダルを表示 / リンクを開く
- `Escape` キーを押すと、**セクションモードに戻る**

**視覚的フィードバック:**
- セクションモード: セクション全体のボックスがハイライト
- アイテムモード: セクション内の個別アイテムがハイライト

## 実装詳細

### データ属性
フォーカス可能な要素には以下の属性を付与：
```html
<element
  data-focusable="true"
  data-focus-index={number}
  className={isFocused ? 'keyboard-focused' : ''}
>
```

### CSSクラス
フォーカスされた要素には `keyboard-focused` クラスが適用され、以下のスタイルが適用される：

#### サイドバーリンク (.sidebar-link.keyboard-focused)
```css
color: var(--background0);
background-color: var(--accent0);
border-left-color: var(--accent0);
font-weight: bold;
```

#### ブログ投稿アイテム (.search-post-item.keyboard-focused)
```css
background-color: var(--accent0);
color: var(--background0);
padding: 0.5lh 1ch;
transform: translateX(0.5ch);
```

#### 作品アイテム (.works-simple-item.keyboard-focused)
```css
background-color: var(--accent0);
color: var(--background0);
padding: 0.5lh 1ch;
```

### コンポーネント構成

#### Sidebar.js
- `focusedIndex` state: 現在のフォーカスインデックス（初期値: 0）
- `useEffect`: キーボードイベントリスナー (hjkl, 矢印キー, Enter)
- `useEffect`: フォーカスされた要素を自動スクロール

#### TopPage.js
- `focusedIndex` state: 現在のフォーカスインデックス（初期値: -1）
- `useEffect`: キーボードイベントリスナー (hjkl, 矢印キー, Enter, Escape)
- `useEffect`: フォーカスされた要素を自動スクロール

#### RecentPosts.js / BlogPostItem.js
- `focusIndex` prop を受け取り、各アイテムに `keyboard-focused` クラスを適用

#### Works.js
- `focusIndex` と `focusStartIndex` prop を受け取り、各アイテムに `keyboard-focused` クラスを適用

## ユーザー体験フロー

### 1. サイト訪問時
```
[ユーザーアクセス]
    ↓
[Aboutにフォーカス (青色ハイライト)]
    ↓
[j/kキーでナビゲーション間を移動]
    ↓
[Enterキーでページ遷移]
```

### 2. トップページでの階層的ナビゲーション
```
[トップページ表示]
    ↓
[Introductionセクションにフォーカス (セクションモード)]
    ↓
[j/kキーでセクション間を移動]
  (Introduction → Recent Blog Posts → Background → Works)
    ↓
[Enterキーでセクション内に入る (アイテムモードに切り替え)]
    ↓
[j/kキーでセクション内のアイテム間を移動]
  (ブログ投稿、作品など)
    ↓
[Enterキーでアイテムを選択]
  (ブログ記事を開く / 作品モーダルを表示)
    ↓
[Escキーでセクションモードに戻る]
```

### 3. 2列グリッド（Works）での操作
```
[Worksセクションにフォーカス (セクションモード)]
    ↓
[Enterキーでセクション内に入る]
    ↓
[j/k で上下移動、h/l で左右移動 (アイテムモード)]
    ↓
[Enterキーで作品の詳細モーダルを表示]
    ↓
[Escキーでアイテムモードに戻る / 再度Escでセクションモードに戻る]
```

## 技術メモ

### イベントリスナーの競合
- 現在、Sidebar と TopPage の両方が window レベルで keydown イベントをリッスンしている
- 両方のコンポーネントがマウント時にイベントリスナーを追加
- 将来的には、グローバルキーボードナビゲーションコンテキストでの一元管理を検討

### スクロール動作
- フォーカスされた要素は自動的に画面内にスクロールされる
- `scrollIntoView({ behavior: 'smooth', block: 'nearest' })` を使用

### フォーカスインデックスの管理
- Sidebar: 0-3 （About, Background, Works, Blog）
- TopPage: Recent Posts (0-5), Works (6-11), リンク (12)
- 各コンポーネントで独立したインデックス管理

## 今後の改善案

1. **グローバルナビゲーションコンテキスト**
   - 全ページで統一されたキーボードナビゲーション
   - コンテキストでフォーカス状態を共有

2. **モード切り替え**
   - サイドバーモード / コンテンツモード
   - Tab キーでモード切り替え

3. **検索機能**
   - `/` キーで検索ボックスにフォーカス

4. **ショートカットヘルプ**
   - `?` キーでキーボードショートカット一覧を表示

5. **ページ固有のナビゲーション**
   - Blog ページ、Works ページでもキーボードナビゲーション対応
