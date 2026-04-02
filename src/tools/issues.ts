import { z } from "zod";
import type { BacklogClient } from "../backlog/client.js";
import { clampCount } from "../config.js";

const listIssuesSchema = {
  projectId: z.array(z.number().int().positive()).optional(),
  projectKey: z.array(z.string().min(1)).optional(),
  statusId: z.array(z.number().int().nonnegative()).optional(),
  assigneeId: z.array(z.number().int().nonnegative()).optional(),
  createdUserId: z.array(z.number().int().nonnegative()).optional(),
  keyword: z.string().min(1).optional(),
  offset: z.number().int().nonnegative().optional(),
  count: z.number().int().positive().optional(),
  sort: z.string().min(1).optional(),
  order: z.enum(["asc", "desc"]).optional(),
};

const getIssueSchema = {
  issueIdOrKey: z.string().min(1),
};

const getIssueCommentsSchema = {
  issueIdOrKey: z.string().min(1),
  minId: z.number().int().positive().optional(),
  maxId: z.number().int().positive().optional(),
  count: z.number().int().positive().optional(),
  order: z.enum(["asc", "desc"]).optional(),
};

export function registerIssueTools(
  server: { registerTool: Function },
  client: BacklogClient,
  maxPageSize: number,
): void {
  server.registerTool(
    "list_issues",
    {
      title: "List issues",
      description: "List Backlog issues in accessible projects.",
      inputSchema: listIssuesSchema,
    },
    async (input: z.infer<z.ZodObject<typeof listIssuesSchema>>) => {
      const issues = await client.listIssues({
        ...input,
        count: clampCount(input.count, maxPageSize),
      });

      return {
        content: [{ type: "text", text: JSON.stringify({ issues, meta: { count: issues.length, offset: input.offset ?? 0 } }, null, 2) }],
      };
    },
  );

  server.registerTool(
    "get_issue",
    {
      title: "Get issue",
      description: "Get Backlog issue details.",
      inputSchema: getIssueSchema,
    },
    async ({ issueIdOrKey }: z.infer<z.ZodObject<typeof getIssueSchema>>) => {
      const issue = await client.getIssue(issueIdOrKey);
      return {
        content: [{ type: "text", text: JSON.stringify({ issue }, null, 2) }],
      };
    },
  );

  server.registerTool(
    "get_issue_comments",
    {
      title: "Get issue comments",
      description: "Get comments for a Backlog issue.",
      inputSchema: getIssueCommentsSchema,
    },
    async ({ issueIdOrKey, minId, maxId, count, order }: z.infer<z.ZodObject<typeof getIssueCommentsSchema>>) => {
      const comments = await client.getIssueComments(issueIdOrKey, {
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
