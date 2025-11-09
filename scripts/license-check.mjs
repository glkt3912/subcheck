#!/usr/bin/env node

/**
 * SubCheck License Compliance Checker
 *
 * このスクリプトはBusiness Source License 1.1 (BSL-1.1) のコンプライアンス
 * および商用利用制限の検証を自動化します。
 *
 * 実行方法：
 * npm run license-check
 * または
 * node scripts/license-check.js
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

class LicenseChecker {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.info = [];
    this.projectRoot = process.cwd();
  }

  /**
   * ライセンスチェックのメイン実行関数
   */
  async run() {
    console.log("🔍 SubCheck License Compliance Check");
    console.log("=====================================\n");

    try {
      this.checkBSLLicenseFiles();
      this.checkPackageJsonLicense();
      this.checkLicenseEnforcementCode();
      await this.checkDependencyLicenses();
      this.checkCommercialUsageFlags();
      this.validateLicenseNotices();

      this.printResults();

      if (this.errors.length > 0) {
        process.exit(1);
      }

      console.log("✅ All license compliance checks passed!\n");
    } catch (error) {
      console.error("❌ License check failed:", error.message);
      process.exit(1);
    }
  }

  /**
   * BSL-1.1関連ファイルの存在確認
   */
  checkBSLLicenseFiles() {
    console.log("📋 Checking BSL-1.1 license files...");

    // LICENSE ファイルの確認
    const licensePath = path.join(this.projectRoot, "LICENSE");
    if (!fs.existsSync(licensePath)) {
      this.errors.push("LICENSE file not found");
    } else {
      const licenseContent = fs.readFileSync(licensePath, "utf8");

      // BSL-1.1 キーワードの確認
      if (!licenseContent.includes("Business Source License 1.1")) {
        this.errors.push("LICENSE file does not contain BSL-1.1 text");
      } else {
        this.info.push("✓ LICENSE file contains valid BSL-1.1 content");
      }

      // 重要な条項の確認
      const requiredTerms = [
        "Subscription Management Service",
        "Change Date:          January 1, 2029",
        "Change License:       Apache License, Version 2.0",
      ];

      requiredTerms.forEach((term) => {
        if (!licenseContent.includes(term)) {
          this.errors.push(`LICENSE file missing required term: ${term}`);
        }
      });
    }

    // NOTICE ファイルの確認
    const noticePath = path.join(this.projectRoot, "NOTICE");
    if (!fs.existsSync(noticePath)) {
      this.errors.push("NOTICE file not found");
    } else {
      const noticeContent = fs.readFileSync(noticePath, "utf8");

      if (!noticeContent.includes("Business Source License 1.1")) {
        this.warnings.push("NOTICE file should reference BSL-1.1");
      } else {
        this.info.push("✓ NOTICE file contains BSL-1.1 reference");
      }

      // 商用利用制限の記載確認
      if (!noticeContent.includes("Subscription Management Service")) {
        this.warnings.push(
          "NOTICE file should mention commercial usage restrictions"
        );
      }
    }

    console.log();
  }

  /**
   * package.json のライセンス設定確認
   */
  checkPackageJsonLicense() {
    console.log("📦 Checking package.json license configuration...");

    const packagePath = path.join(this.projectRoot, "package.json");
    if (!fs.existsSync(packagePath)) {
      this.errors.push("package.json not found");
      return;
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));

      // ライセンスフィールドの確認
      if (packageJson.license !== "BSL-1.1") {
        this.errors.push(
          `Invalid license in package.json: ${packageJson.license} (expected: BSL-1.1)`
        );
      } else {
        this.info.push(
          "✓ package.json license field is correctly set to BSL-1.1"
        );
      }

      // 追加メタデータの確認
      if (!packageJson.repository || !packageJson.repository.url) {
        this.warnings.push("package.json missing repository URL");
      }

      if (!packageJson.author) {
        this.warnings.push("package.json missing author information");
      }

      if (!packageJson.description) {
        this.warnings.push("package.json missing description");
      }

      // プライベートパッケージの確認
      if (packageJson.private !== true) {
        this.warnings.push(
          'Consider setting "private": true to prevent accidental publishing'
        );
      }
    } catch (err) {
      this.errors.push(`Failed to parse package.json: ${err.message}`);
    }

    console.log();
  }

  /**
   * ライセンス執行コードの確認
   */
  checkLicenseEnforcementCode() {
    console.log("⚖️  Checking license enforcement implementation...");

    const licenseNoticePath = path.join(
      this.projectRoot,
      "src/utils/licenseNotice.ts"
    );
    if (!fs.existsSync(licenseNoticePath)) {
      this.errors.push(
        "License enforcement module (src/utils/licenseNotice.ts) not found"
      );
      return;
    }

    try {
      const licenseNoticeContent = fs.readFileSync(licenseNoticePath, "utf8");

      // 重要な関数の存在確認
      const requiredFunctions = [
        "checkLicenseCompliance",
        "displayLicenseNotice",
        "validateCommercialUsage",
      ];

      requiredFunctions.forEach((funcName) => {
        if (!licenseNoticeContent.includes(funcName)) {
          this.errors.push(`License enforcement function missing: ${funcName}`);
        } else {
          this.info.push(`✓ License enforcement function found: ${funcName}`);
        }
      });

      // 環境変数チェックの確認
      if (!licenseNoticeContent.includes("NEXT_PUBLIC_COMMERCIAL_SERVICE")) {
        this.warnings.push(
          "License enforcement should check NEXT_PUBLIC_COMMERCIAL_SERVICE"
        );
      }

      if (!licenseNoticeContent.includes("NEXT_PUBLIC_COMMERCIAL_LICENSE")) {
        this.warnings.push(
          "License enforcement should check NEXT_PUBLIC_COMMERCIAL_LICENSE"
        );
      }
    } catch (err) {
      this.errors.push(
        `Failed to read license enforcement module: ${err.message}`
      );
    }

    console.log();
  }

  /**
   * 依存関係ライセンスの確認
   */
  async checkDependencyLicenses() {
    console.log("🔗 Checking dependency licenses...");

    try {
      // license-checker がインストールされているか確認
      try {
        execSync("which license-checker", { stdio: "ignore" });
      } catch {
        console.log("Installing license-checker...");
        execSync("npm install -g license-checker", { stdio: "inherit" });
      }

      // ライセンス情報の取得
      const licenseOutput = execSync("license-checker --json", {
        encoding: "utf8",
        cwd: this.projectRoot,
      });

      const licenses = JSON.parse(licenseOutput);

      // 禁止ライセンスのリスト
      const forbiddenLicenses = [
        "GPL-2.0",
        "GPL-3.0",
        "AGPL-1.0",
        "AGPL-3.0",
        "LGPL-2.1",
        "LGPL-3.0",
        "SSPL",
        "Commons Clause",
      ];

      // 問題のあるライセンスの検出
      const violations = [];
      const allowedExceptions = [
        '@img/sharp-libvips', // Image processing library - LGPL exception
        'sharp' // LGPL allowed for development tools
      ];
      
      Object.entries(licenses).forEach(([packageName, info]) => {
        const packageLicense = info.licenses;
        
        // 許可された例外パッケージをスキップ
        const isAllowedException = allowedExceptions.some(exception => 
          packageName.includes(exception)
        );
        
        if (isAllowedException) {
          return; // このパッケージは例外として許可
        }

        if (typeof packageLicense === "string") {
          forbiddenLicenses.forEach((forbidden) => {
            if (packageLicense.includes(forbidden)) {
              violations.push(`${packageName}: ${packageLicense}`);
            }
          });
        }
      });

      if (violations.length > 0) {
        this.errors.push("Forbidden licenses detected in dependencies:");
        violations.forEach((violation) => {
          this.errors.push(`  - ${violation}`);
        });
      } else {
        this.info.push("✓ No forbidden licenses found in dependencies");
      }

      // 統計情報
      const licenseCount = Object.keys(licenses).length;
      this.info.push(`Analyzed ${licenseCount} dependencies`);
    } catch (err) {
      this.warnings.push(`Dependency license check failed: ${err.message}`);
    }

    console.log();
  }

  /**
   * 商用利用フラグの確認
   */
  checkCommercialUsageFlags() {
    console.log("💼 Checking commercial usage configuration...");

    const configFiles = [
      ".github/workflows/ci.yml",
      ".github/workflows/deploy.yml",
      ".github/workflows/pwa-quality.yml",
      "package.json",
    ];

    let commercialServiceFound = false;
    let commercialLicenseFound = false;

    configFiles.forEach((configFile) => {
      const filePath = path.join(this.projectRoot, configFile);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, "utf8");

        if (content.includes("NEXT_PUBLIC_COMMERCIAL_SERVICE.*true")) {
          commercialServiceFound = true;

          if (!content.includes("NEXT_PUBLIC_COMMERCIAL_LICENSE.*true")) {
            this.errors.push(
              `Commercial service enabled without commercial license in ${configFile}`
            );
          } else {
            commercialLicenseFound = true;
          }
        }
      }
    });

    if (commercialServiceFound && commercialLicenseFound) {
      this.warnings.push(
        "Commercial usage flags detected - ensure proper commercial license is obtained"
      );
    } else if (commercialServiceFound && !commercialLicenseFound) {
      this.errors.push(
        "Commercial service flag found without corresponding commercial license flag"
      );
    } else {
      this.info.push("✓ No unauthorized commercial usage flags detected");
    }

    console.log();
  }

  /**
   * ライセンス表示の検証
   */
  validateLicenseNotices() {
    console.log("📄 Validating license notices...");

    // アプリケーション内でのライセンス表示の確認
    const appFiles = ["app/layout.tsx", "app/page.tsx"];

    let licenseNoticeFound = false;

    appFiles.forEach((appFile) => {
      const filePath = path.join(this.projectRoot, appFile);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, "utf8");

        if (
          content.includes("licenseNotice") ||
          content.includes("LicenseNotice")
        ) {
          licenseNoticeFound = true;
        }
      }
    });

    if (licenseNoticeFound) {
      this.info.push("✓ License notice integration found in application");
    } else {
      this.warnings.push(
        "Consider adding license notice display to user interface"
      );
    }

    // README.md のライセンス情報確認
    const readmePath = path.join(this.projectRoot, "README.md");
    if (fs.existsSync(readmePath)) {
      const readmeContent = fs.readFileSync(readmePath, "utf8");

      if (
        readmeContent.includes("BSL-1.1") ||
        readmeContent.includes("Business Source License")
      ) {
        this.info.push("✓ README.md contains license information");
      } else {
        this.warnings.push("README.md should mention BSL-1.1 license");
      }
    }

    console.log();
  }

  /**
   * 結果の出力
   */
  printResults() {
    console.log("📊 License Compliance Check Results");
    console.log("===================================\n");

    if (this.info.length > 0) {
      console.log("✅ Information:");
      this.info.forEach((info) => console.log(`   ${info}`));
      console.log();
    }

    if (this.warnings.length > 0) {
      console.log("⚠️  Warnings:");
      this.warnings.forEach((warning) => console.log(`   ${warning}`));
      console.log();
    }

    if (this.errors.length > 0) {
      console.log("❌ Errors:");
      this.errors.forEach((error) => console.log(`   ${error}`));
      console.log();
    }

    console.log(
      `Summary: ${this.errors.length} errors, ${this.warnings.length} warnings`
    );
    console.log();
  }
}

// CLI実行
if (import.meta.url === `file://${process.argv[1]}`) {
  const checker = new LicenseChecker();
  checker.run().catch((err) => {
    console.error("License check failed:", err);
    process.exit(1);
  });
}

export default LicenseChecker;
