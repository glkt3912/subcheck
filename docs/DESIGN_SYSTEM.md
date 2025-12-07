# SubCheck デザインシステム

## 概要

SubCheckのデザインシステムは、Tailwind CSS v4の`@theme`機能を活用した統一的なデザイン言語を提供します。このドキュメントでは、デザイントークン、コンポーネントのスタイリングガイドライン、およびベストプラクティスについて説明します。

## デザイントークン

### カラーパレット

#### プライマリーカラー

```css
--color-primary-50: #eff6ff
--color-primary-100: #dbeafe
--color-primary-200: #bfdbfe
--color-primary-300: #93c5fd
--color-primary-400: #60a5fa
--color-primary-500: #3b82f6  /* メインのプライマリーカラー */
--color-primary-600: #2563eb  /* ホバー状態 */
--color-primary-700: #1d4ed8
--color-primary-800: #1e40af
--color-primary-900: #1e3a8a
```

**使用例:**
- `bg-primary-500`: メインボタン、アクセント要素
- `bg-primary-600`: ホバー状態
- `text-primary-600`: リンクテキスト

#### セマンティックカラー

**成功（Success）**
```css
--color-success-50: #f0fdf4
--color-success-500: #10b981
--color-success-600: #059669
--color-success-700: #047857
```

**警告（Warning）**
```css
--color-warning-50: #fffbeb
--color-warning-500: #f59e0b
--color-warning-600: #d97706
--color-warning-700: #b45309
```

**危険（Danger）**
```css
--color-danger-50: #fef2f2
--color-danger-500: #ef4444
--color-danger-600: #dc2626
--color-danger-700: #b91c1c
```

#### ニュートラルカラー

```css
--color-gray-50: #f9fafb   /* 背景 */
--color-gray-100: #f3f4f6  /* カード背景 */
--color-gray-200: #e5e7eb  /* ボーダー */
--color-gray-300: #d1d5db
--color-gray-400: #9ca3af
--color-gray-500: #6b7280  /* プレースホルダー */
--color-gray-600: #4b5563  /* セカンダリーテキスト */
--color-gray-700: #374151
--color-gray-800: #1f2937
--color-gray-900: #111827  /* メインテキスト */
```

### スペーシング

```css
--spacing-0: 0
--spacing-0.5: 0.125rem  /* 2px */
--spacing-1: 0.25rem     /* 4px */
--spacing-1.5: 0.375rem  /* 6px */
--spacing-2: 0.5rem      /* 8px */
--spacing-3: 0.75rem     /* 12px */
--spacing-4: 1rem        /* 16px */
--spacing-5: 1.25rem     /* 20px */
--spacing-6: 1.5rem      /* 24px */
--spacing-8: 2rem        /* 32px */
--spacing-10: 2.5rem     /* 40px */
--spacing-12: 3rem       /* 48px */
--spacing-16: 4rem       /* 64px */
--spacing-20: 5rem       /* 80px */
```

**使用ガイドライン:**
- コンポーネント内のパディング: `p-4` または `p-6`
- セクション間のマージン: `mb-8` または `mb-12`
- 大きなセクション間: `py-16`

### タイポグラフィ

#### フォントサイズ

```css
--font-size-xs: 0.75rem     /* 12px */
--font-size-sm: 0.875rem    /* 14px */
--font-size-base: 1rem      /* 16px */
--font-size-lg: 1.125rem    /* 18px */
--font-size-xl: 1.25rem     /* 20px */
--font-size-2xl: 1.5rem     /* 24px */
--font-size-3xl: 1.875rem   /* 30px */
--font-size-4xl: 2.25rem    /* 36px */
--font-size-5xl: 3rem       /* 48px */
--font-size-6xl: 3.75rem    /* 60px */
```

**階層構造:**
- H1: `text-4xl` または `text-5xl`
- H2: `text-3xl`
- H3: `text-2xl`
- H4: `text-xl`
- Body: `text-base`
- Small: `text-sm`
- Caption: `text-xs`

#### 行の高さ

```css
--line-height-tight: 1.25    /* 見出し用 */
--line-height-snug: 1.375
--line-height-normal: 1.5    /* 標準 */
--line-height-relaxed: 1.625 /* 本文用（日本語最適化） */
--line-height-loose: 2
```

### ボーダー半径

```css
--radius-none: 0
--radius-sm: 0.125rem    /* 2px */
--radius-default: 0.25rem /* 4px */
--radius-md: 0.375rem    /* 6px */
--radius-lg: 0.5rem      /* 8px */
--radius-xl: 0.75rem     /* 12px */
--radius-2xl: 1rem       /* 16px */
--radius-full: 9999px    /* 完全な円 */
```

