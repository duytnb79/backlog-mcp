# @tamaki_diz/backlog-mcp

A simple read-only MCP server for Backlog.

## Tools
- `get_notifications`
- `read_notification`
- `list_projects`
- `list_repositories`
- `list_pull_requests`
- `get_pull_request`
- `list_issues`
- `get_issue`
- `get_pull_request_comments`
- `get_issue_comments`

## Security
- read-only only
- no hardcoded secrets
- requires `https` Backlog base URL
- no generic passthrough endpoint tool

## Requirements
- Node.js 20+

## Setup
```bash
npm install
npm run build
```

Set local environment variables:

```bash
export BACKLOG_BASE_URL="https://your-space.backlog.com"
export BACKLOG_API_KEY="your_backlog_api_key"
export BACKLOG_TIMEOUT_MS="10000"
export BACKLOG_MAX_PAGE_SIZE="100"
```

## Publish to npm
1. Login with your npm account:

```bash
npm login
npm whoami
```

Expected account:

```bash
tamaki_diz
```

2. Build the package:

```bash
npm run build
```

3. Publish the first version:

```bash
npm publish
```

4. For later releases, bump the version first:

```bash
npm version patch
npm publish
```

## Run after publish

```bash
npx @tamaki_diz/backlog-mcp@latest
```

Example MCP config after publish:

```json
{
  "mcpServers": {
    "backlog-mcp": {
      "command": "npx",
      "args": ["@tamaki_diz/backlog-mcp@latest"],
      "env": {
        "BACKLOG_BASE_URL": "https://your-space.backlog.com",
        "BACKLOG_API_KEY": "${BACKLOG_API_KEY}"
      }
    }
  }
}
```

## Notes
- Do not commit `.env`
- Prefer one API key per teammate
- Public package does not expose Backlog data by itself; access still depends on each user's API key
- If `npm publish` fails, check whether the package name is already taken or whether you are logged into the correct npm account
