import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
    canAccessLesson,
    getAllLessons,
    getLessonBySlug,
    gradeQuiz,
    INVESTING_101_LESSONS,
    isLessonUnlocked,
} from "../curriculum.ts";

describe("Investing 101 Curriculum Structure", () => {
  test("curriculum contains exactly 7 lessons", () => {
    const lessons = getAllLessons();
    assert.equal(lessons.length, 7);
  });

  test("lessons have consecutive order_index from 1 to 7", () => {
    const lessons = getAllLessons();
    lessons.forEach((lesson, idx) => {
      assert.equal(lesson.order_index, idx + 1);
    });
  });

  test("Lesson 1 is free; Lessons 2 through 7 cost GH₵0.50", () => {
    const lessons = getAllLessons();
    assert.equal(lessons[0].is_free, true);
    assert.equal(lessons[0].price_ghs, 0.0);

    for (let i = 1; i < lessons.length; i++) {
      assert.equal(lessons[i].is_free, false);
      assert.equal(lessons[i].price_ghs, 0.5);
    }
  });

  test("every lesson ends with exactly 3 quiz questions", () => {
    const lessons = getAllLessons();
    lessons.forEach((lesson) => {
      assert.equal(
        lesson.quiz.length,
        3,
        `Lesson ${lesson.slug} should have 3 quiz questions`,
      );
    });
  });

  test("GSE and US market lessons contain Ghana-specific callouts per SOP §2", () => {
    const gseLesson = getLessonBySlug("ghana-stock-exchange");
    assert.ok(gseLesson);
    assert.equal(gseLesson.callout?.isGhanaSpecific, true);

    const usLesson = getLessonBySlug("us-stock-markets");
    assert.ok(usLesson);
    assert.equal(usLesson.callout?.isGhanaSpecific, true);

    const introLesson = getLessonBySlug("intro-to-investing");
    assert.ok(introLesson);
    assert.equal(introLesson.callout?.isGhanaSpecific ?? false, false);
  });
});

describe("Quiz Grading Arithmetic", () => {
  const lesson = INVESTING_101_LESSONS[0];

  test("grades 3 out of 3 correct as 100% and passed", () => {
    const perfectAnswers = {
      [lesson.quiz[0].id]: lesson.quiz[0].correctOptionId,
      [lesson.quiz[1].id]: lesson.quiz[1].correctOptionId,
      [lesson.quiz[2].id]: lesson.quiz[2].correctOptionId,
    };
    const result = gradeQuiz(lesson, perfectAnswers);
    assert.equal(result.score, 3);
    assert.equal(result.totalQuestions, 3);
    assert.equal(result.percentage, 100);
    assert.equal(result.passed, true);
  });

  test("grades 2 out of 3 correct as passing threshold (67%)", () => {
    const passingAnswers = {
      [lesson.quiz[0].id]: lesson.quiz[0].correctOptionId,
      [lesson.quiz[1].id]: lesson.quiz[1].correctOptionId,
      [lesson.quiz[2].id]: 9999, // wrong answer
    };
    const result = gradeQuiz(lesson, passingAnswers);
    assert.equal(result.score, 2);
    assert.equal(result.percentage, 67);
    assert.equal(result.passed, true);
  });

  test("grades 1 out of 3 correct as failing (33%)", () => {
    const failingAnswers = {
      [lesson.quiz[0].id]: lesson.quiz[0].correctOptionId,
      [lesson.quiz[1].id]: 9999,
      [lesson.quiz[2].id]: 9999,
    };
    const result = gradeQuiz(lesson, failingAnswers);
    assert.equal(result.score, 1);
    assert.equal(result.percentage, 33);
    assert.equal(result.passed, false);
  });

  test("handles empty answers without throwing errors", () => {
    const result = gradeQuiz(lesson, {});
    assert.equal(result.score, 0);
    assert.equal(result.percentage, 0);
    assert.equal(result.passed, false);
  });
});

describe("Lesson Unlock & Gating Logic", () => {
  const lesson1 = INVESTING_101_LESSONS[0]; // Free
  const lesson2 = INVESTING_101_LESSONS[1]; // Paid

  test("free lesson is always unlocked regardless of premium or purchase status", () => {
    assert.equal(isLessonUnlocked(lesson1, false, []), true);
    assert.equal(isLessonUnlocked(lesson1, true, []), true);
  });

  test("paid lesson unlocks with premium status", () => {
    assert.equal(isLessonUnlocked(lesson2, false, []), false);
    assert.equal(isLessonUnlocked(lesson2, true, []), true);
  });

  test("paid lesson unlocks when specific lesson ID is purchased", () => {
    assert.equal(isLessonUnlocked(lesson2, false, [lesson2.id]), true);
    assert.equal(isLessonUnlocked(lesson2, false, ["other-id"]), false);
  });

  test("canAccessLesson enforces prerequisite lesson completion", () => {
    // Lesson 1 is always accessible
    assert.equal(canAccessLesson(1, []), true);

    // Lesson 2 requires Lesson 1 to be completed
    assert.equal(canAccessLesson(2, []), false);
    assert.equal(canAccessLesson(2, [lesson1.id]), true);

    // Lesson 3 requires Lesson 2 to be completed
    assert.equal(canAccessLesson(3, [lesson1.id]), false);
    assert.equal(canAccessLesson(3, [lesson1.id, lesson2.id]), true);
  });
});
