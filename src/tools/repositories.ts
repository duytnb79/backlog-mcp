import { z } from "zod";
import type { BacklogClient } from "../backlog/client.js";

const listRepositoriesSchema = {
  projectIdOrKey: z.string().min(1),
};

export function registerRepositoryTools(server: { registerTool: Function }, client: BacklogClient): void {
  server.registerTool(
    "list_repositories",
    {
      title: "List repositories",
      description: "List repositories in a Backlog project.",
      inputSchema: z.object(listRepositoriesSchema),
    },
    async ({ projectIdOrKey }: z.infer<z.ZodObject<typeof listRepositoriesSchema>>) => {

      const repositories = await client.listRepositories(projectIdOrKey);
      return {
        content: [{ type: "text", text: JSON.stringify({ repositories }, null, 2) }],
      };
    },
  );
}
