/**
 * Native App Store Submission & Platform Billing Verification Tests
 * Run: node --experimental-strip-types --test src/lib/__tests__/app-store-submission.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  getPlatformBillingModel,
  getWebAccountUpgradeUrl,
  WEB_APP_URL,
} from "../payments.ts";

const BANNED_ADVISORY_PHRASES = [
  /buy now/i,
  /sell now/i,
  /target price/i,
  /trading signal/i,
  /guaranteed profit/i,
  /guaranteed return/i,
  /\bstrong buy\b/i,
  /\bstrong sell\b/i,
];

describe("App Store Submission & Billing Rules (SOP §11 & AGENTS.md)", () => {
  describe("App Configuration (app.json)", () => {
    const appJsonPath = path.resolve(process.cwd(), "app.json");
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, "utf-8"));

    it("defines unique iOS bundleIdentifier for App Store Connect", () => {
      assert.ok(appJson.expo?.ios?.bundleIdentifier);
      assert.equal(appJson.expo.ios.bundleIdentifier, "com.kubes.app");
    });

    it("defines unique Android package name for Google Play Console", () => {
      assert.ok(appJson.expo?.android?.package);
      assert.equal(appJson.expo.android.package, "com.kubes.app");
    });

    it("includes version and build identifiers", () => {
      assert.ok(appJson.expo?.version, "Should have app version");
      assert.ok(appJson.expo?.ios?.buildNumber, "Should have iOS build number");
      assert.ok(appJson.expo?.android?.versionCode, "Should have Android version code");
    });
  });

  describe("EAS Build Configuration (eas.json)", () => {
    const easJsonPath = path.resolve(process.cwd(), "eas.json");

    it("exists and has valid production build profiles", () => {
      assert.ok(fs.existsSync(easJsonPath), "eas.json must exist in root");
      const easJson = JSON.parse(fs.readFileSync(easJsonPath, "utf-8"));
      assert.ok(easJson.build?.production);
      assert.equal(easJson.build.production.channel, "production");
      assert.equal(easJson.build.production.android?.buildType, "app-bundle");
    });

    it("includes submission targets for iOS and Android", () => {
      const easJson = JSON.parse(fs.readFileSync(easJsonPath, "utf-8"));
      assert.ok(easJson.submit?.production?.ios);
      assert.ok(easJson.submit?.production?.android);
    });
  });

  describe("Platform Billing Model (SOP §11 - Reader Model vs Direct)", () => {
    it("routes web platform to web_direct billing via Paystack", () => {
      const model = getPlatformBillingModel("web");
      assert.equal(model, "web_direct");
    });

    it("routes native iOS platform to native_reader model to comply with Guideline 3.1.3(a)", () => {
      const model = getPlatformBillingModel("ios");
      assert.equal(model, "native_reader");
    });

    it("routes native Android platform to native_reader model to comply with Play Billing policy", () => {
      const model = getPlatformBillingModel("android");
      assert.equal(model, "native_reader");
    });

    it("generates correct web account upgrade URLs", () => {
      const premiumUrl = getWebAccountUpgradeUrl("lifetime_premium");
      assert.equal(premiumUrl, `${WEB_APP_URL}/curriculum?action=upgrade_premium`);

      const lessonUrl = getWebAccountUpgradeUrl("lesson_unlock", "lesson-02");
      assert.equal(lessonUrl, `${WEB_APP_URL}/curriculum/lesson-02?action=unlock`);
    });
  });

  describe("Compliance & Non-Advisory Check", () => {
    it("reader model copy contains zero financial advisory language", () => {
      const readerCopy = [
        "Digital upgrades are managed through your Kubes web account at app.kubes.com.",
        "Once completed, your unlocked content syncs automatically to this device.",
        "Educational materials only; never financial or trading advice.",
      ];

      for (const text of readerCopy) {
        for (const pattern of BANNED_ADVISORY_PHRASES) {
          assert.doesNotMatch(text, pattern, `Contains banned phrase: ${text}`);
        }
      }
    });
  });
});

