---
name: fetch-tweet
description: Use when the user shares an X.com or Twitter link and wants the content. Triggers on "fetch tweet", "x.com link", or any x.com/twitter.com URL.
user-invocable: true
argument-hint: <tweet-url-or-id>
allowed-tools: Bash(twitter *)
---

# Fetch Tweet

<instructions>
Extract content from $ARGUMENTS. Parse tweet ID from `x.com/*/status/<ID>` or `twitter.com/*/status/<ID>`.

```bash
twitter tweet <ID> --full-text --yaml    # Full tweet with replies
twitter tweet <ID> --full-text --compact  # LLM-friendly
twitter user <handle>                     # Profile
twitter user-posts <handle> --max 20     # User posts
twitter search "query" --max 20 --compact # Search
```
</instructions>

## Gotchas
- Parse the tweet ID from the URL — don't pass the full URL to twitter CLI
- `--compact` flag may not exist in all versions — fall back to `--yaml`
- For thread replies, use `--full-text` to get the complete conversation
