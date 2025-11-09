/**
 * SubCheck PWA License Notice
 *
 * Copyright (c) 2025 SubCheck Development Team
 * Licensed under the Business Source License 1.1
 *
 * COMMERCIAL USE RESTRICTION:
 * This software may not be used to provide a Subscription Management Service
 * to third parties without a commercial license.
 *
 * For licensing inquiries: licensing@subcheck.app
 * Full license: https://subcheck.app/license
 */

export const LICENSE_INFO = {
  name: "Business Source License 1.1",
  shortName: "BSL-1.1",
  url: "https://mariadb.com/bsl11/",

  restrictions: {
    commercialUse: "Subscription Management Service provision prohibited",
    changeDate: "2029-01-01",
    changeLicense: "Apache License 2.0",
  },

  contact: {
    licensing: "licensing@subcheck.app",
    website: "https://subcheck.app/licensing",
    legal: "legal@subcheck.app",
  },

  notice: `
SubCheck PWA is licensed under the Business Source License 1.1.
Commercial use as a Subscription Management Service is prohibited.
This software will become Apache 2.0 licensed on January 1, 2029.
For commercial licensing: licensing@subcheck.app
  `.trim(),
} as const;

/**
 * Display license notice in development console
 */
export function displayLicenseNotice(): void {
  if (typeof console !== "undefined") {
    console.log(
      `
%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
%c                            🔒 LICENSE NOTICE                            
%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

%c   SubCheck PWA - Business Source License 1.1   
%c   Copyright (c) 2025 SubCheck Development Team

%c   ⚠️  COMMERCIAL USE RESTRICTION:
%c   This software may NOT be used to provide a Subscription Management
%c   Service to third parties without a commercial license.

%c   📅 This software will become Apache 2.0 licensed on Jan 1, 2029

%c   📧 Commercial licensing: licensing@subcheck.app
%c   🌐 Full license: https://subcheck.app/license

%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `,
      "color: #2563eb; font-weight: bold;", // 上線
      "color: #dc2626; font-size: 16px; font-weight: bold;", // タイトル
      "color: #2563eb; font-weight: bold;", // 下線
      "color: #1f2937; font-size: 14px; font-weight: bold;", // ソフト名
      "color: #6b7280; font-size: 12px;", // 著作権
      "color: #dc2626; font-size: 13px; font-weight: bold;", // 制限ラベル
      "color: #7c2d12; font-size: 12px;", // 制限内容1
      "color: #7c2d12; font-size: 12px;", // 制限内容2
      "color: #059669; font-size: 12px;", // 期限情報
      "color: #2563eb; font-size: 12px;", // 連絡先1
      "color: #2563eb; font-size: 12px;", // 連絡先2
      "color: #2563eb; font-weight: bold;" // 最終線
    );
  }
}

/**
 * Check if current usage complies with license
 */
export function checkLicenseCompliance(): boolean {
  // In a real implementation, this would check various conditions
  // For now, we assume compliance unless explicitly configured otherwise

  const isCommercialService =
    process.env.NEXT_PUBLIC_COMMERCIAL_SERVICE === "true";
  const hasCommercialLicense =
    process.env.NEXT_PUBLIC_COMMERCIAL_LICENSE === "true";

  if (isCommercialService && !hasCommercialLicense) {
    console.error(
      "🚨 LICENSE VIOLATION: Commercial Subscription Management Service usage requires a commercial license."
    );
    return false;
  }

  return true;
}

/**
 * Get license status for display
 */
export function getLicenseStatus() {
  const isCompliant = checkLicenseCompliance();
  const changeDate = new Date("2029-01-01");
  const isAfterChangeDate = new Date() > changeDate;

  return {
    isCompliant,
    currentLicense: isAfterChangeDate
      ? "Apache License 2.0"
      : "Business Source License 1.1",
    changeDate: changeDate.toDateString(),
    daysUntilChange: Math.ceil(
      (changeDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    ),
    restrictions: isAfterChangeDate
      ? "None"
      : "No Subscription Management Service",
  };
}
