# subcheck Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-10-30

## Active Technologies

- TypeScript 5.x with Next.js 14+ (existing project stack) + React 18+, Next.js App Router, Chart.js/Recharts (visualization), Tailwind CSS (styling) (001-subcheck-mvp)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5.x with Next.js 14+ (existing project stack): Follow standard conventions

## Recent Changes

- 001-subcheck-mvp: Added TypeScript 5.x with Next.js 14+ (existing project stack) + React 18+, Next.js App Router, Chart.js/Recharts (visualization), Tailwind CSS (styling)

<!-- MANUAL ADDITIONS START -->

# PR Technical Explanation Agent Instructions

When creating pull requests using `gh pr create`, automatically generate and post technical explanation comments in Japanese. Follow this workflow:

1. **Create PR with standard format**
2. **Immediately after PR creation, post technical explanation comment using `gh pr comment`**

## Technical Comment Format

Use this exact template for all PR technical explanations, written like a technical book chapter for developers unfamiliar with frontend technologies:

```
## 🔧 技術的な変更概要
[Brief technical summary with context about why these changes were needed]

## 📚 技術スタック解説
[Explain the frontend technologies used - Next.js App Router, React hooks, TypeScript patterns, etc. - in educational terms]

## 📝 主な変更点
[List key changes with file paths, line numbers, and explain the purpose of each change]

## 🏗️ アーキテクチャ・設計パターン
[Explain the architectural patterns, component design, state management approaches used]

## 🎯 影響範囲と依存関係
[Describe impact on different parts of the system and how components interact]

## ⚠️ 注意点・ベストプラクティス
[Important considerations, best practices followed, potential gotchas for developers]

## 🧪 テスト戦略
[Testing approach, what was tested and why, how to verify the changes]

## 📖 参考情報
[Links to documentation, patterns, or concepts that would help developers understand this implementation]
```

## Implementation Guidelines

- Write in educational Japanese, as if explaining to junior developers
- Include explanations of Next.js App Router concepts, React patterns, TypeScript usage
- Explain why certain approaches were chosen over alternatives
- Provide context about frontend architecture decisions
- Include references to official documentation when relevant
- Make it a learning resource that can be referenced later

<!-- MANUAL ADDITIONS END -->
