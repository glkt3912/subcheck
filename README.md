# SubCheck PWA - サブスク診断アプリ

[![Next.js](https://img.shields.io/badge/Next.js-14+-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-green?logo=pwa)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/License-BSL--1.1-orange)](LICENSE)
![GitHub Stars](https://img.shields.io/github/stars/glkt3912/subcheck?style=social)
![GitHub Forks](https://img.shields.io/github/forks/glkt3912/subcheck?style=social)

> **年間平均5万円の節約**を実現するサブスクリプション診断ツール

SubCheckは、あなたのサブスクリプション利用状況を診断し、年間の無駄遣いを可視化するProgressive Web Application (PWA)です。

## 📸 Demo

<!-- TODO: スクリーンショット追加予定 -->
> デモ画像は準備中です

<!-- TODO: ライブデモURL追加 -->
**🚀 Live Demo:** デプロイ準備中

## 💡 解決する問題

- 🤔 「どのサブスクに入っているか忘れた」
- 💸 「使っていないのに課金され続けている」
- 📊 「本当に必要なサービスか分からない」

**SubCheckは、こうした悩みを3ステップで解決します。**

### 💰 実際の効果（想定例）

```
Before: 月額 8,500円（年間 102,000円）
 • Netflix    1,490円 → 月1回しか見ない
 • Spotify    1,080円 → ほぼ使っていない
 • Prime       600円 → 配送だけ利用
 • その他サービス...

After:  月額 4,200円（年間 50,400円）
 💰 年間 51,600円の節約に成功！
```

## 🌟 主な機能

### 🎯 サブスク診断機能

- **主要サービス対応**: Netflix、Spotify、Amazon Primeなど人気サービス
- **使用頻度分析**: 実際の利用パターンと料金の比較
- **無駄率可視化**: 年間浪費額と節約可能額の算出
- **アラート機能**: 高い無駄率や未使用サービスの通知
- **節約提案**: 具体的な見直し提案と代替案表示

### 💾 データ・プライバシー

- **完全ローカル保存**: 個人データはデバイス内でのみ保存
- **履歴管理**: 過去の診断結果の比較・追跡機能
- **データエクスポート**: 診断結果のシェアと保存
- **プライバシー保護**: 外部サーバーへのデータ送信なし

### 📱 PWA技術による利便性

- **オフライン対応**: ネットワーク接続なしでも完全利用可能
- **アプリ体験**: ホーム画面インストールでネイティブアプリ並み
- **高速表示**: 多層キャッシング戦略による瞬間的ロード
- **自動更新**: バックグラウンドでの自動アップデート

## 🚀 クイックスタート

### 前提条件

- Node.js 18+
- npm または yarn

### インストールと起動

```bash
# リポジトリをクローン
git clone https://github.com/glkt3912/subcheck.git
cd subcheck

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて確認してください。

### PWA機能の有効化

PWA機能は本番環境でのみ有効です：

```bash
# プロダクションビルド
npm run build

# プロダクションサーバー起動
npm start
```

## 🏗️ 技術スタック

- **フロントエンド**: Next.js 14 (App Router), React 18, TypeScript
- **PWA**: Service Worker, Web App Manifest, Cache API
- **スタイリング**: Tailwind CSS, shadcn/ui
- **データ可視化**: Chart.js/Recharts
- **テスト**: Vitest, React Testing Library
- **品質管理**: ESLint, TypeScript strict mode

## 📚 アーキテクチャ

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   UI Layer      │    │  Business Logic │    │   Data Layer    │
│                 │    │                 │    │                 │
│ • Next.js Pages │    │ • Custom Hooks  │    │ • LocalStorage  │
│ • React Components│  │ • Service Classes│   │ • IndexedDB     │
│ • PWA Components│    │ • Calculations  │    │ • Cache API     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Service Worker │
                    │                 │
                    │ • Caching       │
                    │ • Offline Sync  │
                    │ • Background    │
                    └─────────────────┘
```

## 🧪 開発コマンド

```bash
# 開発サーバー
npm run dev

# テスト実行
npm test

# リント実行
npm run lint

# プロダクションビルド
npm run build

# ビルド開始
npm start
```

## 📱 PWA インストール方法

### Android / Chrome

1. アプリにアクセス
2. 自動表示されるインストールバナーをクリック
3. 「インストール」を選択

### iOS Safari

1. アプリにアクセス
2. 画面下部の共有ボタンをタップ
3. 「ホーム画面に追加」を選択
4. 「追加」をタップして完了

## 📄 ドキュメント

- [アーキテクチャ設計](docs/public/PWA_ARCHITECTURE.md)
- [実装ガイド](docs/public/PWA_IMPLEMENTATION_GUIDE.md)

## ⚖️ ライセンス

このプロジェクトは **Business Source License 1.1** の下でライセンスされています。

### 重要な制限事項

- **商用サブスクリプション管理サービス**としての使用は禁止
- 内部利用、研究、教育目的での使用は許可
- **2029年1月1日**以降は自動的に Apache License 2.0 に変更

詳細は [LICENSE](LICENSE) ファイルをご覧ください。

## 📞 サポート

- **バグ報告**: [GitHub Issues](https://github.com/glkt3912/subcheck/issues)
- **機能要望**: [GitHub Discussions](https://github.com/glkt3912/subcheck/discussions)
