import { z } from "zod";
import type { BacklogClient } from "../backlog/client.js";

const listProjectsSchema = {
  archived: z.boolean().optional(),
};

export function registerProjectTools(server: { registerTool: Function }, client: BacklogClient): void {
  server.registerTool(
    "list_projects",
    {
      title: "List projects",
      description: "List accessible Backlog projects.",
      inputSchema: listProjectsSchema,
    },
    async ({ archived }: z.infer<z.ZodObject<typeof listProjectsSchema>>) => {
      const projects = await client.listProjects(archived);
      return {
        content: [{ type: "text", text: JSON.stringify({ projects }, null, 2) }],
      };
    },
  );
}
