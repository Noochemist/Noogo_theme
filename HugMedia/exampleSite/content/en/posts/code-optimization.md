---
title: "Code Optimization Demo & Reading Time"
description: "Demonstrates code blocks, syntax highlighting, and reading time"
date: 2026-11-16
published: 2026-11-16
tags: ["programming", "optimization", "python"]
categories: ["tutorial"]
---

# Code Optimization Demo & Reading Time

This page demonstrates **code blocks (syntax highlighting + language label + copy button)** and **reading time / word count** on a longer body. It also shows the common "before vs. after" optimization pattern.

## Scenario: summing optimization

A plain Python implementation is intuitive, but readability and edge-case handling can be improved.

**Before (naive loop):**

```python
def sum_before(n):
    total = 0
    for i in range(1, n + 1):
        total += i
    return total
```

**After (Gauss formula, O(1), with input guard):**

```python
def sum_after(n: int) -> int:
    """Return 1 + 2 + ... + n, O(1)."""
    if n < 0:
        raise ValueError("n must be non-negative")
    return n * (n + 1) // 2
```

Inline code such as `O(1)` and the function name `sum_after` will render in monospace.

## Notes

1. `sum_before` is a naive version for teaching;
2. `sum_after` solves it with a closed-form formula—a common **code-optimization** demo;
3. Both blocks should show a language label (`python`) and a copy button.

## A longer passage (placeholder for reading time / word count)

You may wonder why one post keeps both the naive and the optimized version. In engineering writing this is quite common: first give the most straightforward version so readers grasp the semantics, then give the performance-best version for real use. The reader will tally the word count and estimated reading time and show it at the top of the article. If the body is long enough, social-style card summaries (e.g., xhs, zhihu) will also clamp the excerpt to a limited number of lines.

Together with the headings, lists, table and the two code blocks above, this passage forms a multi-level page for testing reading-time/word-count and TOC generation. Every added third-level heading adds one more anchor in the table of contents, which can be highlighted on scroll.