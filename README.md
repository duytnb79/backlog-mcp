# @duytnb79/backlog-mcp

A read-only MCP server for Backlog.

Quick start:

```bash
npx -y @duytnb79/backlog-mcp
```

## Requirements

- Node.js 20+
- A Backlog API key
- Your Backlog space URL

## Installation

Run directly with npx:

```bash
npx -y @duytnb79/backlog-mcp
```

Or install globally:

```bash
npm install -g @duytnb79/backlog-mcp
backlog-mcp
```

## Configuration

Set these environment variables before starting the server:

```bash
export BACKLOG_BASE_URL="https://your-space.backlog.com"
export BACKLOG_API_KEY="your_backlog_api_key"
export BACKLOG_TIMEOUT_MS="10000"
export BACKLOG_MAX_PAGE_SIZE="100"
```

Required:
- `BACKLOG_BASE_URL`
- `BACKLOG_API_KEY`

Optional:
- `BACKLOG_TIMEOUT_MS`
- `BACKLOG_MAX_PAGE_SIZE`

## Usage

### With Claude Desktop

```json
{
  "mcpServers": {
    "backlog-mcp": {
      "command": "npx",
      "args": ["-y", "@duytnb79/backlog-mcp"],
      "env": {
        "BACKLOG_BASE_URL": "https://your-space.backlog.com",
        "BACKLOG_API_KEY": "your_backlog_api_key"
      }
    }
  }
}
```

### With a local clone

```bash
npm install
npm run build
node dist/index.js
```

## Available tools

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

- Read-only access only
- No hardcoded secrets
- Requires an `https` Backlog base URL
- No generic passthrough endpoint tool

## Notes

- Do not commit `.env`
- Prefer one API key per teammate
- Publishing this package does not expose Backlog data by itself; access still depends on each user's API key
