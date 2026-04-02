import { z } from "zod";
import type { BacklogClient } from "../backlog/client.js";
import { clampCount } from "../config.js";

const listPullRequestsSchema = {
  projectIdOrKey: z.string().min(1),
  repoIdOrName: z.string().min(1),
  statusId: z.array(z.number().int().nonnegative()).optional(),
  assigneeId: z.array(z.number().int().nonnegative()).optional(),
  createdUserId: z.array(z.number().int().nonnegative()).optional(),
  offset: z.number().int().nonnegative().optional(),
  count: z.number().int().positive().optional(),
};

const getPullRequestSchema = {
  projectIdOrKey: z.string().min(1),
  repoIdOrName: z.string().min(1),
  pullRequestNumber: z.number().int().positive(),
};

const getPullRequestCommentsSchema = {
  projectIdOrKey: z.string().min(1),
  repoIdOrName: z.string().min(1),
  pullRequestNumber: z.number().int().positive(),
  minId: z.number().int().positive().optional(),
  maxId: z.number().int().positive().optional(),
  count: z.number().int().positive().optional(),
  order: z.enum(["asc", "desc"]).optional(),
};

export function registerPullRequestTools(
  server: { registerTool: Function },
  client: BacklogClient,
  maxPageSize: number,
): void {
  server.registerTool(
    "list_pull_requests",
    {
      title: "List pull requests",
      description: "List pull requests in a Backlog git repository.",
      inputSchema: z.object(listPullRequestsSchema),
    },
    async ({
      projectIdOrKey,
      repoIdOrName,
      statusId,
      assigneeId,
      createdUserId,
      offset,
      count,
    }: z.infer<z.ZodObject<typeof listPullRequestsSchema>>) => {
      const pullRequests = await client.listPullRequests(projectIdOrKey, repoIdOrName, {
        statusId,
        assigneeId,
        createdUserId,
        offset,
        count: clampCount(count, maxPageSize),
      });

      return {
        content: [{ type: "text", text: JSON.stringify({ pullRequests, meta: { count: pullRequests.length, offset: offset ?? 0 } }, null, 2) }],
      };
    },
  );

  server.registerTool(
    "get_pull_request",
    {
      title: "Get pull request",
      description: "Get Backlog pull request details.",
      inputSchema: z.object(getPullRequestSchema),
    },
    async ({ projectIdOrKey, repoIdOrName, pullRequestNumber }: z.infer<z.ZodObject<typeof getPullRequestSchema>>) => {
      const pullRequest = await client.getPullRequest(projectIdOrKey, repoIdOrName, pullRequestNumber);
      return {
        content: [{ type: "text", text: JSON.stringify({ pullRequest }, null, 2) }],
      };
    },
  );

  server.registerTool(
    "get_pull_request_comments",
    {
      title: "Get pull request comments",
      description: "Get comments for a Backlog pull request.",
      inputSchema: z.object(getPullRequestCommentsSchema),
    },
    async ({ projectIdOrKey, repoIdOrName, pullRequestNumber, minId, maxId, count, order }: z.infer<z.ZodObject<typeof getPullRequestCommentsSchema>>) => {

      const comments = await client.getPullRequestComments(projectIdOrKey, repoIdOrName, pullRequestNumber, {
        minId,
        maxId,
        count: clampCount(count, maxPageSize),
        order,
      });

      return {
        content: [{ type: "text", text: JSON.stringify({ comments, meta: { count: comments.length } }, null, 2) }],
      };
    },
  );
}
