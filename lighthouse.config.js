/**
 * Lighthouse CI Configuration for SubCheck PWA
 * 
 * This configuration defines PWA quality standards and performance thresholds
 * for automated quality assurance in CI/CD pipeline.
 */

module.exports = {
  ci: {
    // 収集設定
    collect: {
      // テスト対象URL（CI環境に合わせて調整）
      url: [
        'http://localhost:3000',
        'http://localhost:3000/diagnosis/select',
        'http://localhost:3000/offline',
        'http://localhost:3000/settings'
      ],
      // Chrome起動オプション
      chromeFlags: [
        '--headless',
        '--no-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-setuid-sandbox',
        '--no-first-run'
      ],
      // 実行回数（安定した結果を得るため）
      numberOfRuns: 3
    },
    
    // アサーション（品質基準）
    assert: {
      // PWA基準
      assertions: {
        // PWAカテゴリ（最重要）
        'categories:pwa': ['error', { minScore: 0.9 }],
        
        // パフォーマンス
        'categories:performance': ['warn', { minScore: 0.7 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 3000 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        
        // アクセシビリティ
        'categories:accessibility': ['error', { minScore: 0.9 }],
        
        // ベストプラクティス
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        
        // SEO（基本的な要件）
        'categories:seo': ['warn', { minScore: 0.8 }],
        
        // PWA固有の重要指標
        'is-on-https': 'error',
        'service-worker': 'error',
        'works-offline': 'error',
        'viewport': 'error',
        'without-javascript': 'off', // SPAのため無効化
        
        // マニフェスト関連
        'installable-manifest': 'error',
        'apple-touch-icon': 'error',
        'maskable-icon': 'warn',
        
        // オフライン機能
        'offline-start-url': 'error',
        
        // セキュリティ
        'is-crawlable': 'warn',
        'robots-txt': 'off', // PWAでは必須ではない
        
        // パフォーマンス（詳細）
        'unused-javascript': ['warn', { maxLength: 3 }],
        'render-blocking-resources': ['warn', { maxLength: 2 }],
        'total-blocking-time': ['warn', { maxNumericValue: 600 }],
        
        // ネットワーク効率
        'uses-optimized-images': 'warn',
        'uses-webp-images': 'warn',
        'efficient-animated-content': 'warn',
        
        // キャッシュ戦略
        'uses-long-cache-ttl': 'warn',
        'uses-rel-preconnect': 'off' // PWAでは必須ではない
      }
    },
    
    // アップロード設定
    upload: {
      // GitHub Actionsの場合の設定例
      target: 'temporary-public-storage',
      // 本格運用では専用のストレージを設定
      // target: 'lhci',
      // serverBaseUrl: 'https://your-lhci-server.com'
    },
    
    // サーバー設定（オプション）
    server: {
      // 開発時のローカルサーバー設定
      port: 9001,
      storage: {
        storageMethod: 'sql',
        sqlDialect: 'sqlite',
        sqlDatabasePath: './lhci.db'
      }
    }
  },
  
  // PWA特化設定
  pwa: {
    // 必須要件
    required: [
      'is-on-https',
      'service-worker',
      'works-offline',
      'installable-manifest'
    ],
    
    // 推奨要件
    recommended: [
      'apple-touch-icon',
      'maskable-icon',
      'offline-start-url'
    ],
    
    // オフライン機能テスト
    offline: {
      // オフライン状態でテストするURL
      testUrls: [
        '/',
        '/diagnosis/select',
        '/offline'
      ],
      
      // オフライン時の期待する動作
      expectations: {
        // ページが読み込まれること
        pageLoads: true,
        // 基本機能が動作すること  
        basicFunctionality: true,
        // ユーザーフレンドリーなオフライン表示
        userFriendlyOffline: true
      }
    }
  },
  
  // 環境別設定
  environments: {
    development: {
      collect: {
        url: ['http://localhost:3000'],
        numberOfRuns: 1
      },
      assert: {
        // 開発環境では基準を緩める
        assertions: {
          'categories:pwa': ['warn', { minScore: 0.8 }],
          'categories:performance': ['warn', { minScore: 0.6 }]
        }
      }
    },
    
    staging: {
      collect: {
        url: ['https://staging.subcheck.app'],
        numberOfRuns: 2
      }
    },
    
    production: {
      collect: {
        url: ['https://subcheck.app'],
        numberOfRuns: 3
      },
      assert: {
        // 本番環境では最高基準
        assertions: {
          'categories:pwa': ['error', { minScore: 0.95 }],
          'categories:performance': ['error', { minScore: 0.8 }],
          'categories:accessibility': ['error', { minScore: 0.95 }]
        }
      }
    }
  },
  
  // カスタムコマンド
  scripts: {
    // PWA品質チェック専用コマンド
    'pwa-check': 'lhci collect --url=http://localhost:3000 --numberOfRuns=1',
    
    // パフォーマンスチェック専用
    'perf-check': 'lighthouse http://localhost:3000 --only-categories=performance --view',
    
    // 全体チェック
    'full-check': 'lhci autorun'
  }
};