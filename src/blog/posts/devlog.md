---
title: 我的第一篇文章
tags: ['blog','test']
date: 2024-01-01
---

This solution works well, but I don't want to mark my excerpts manually. I feel pretty strongly that the content of the site should be kept as free as possible from technical implementation details. This feels like a good principle, and will also make the content as portable as possible.
<!-- readmore -->
Another limitation of this solution is that the excerpt generated will be extracted from the raw content, rather than the rendered page. I use Markdown for my posts, so the excerpts I get using the built-in functionality will be snippets of the unprocessed Markdown source. Stripping Markdown formatting from text is a lot trickier than e.g. stripping HTML, as there is no common formatting of control characters etc. I'm sure there are clever regular expressions out there that solves this, but I feel more confident stripping out HTML. Another common approach is to manually run the excerpt through the markdown-it processor used by Eleventy, but I always thought that felt a bit clunky and unnecessary. The page will be processed by markdown-it as part of the site rendering anyway, why do it again just to generate an excerpt?