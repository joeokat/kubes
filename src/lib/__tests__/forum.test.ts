import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  validateForumReply,
  validateForumReportReason,
  validateForumThread,
} from "../forum.ts";

describe("Forum input validation", () => {
  it("accepts a valid thread and known category", () => {
    assert.equal(validateForumThread("Saving for emergencies", "Saving"), null);
  });

  it("rejects short titles and unknown categories", () => {
    assert.ok(validateForumThread("Hi", "Saving"));
    assert.ok(validateForumThread("A useful topic", "Other"));
  });

  it("validates replies and report reasons", () => {
    assert.equal(validateForumReply("Helpful context"), null);
    assert.ok(validateForumReply(" "));
    assert.equal(validateForumReportReason("This looks misleading"), null);
    assert.ok(validateForumReportReason("No"));
  });
});
