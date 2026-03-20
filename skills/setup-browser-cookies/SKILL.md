---
name: setup-browser-cookies
description: Use when the user asks to setup browser cookies, import sessions, or authenticate the headless browser. Triggers on "import cookies", "setup browser cookies". NOT for browsing URLs (use browse-url).
user-invocable: true
argument-hint: "[browser name] [domain to authenticate]"
context: fork
agent: researcher
allowed-tools:
  - Read
  - Bash
  - Glob
---

# Setup Browser Cookies — Session Manager

Import cookies for $ARGUMENTS from a local browser into the headless agent-browser session.

Supported: Chrome (`~/Library/Application Support/Google/Chrome/Default/Cookies`), Arc (`~/Library/Application Support/Arc/User Data/Default/Cookies`), Brave (`~/Library/Application Support/BraveSoftware/Brave-Browser/Default/Cookies`).

<instructions>
1. Identify which browser has the authenticated session
2. Locate SQLite cookie database for that browser
3. Extract cookies: `sqlite3` query filtered by target domain, handle macOS Keychain decryption
4. Import to agent-browser via Chrome DevTools Protocol (`Network.setCookie` or `document.cookie`)
5. Verify: navigate to authenticated page, confirm session is valid
</instructions>

<constraints>
- Cookie extraction requires the browser to be closed (SQLite lock)
- Never log or persist cookie values
- Session expires when the headless browser closes
- If decryption fails, prompt user to manually log in via headless browser
- Never export cookies to files or external services
</constraints>

## Gotchas
- "browse this URL" triggers browse-url, not setup-browser-cookies
- Browser must be CLOSED before extracting cookies (SQLite lock)
- macOS Keychain decryption may fail — fall back to manual login in headless browser
