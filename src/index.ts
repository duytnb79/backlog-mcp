import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "./config.js";
import { BacklogClient } from "./backlog/client.js";
import { toReadableError } from "./backlog/errors.js";
import { registerNotificationTools } from "./tools/notifications.js";
import { registerProjectTools } from "./tools/projects.js";
import { registerRepositoryTools } from "./tools/repositories.js";
import { registerPullRequestTools } from "./tools/pull-requests.js";
import { registerIssueTools } from "./tools/issues.js";

const config = loadConfig();
const client = new BacklogClient(config);

const server = new McpServer({
  name: "@duytnb79/backlog-mcp",
  version: "0.1.0",
});

registerNotificationTools(server, client, config.maxPageSize);
registerProjectTools(server, client);
registerRepositoryTools(server, client);
registerPullRequestTools(server, client, config.maxPageSize);
registerIssueTools(server, client, config.maxPageSize);

process.on("uncaughtException", (error: Error) => {
  console.error(toReadableError(error));
  process.exit(1);
});

process.on("unhandledRejection", (error: unknown) => {
  console.error(toReadableError(error));
  process.exit(1);
});

const transport = new StdioServerTransport();
await server.connect(transport);
