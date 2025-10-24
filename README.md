# HotCRP2HotCRP Utilities for Running a Shadow PC

Quick and dirty API client for running a shadow PC on a HotCRP conference:
- Bulk import papers into HotCRP from a HotCRP JSON + PDF export (`src/main.ts`)
- Export comments and reviewer assignments from a HotCRP conference (`src/getComments.ts`)
- Analyze participation in discussion (`src/pcCommentStats.ts`)
- Broken tools for analyzing bidding data (at time of writing, not supported by HotCRP API)