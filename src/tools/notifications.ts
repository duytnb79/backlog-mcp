import { z } from "zod";
import type { BacklogClient } from "../backlog/client.js";
import { clampCount } from "../config.js";

const getNotificationsSchema = {
  minId: z.number().int().positive().optional(),
  maxId: z.number().int().positive().optional(),
  count: z.number().int().positive().optional(),
  order: z.enum(["asc", "desc"]).optional(),
};

const readNotificationSchema = {
  notificationId: z.number().int().positive(),
};

export function registerNotificationTools(
  server: { registerTool: Function },
  client: BacklogClient,
  maxPageSize: number,
): void {
  server.registerTool(
    "get_notifications",
    {
      title: "Get notifications",
      description: "Get recent Backlog notifications.",
      inputSchema: getNotificationsSchema,
    },
    async ({ minId, maxId, count, order }: z.infer<z.ZodObject<typeof getNotificationsSchema>>) => {
      const notifications = await client.getNotifications({
        minId,
        maxId,
        count: clampCount(count, maxPageSize),
        order,
      });

      return {
        content: [{ type: "text", text: JSON.stringify({ notifications, meta: { count: notifications.length } }, null, 2) }],
      };
    },
  );

  server.registerTool(
    "read_notification",
    {
      title: "Read notification",
      description: "Read full notification details.",
      inputSchema: readNotificationSchema,
    },
    async ({ notificationId }: z.infer<z.ZodObject<typeof readNotificationSchema>>) => {
      const notification = await client.readNotification(notificationId);
      return {
        content: [{ type: "text", text: JSON.stringify({ notification }, null, 2) }],
      };
    },
  );
}
