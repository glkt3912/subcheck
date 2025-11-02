'use client';

import { useEffect } from 'react';
import BrowserCompatWarning from './BrowserCompatWarning';
import { useBrowserCompat } from '@/lib/hooks/useBrowserCompat';

interface CompatibilityWrapperProps {
  children: React.ReactNode;
}

export default function CompatibilityWrapper({ children }: CompatibilityWrapperProps) {
  const { isCompatible, warnings } = useBrowserCompat();

  // Add CSS classes to body for compatibility-based styling
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const body = document.body;
      
      if (!isCompatible) {
        body.classList.add('browser-incompatible');
      } else {
        body.classList.remove('browser-incompatible');
      }

      if (warnings.length > 0) {
        body.classList.add('browser-warnings');
      } else {
        body.classList.remove('browser-warnings');
      }
    }
  }, [isCompatible, warnings]);

  return (
    <>
      <BrowserCompatWarning />
      {children}
    </>
  );
}