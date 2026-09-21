import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
    ONBOARDING_STEPS,
    validateOnboardingSubmission,
    validateStepValue,
} from "../onboarding.ts";

describe("Onboarding Quiz Logic", () => {
  test("should have exactly 3 steps per specification", () => {
    assert.equal(ONBOARDING_STEPS.length, 3);
    assert.equal(ONBOARDING_STEPS[0].step, 1);
    assert.equal(ONBOARDING_STEPS[1].step, 2);
    assert.equal(ONBOARDING_STEPS[2].step, 3);
  });

  test("validateStepValue should return true for valid option IDs", () => {
    assert.equal(validateStepValue(1, "gse"), true);
    assert.equal(validateStepValue(1, "us_stocks"), true);
    assert.equal(validateStepValue(2, "beginner"), true);
    assert.equal(validateStepValue(3, "long_term_wealth"), true);
  });

  test("validateStepValue should return false for invalid or empty inputs", () => {
    assert.equal(validateStepValue(1, ""), false);
    assert.equal(validateStepValue(1, "non_existent"), false);
    assert.equal(validateStepValue(2, null as any), false);
    assert.equal(validateStepValue(3, undefined as any), false);
    assert.equal(validateStepValue(99, "gse"), false);
  });

  test("validateOnboardingSubmission rejects incomplete submissions", () => {
    const result = validateOnboardingSubmission({
      interest_area: "gse",
      // missing experience_level and goal
    });
    assert.equal(result.isValid, false);
    assert.ok(result.errors.experience_level);
    assert.ok(result.errors.goal);
  });

  test("validateOnboardingSubmission accepts complete and valid submissions", () => {
    const result = validateOnboardingSubmission({
      interest_area: "all",
      experience_level: "beginner",
      goal: "understand_markets",
    });
    assert.equal(result.isValid, true);
    assert.equal(Object.keys(result.errors).length, 0);
  });
});
