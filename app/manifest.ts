import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SubCheck - サブスク使ってる？診断',
    short_name: 'SubCheck',
    description: 'サブスクリプションの無駄率診断PWA',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2563eb',
    orientation: 'portrait-primary',
    scope: '/',
    lang: 'ja',
    categories: ['finance', 'lifestyle', 'productivity'],
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512', 
        type: 'image/png',
        purpose: 'any'
      }
    ],
    shortcuts: [
      {
        name: '新しい診断',
        description: 'サブスク無駄率の診断を開始',
        url: '/diagnosis/select',
        icons: [
          {
            src: '/icons/shortcut-diagnosis.png',
            sizes: '96x96',
            type: 'image/png'
          }
        ]
      },
      {
        name: '過去の診断結果',
        description: '過去の診断結果を確認',
        url: '/diagnosis/results',
        icons: [
          {
            src: '/icons/shortcut-results.png', 
            sizes: '96x96',
            type: 'image/png'
          }
        ]
      },
      {
        name: '設定',
        description: 'アプリの設定を変更',
        url: '/settings',
        icons: [
          {
            src: '/icons/shortcut-settings.png',
            sizes: '96x96', 
            type: 'image/png'
          }
        ]
      }
    ],
    screenshots: [
      {
        src: '/screenshots/mobile-home.png',
        sizes: '375x812',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'ホーム画面'
      },
      {
        src: '/screenshots/mobile-diagnosis.png', 
        sizes: '375x812',
        type: 'image/png',
        form_factor: 'narrow',
        label: '診断画面'
      },
      {
        src: '/screenshots/desktop-dashboard.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide', 
        label: 'ダッシュボード'
      }
    ]
  }
}