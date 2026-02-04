---
title: Dev Log
tags: ['blog','test']
date: 2024-01-01
---

## Goals:
- Building a personal site using 11ty
- Minimun bugs & brutal force
<!-- readmore -->
## Problems encountered 
### Deploy
#### 1. No 'pathPrefix' in .js
This will bomb all pathes in Github pages.
And you have to use {{ '/.../' | url }} in njks, [I think there are more solutions in this issue ](https://github.com/11ty/eleventy/issues/648), however, this doesn't work in non-njk files. An alternative way is using relative path: '../assets/...'