**使用例:**
- ボタン: `rounded-md`
- カード: `rounded-lg`
- インプット: `rounded-md`
- バッジ: `rounded-full`

### シャドウ

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)
--shadow-default: 0 1px 3px 0 rgb(0 0 0 / 0.1)
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1)
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1)
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1)
```

**使用ガイドライン:**
- カード: `shadow-sm`
- ドロップダウン: `shadow-md`
- モーダル: `shadow-lg`

## コンポーネントガイドライン

### ボタン

**プライマリーボタン**
```tsx
<Button className="bg-primary-600 hover:bg-primary-700 text-white">
  アクション
</Button>
```

**セカンダリーボタン（アウトライン）**
```tsx
<Button className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-900">
  キャンセル
</Button>
```

**危険なアクション**
```tsx
<Button className="bg-danger-600 hover:bg-danger-700 text-white">
  削除
</Button>
```

### カード

**標準カード**
```tsx
<Card className="rounded-lg border bg-card shadow-sm">
  <CardHeader>
    <CardTitle>タイトル</CardTitle>
  </CardHeader>
  <CardContent>
    コンテンツ
  </CardContent>
</Card>
```

**アクセント付きカード**
```tsx
<Card className="border-2 border-primary-200 bg-primary-50">
  {/* コンテンツ */}
</Card>
```

### フォーム要素

**インプット**
```tsx
<input
  type="text"
  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
/>
```

**トグルスイッチ**
```tsx
<label className="relative inline-flex items-center cursor-pointer">
  <input type="checkbox" className="sr-only peer" />
  <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
</label>
```

## アクセシビリティガイドライン

### カラーコントラスト

- テキストと背景のコントラスト比は最低4.5:1（WCAG AA準拠）
- 大きなテキスト（18pt以上）は3:1以上

**推奨の組み合わせ:**
- `text-gray-900` on `bg-white`
- `text-white` on `bg-primary-600`
- `text-gray-700` on `bg-gray-50`

### フォーカスインジケーター

すべてのインタラクティブ要素には明確なフォーカススタイルを適用:

```css
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
```

### タッチターゲット

モバイルデバイスでのタッチターゲットは最低44x44px:

```tsx
<button className="min-h-[44px] min-w-[44px] p-3">
  アイコン
</button>
```

## レスポンシブデザイン

### ブレークポイント

Tailwindのデフォルトブレークポイントを使用:

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

**使用例:**
```tsx
<div className="text-sm md:text-base lg:text-lg">
  レスポンシブテキスト
</div>
```

### コンテナ

```tsx
<div className="container mx-auto px-4">
  {/* コンテンツ */}
</div>
```

## パフォーマンスベストプラクティス

### クラス名の最適化

1. **繰り返し使用するスタイルは共通化**
   ```tsx
   const cardBaseClasses = "rounded-lg border bg-card shadow-sm p-6"
   ```

2. **条件付きクラスには`cn()`ヘルパーを使用**
   ```tsx
   import { cn } from "@/lib/utils"

   <div className={cn(
     "base-classes",
     isActive && "active-classes"
   )} />
   ```

3. **過度な`@apply`の使用を避ける**
   - パフォーマンスとメンテナンス性のため、ユーティリティクラスを直接使用

### アニメーション

モーションを減らす設定を尊重:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 日本語タイポグラフィの最適化

### フォント設定

```css
font-family: var(--font-noto-sans-jp), system-ui, -apple-system, sans-serif;
line-height: var(--line-height-relaxed); /* 1.625 */
letter-spacing: 0.025em;
```

### 推奨事項

- 行の高さは欧文より広めに設定（1.625以上）
- 文字間隔は控えめに（0.025em）
- フォントウェイトは400（Regular）または700（Bold）を推奨

## デザイントークンの使用方法

### CSSカスタムプロパティとして

```css
.custom-element {
  background-color: var(--color-primary-500);
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
}
```

### Tailwindユーティリティクラスとして

```tsx
<div className="bg-primary-500 p-4 rounded-lg">
  {/* コンテンツ */}
</div>
```

## まとめ

このデザインシステムは、一貫性のあるユーザー体験を提供し、開発効率を向上させることを目的としています。新しいコンポーネントやページを作成する際は、このガイドラインに従ってください。

質問や提案がある場合は、プロジェクトのIssueセクションで議論してください。
