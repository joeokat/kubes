import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_BLOG_POSTS,
  calculateReadTime,
  generateExcerpt,
  canAccessBlogPost,
} from "../blog.ts";
import type { BlogPost } from "../blog.ts";

describe("Blog & Market Insights Engine", () => {
  describe("Read Time Calculation", () => {
    it("returns 1 minute minimum for short or empty text", () => {
      assert.strictEqual(calculateReadTime(""), 1);
      assert.strictEqual(calculateReadTime("Quick market update."), 1);
    });

    it("calculates accurate reading minutes based on 200 wpm standard", () => {
      const words250 = new Array(250).fill("word").join(" ");
      assert.strictEqual(calculateReadTime(words250), 2);

      const words550 = new Array(550).fill("investing").join(" ");
      assert.strictEqual(calculateReadTime(words550), 3);

      const words1000 = new Array(1000).fill("market").join(" ");
      assert.strictEqual(calculateReadTime(words1000), 5);
    });
  });

  describe("Excerpt Generation", () => {
    it("preserves short text within length boundary", () => {
      const shortText = "A concise observation about interest rates.";
      assert.strictEqual(generateExcerpt(shortText, 100), shortText);
    });

    it("truncates long text and appends ellipsis", () => {
      const longText =
        "Compounding returns require patience, emotional control, and disciplined continuous saving regardless of short-term volatility in equity markets.";
      const excerpt = generateExcerpt(longText, 50);
      assert(excerpt.length <= 54); // 50 chars + "..."
      assert(excerpt.endsWith("..."));
    });

    it("strips markdown characters from excerpts", () => {
      const markdownText = "### **Title** with `code` and _emphasis_ words.";
      const excerpt = generateExcerpt(markdownText, 100);
      assert(!excerpt.includes("#"));
      assert(!excerpt.includes("*"));
      assert(!excerpt.includes("`"));
      assert(!excerpt.includes("_"));
    });
  });

  describe("Premium Access Gating", () => {
    const freePost: BlogPost = {
      id: "free-1",
      title: "Free Article",
      slug: "free-article",
      body: "Content",
      published_at: "2026-10-01",
      author: "Editor",
      is_premium: false,
    };

    const premiumPost: BlogPost = {
      id: "prem-1",
      title: "Premium Article",
      slug: "premium-article",
      body: "Exclusive Content",
      published_at: "2026-10-01",
      author: "Editor",
      is_premium: true,
    };

    it("allows any user to access non-premium blog posts", () => {
      assert.strictEqual(canAccessBlogPost(freePost, false), true);
      assert.strictEqual(canAccessBlogPost(freePost, true), true);
    });

    it("strictly blocks non-premium users from premium articles", () => {
      assert.strictEqual(canAccessBlogPost(premiumPost, false), false);
    });

    it("unblocks premium articles for users with premium status", () => {
      assert.strictEqual(canAccessBlogPost(premiumPost, true), true);
    });
  });

  describe("Curated Founder Articles & Non-Advisory Compliance", () => {
    it("contains both free preview and premium gated posts", () => {
      assert(DEFAULT_BLOG_POSTS.length >= 3, "Must have multiple curated articles");
      const freePosts = DEFAULT_BLOG_POSTS.filter((p) => !p.is_premium);
      const premiumPosts = DEFAULT_BLOG_POSTS.filter((p) => p.is_premium);

      assert(freePosts.length >= 1, "Must offer at least one free educational article");
      assert(premiumPosts.length >= 2, "Must offer premium articles for subscribers");
    });

    it("verifies articles strictly follow educational guidelines without stock tips", () => {
      for (const post of DEFAULT_BLOG_POSTS) {
        assert(post.title.length > 5, "Title must be meaningful");
        assert(post.slug.length > 5, "Slug must be valid");
        assert(post.body.length > 100, "Body must be substantive");

        // SOP §7 non-advisory compliance check
        const text = (post.title + " " + post.body).toLowerCase();
        assert(!text.includes("recommend "), "Must never recommend specific actions");
        assert(!text.includes("buy this"), "Must never advise buying a specific instrument");
        assert(!text.includes("sell this"), "Must never advise selling a specific instrument");
        assert(!text.includes("guaranteed return"), "Must never promise outcomes");
      }
    });
  });
});
