import 'vitest-localstorage-mock'
import '@testing-library/jest-dom'

// Mock window.location for social sharing tests
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000'
  },
  writable: true
})