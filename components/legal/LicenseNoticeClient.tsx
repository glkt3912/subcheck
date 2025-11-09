'use client';

import { useEffect } from 'react';
import { displayLicenseNotice, checkLicenseCompliance } from '@/src/utils/licenseNotice';

export default function LicenseNoticeClient() {
  useEffect(() => {
    // Display license notice in development
    if (process.env.NODE_ENV === 'development') {
      displayLicenseNotice();
    }
    
    // Check license compliance
    const isCompliant = checkLicenseCompliance();
    if (!isCompliant) {
      // In production, you might want to disable functionality or redirect
      console.error('⚠️ License compliance check failed. Please contact licensing@subcheck.app');
    }
    
    // Add license info to global object for inspection
    if (typeof window !== 'undefined') {
      const licenseInfo = {
        name: 'Business Source License 1.1',
        version: '1.0.0',
        contact: 'licensing@subcheck.app',
        restrictions: 'No Subscription Management Service without commercial license',
        changeDate: '2029-01-01',
        changeLicense: 'Apache License 2.0'
      };
      
      // Use Object.defineProperty for type-safe global assignment
      Object.defineProperty(window, '__SUBCHECK_LICENSE__', {
        value: licenseInfo,
        writable: false,
        enumerable: true,
        configurable: false
      });
    }
  }, []);

  return null; // This component doesn't render anything visible
}