# SubCheck PWA - サブスク診断アプリ

![Next.js](https://img.shields.io/badge/Next.js-14+-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![PWA Ready](https://img.shields.io/badge/PWA-Ready-green)
![License](https://img.shields.io/badge/License-BSL--1.1-orange)

SubCheckは、あなたのサブスクリプション利用状況を診断し、年間の無駄遣いを可視化するProgressive Web Application (PWA)です。

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
