---
name: browse-url
description: Use when the user asks to browse a URL, open a page, take a screenshot, or scrape content. Triggers on "open this url", "visit page". NOT for setting up browser cookies (use setup-browser-cookies).
user-invocable: true
argument-hint: <url>
allowed-tools: Bash(agent-browser *)
---

# Browse URL

<instructions>
Open and extract content from $ARGUMENTS.

```bash
agent-browser open "$ARGUMENTS"      # Open URL
agent-browser wait --load networkidle # Wait for page
agent-browser snapshot                # Get a11y tree
agent-browser screenshot --full       # Screenshot
agent-browser close                   # Close when done
```

Advanced: `click @e2`, `fill @e3 "text"`, `scroll down 500`, `wait "#selector"` (refs from snapshot).
</instructions>

## Gotchas
- "setup browser cookies" triggers setup-browser-cookies, not browse-url
- Always close the browser when done to free resources
- For authenticated pages, use setup-browser-cookies first
