import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  WALKTHROUGH_STEPS,
  getNextStepIndex,
  getPrevStepIndex,
  isLastStep,
} from "../walkthrough.ts";

describe("Walkthrough Tour Logic", () => {
  test("should have exactly 4 guided steps per specification", () => {
    assert.equal(WALKTHROUGH_STEPS.length, 4);
    assert.equal(WALKTHROUGH_STEPS[0].step, 1);
    assert.equal(WALKTHROUGH_STEPS[1].step, 2);
    assert.equal(WALKTHROUGH_STEPS[2].step, 3);
    assert.equal(WALKTHROUGH_STEPS[3].step, 4);
  });

  test("should point to the correct core feature targets", () => {
    const targets = WALKTHROUGH_STEPS.map((s) => s.targetId);
    assert.deepEqual(targets, [
      "curriculum",
      "health_meter",
      "savings_challenge",
      "expense_tracker",
    ]);
  });

  test("getNextStepIndex advances correctly and respects bounds", () => {
    assert.equal(getNextStepIndex(0, 4), 1);
    assert.equal(getNextStepIndex(1, 4), 2);
    assert.equal(getNextStepIndex(2, 4), 3);
    assert.equal(getNextStepIndex(3, 4), 3); // Boundary check
  });

  test("getPrevStepIndex retreats correctly and respects zero floor", () => {
    assert.equal(getPrevStepIndex(3), 2);
    assert.equal(getPrevStepIndex(2), 1);
    assert.equal(getPrevStepIndex(1), 0);
    assert.equal(getPrevStepIndex(0), 0); // Floor check
  });

  test("isLastStep accurately identifies the terminal step", () => {
    assert.equal(isLastStep(0, 4), false);
    assert.equal(isLastStep(1, 4), false);
    assert.equal(isLastStep(2, 4), false);
    assert.equal(isLastStep(3, 4), true);
  });
});
