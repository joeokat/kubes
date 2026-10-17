import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  POLICIES,
  getAllPolicies,
  getPolicyBySlug,
} from "../policies.ts";

describe("Public Policy Documents (PRD §6 & SOP §7)", () => {
  const REQUIRED_POLICY_SLUGS = [
    "terms",
    "privacy",
    "risk-disclaimer",
    "refund-policy",
    "community-guidelines",
  ];

  it("contains all 5 mandatory policy documents", () => {
    const policies = getAllPolicies();
    assert.equal(policies.length, 5);

    const slugs = policies.map((p) => p.slug);
    for (const requiredSlug of REQUIRED_POLICY_SLUGS) {
      assert.equal(slugs.includes(requiredSlug), true, `Missing required policy: ${requiredSlug}`);
    }
  });

  it("ensures each policy has comprehensive structure and sections", () => {
    const policies = getAllPolicies();
    for (const policy of policies) {
      assert.ok(policy.title.length > 3, `${policy.slug} title is too short`);
      assert.ok(policy.shortDescription.length > 10, `${policy.slug} short description is too short`);
      assert.ok(policy.lastUpdated.length > 4, `${policy.slug} missing lastUpdated`);
      assert.ok(policy.sections.length >= 3, `${policy.slug} has fewer than 3 sections`);

      for (const section of policy.sections) {
        assert.ok(section.heading.length > 2, `Section heading missing in ${policy.slug}`);
        assert.ok(section.content.length > 0, `Section content empty in ${policy.slug}`);
        for (const paragraph of section.content) {
          assert.ok(paragraph.trim().length > 10, `Paragraph too short in ${policy.slug}`);
        }
      }
    }
  });

  it("retrieves specific policies by slug and returns null for invalid slug", () => {
    const terms = getPolicyBySlug("terms");
    assert.ok(terms);
    assert.equal(terms?.title, "Terms of Service");

    const privacy = getPolicyBySlug("privacy");
    assert.ok(privacy);
    assert.equal(privacy?.title, "Privacy Policy");

    const risk = getPolicyBySlug("risk-disclaimer");
    assert.ok(risk);
    assert.equal(risk?.title, "Risk Disclaimer");

    const nonExistent = getPolicyBySlug("unknown-policy-slug");
    assert.equal(nonExistent, null);
  });

  it("strictly enforces non-advisory and risk warning compliance across all policies", () => {
    const allText = getAllPolicies()
      .flatMap((p) => [
        p.title,
        p.shortDescription,
        ...p.sections.flatMap((s) => [s.heading, ...s.content]),
      ])
      .join(" ")
      .toLowerCase();

    // Must explicitly declare educational scope & non-broker-dealer status
    assert.match(allText, /education/);
    assert.match(allText, /not a registered investment advisor/);
    assert.match(allText, /risk of loss/);

    // Must never give guarantees, buy/sell directives, or trading signals
    assert.doesNotMatch(allText, /guaranteed return/);
    assert.doesNotMatch(allText, /guaranteed profit/);
    assert.doesNotMatch(allText, /trading signal/);
  });
});
