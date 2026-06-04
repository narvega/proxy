# @narvega/proxy

Stdio proxy that connects Claude Desktop or the Claude CLI to the [Narvega](https://narvega.com) MCP governance gateway.

Every tool call Claude makes passes through Narvega — logged, policy-checked, and auditable — before reaching your MCP servers.

---

## Usage

### Claude Desktop

Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "narvega": {
      "command": "npx",
      "args": ["-y", "@narvega/proxy", "https://gateway.narvega.com/your-slug/sse", "nvg_your-connection-key"]
    }
  }
}
```

### Claude CLI

```bash
claude mcp add narvega -- npx -y @narvega/proxy "https://gateway.narvega.com/your-slug/sse" "nvg_your-connection-key"
```

Replace `your-slug` and `nvg_your-connection-key` with the values from **Settings → Connection** in your Narvega dashboard.

---

## Identity

The proxy automatically attaches identity to every request so Narvega knows who made each tool call.

**Option 1 — Environment variables** (recommended for enterprise IT)

Set these via Group Policy, Intune, or a login script. The proxy picks them up automatically — no per-user Claude config needed.

```
NARVEGA_USER_EMAIL=dan.smith@company.com
NARVEGA_USER_ROLE=analyst
NARVEGA_USER_DEPARTMENT=finance
```

**Option 2 — OS username fallback**

If no env vars are set, the proxy uses the OS username automatically. Zero configuration required.

---

## Requirements

- Node.js 20+
- A Narvega account — [narvega.com](https://narvega.com)
