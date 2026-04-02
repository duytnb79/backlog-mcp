import { BacklogApiError } from "./errors.js";
import type { JsonObject, SortOrder } from "./types.js";
import type { BacklogConfig } from "../config.js";

export type NotificationListParams = {
  minId?: number;
  maxId?: number;
  count?: number;
  order?: SortOrder;
};

export type IssueListParams = {
  projectId?: number[];
  projectKey?: string[];
  statusId?: number[];
  assigneeId?: number[];
  createdUserId?: number[];
  keyword?: string;
  offset?: number;
  count?: number;
  sort?: string;
  order?: SortOrder;
};

export type PullRequestListParams = {
  statusId?: number[];
  assigneeId?: number[];
  createdUserId?: number[];
  offset?: number;
  count?: number;
};

export type CommentListParams = {
  minId?: number;
  maxId?: number;
  count?: number;
  order?: SortOrder;
};

export class BacklogClient {
  constructor(private readonly config: BacklogConfig) {}

  async getNotifications(params: NotificationListParams): Promise<unknown[]> {
    return this.getList("/api/v2/notifications", params);
  }

  async readNotification(notificationId: number): Promise<JsonObject> {
    const notifications = await this.getList("/api/v2/notifications", { minId: notificationId, maxId: notificationId, count: 1 });
    const notification = notifications.find((item) => typeof item === "object" && item !== null && (item as { id?: unknown }).id === notificationId);

    if (!notification || typeof notification !== "object") {
      throw new BacklogApiError(`Notification ${notificationId} was not found`, 404);
    }

    return notification as JsonObject;
  }

  async listProjects(archived?: boolean): Promise<unknown[]> {
    const projects = await this.getList("/api/v2/projects");
    if (archived == null) {
      return projects;
    }
    return projects.filter((project) => {
      if (typeof project !== "object" || project === null) {
        return false;
      }
      return Boolean((project as { archived?: unknown }).archived) === archived;
    });
  }

  async listRepositories(projectIdOrKey: string): Promise<unknown[]> {
    return this.getList(`/api/v2/projects/${encodeURIComponent(projectIdOrKey)}/git/repositories`);
  }

  async listPullRequests(projectIdOrKey: string, repoIdOrName: string, params: PullRequestListParams): Promise<unknown[]> {
    return this.getList(
      `/api/v2/projects/${encodeURIComponent(projectIdOrKey)}/git/repositories/${encodeURIComponent(repoIdOrName)}/pullRequests`,
      params,
    );
  }

  async getPullRequest(projectIdOrKey: string, repoIdOrName: string, pullRequestNumber: number): Promise<JsonObject> {
    return this.getObject(
      `/api/v2/projects/${encodeURIComponent(projectIdOrKey)}/git/repositories/${encodeURIComponent(repoIdOrName)}/pullRequests/${pullRequestNumber}`,
    );
  }

  async getPullRequestComments(
    projectIdOrKey: string,
    repoIdOrName: string,
    pullRequestNumber: number,
    params: CommentListParams,
  ): Promise<unknown[]> {
    return this.getList(
      `/api/v2/projects/${encodeURIComponent(projectIdOrKey)}/git/repositories/${encodeURIComponent(repoIdOrName)}/pullRequests/${pullRequestNumber}/comments`,
      params,
    );
  }

  async listIssues(params: IssueListParams): Promise<unknown[]> {
    return this.getList("/api/v2/issues", params);
  }

  async getIssue(issueIdOrKey: string): Promise<JsonObject> {
    return this.getObject(`/api/v2/issues/${encodeURIComponent(issueIdOrKey)}`);
  }

  async getIssueComments(issueIdOrKey: string, params: CommentListParams): Promise<unknown[]> {
    return this.getList(`/api/v2/issues/${encodeURIComponent(issueIdOrKey)}/comments`, params);
  }

  private async getList(path: string, query?: Record<string, unknown>): Promise<unknown[]> {
    const data = await this.request(path, query);
    if (!Array.isArray(data)) {
      throw new BacklogApiError("Backlog API returned an unexpected response shape");
    }
    return data;
  }

  private async getObject(path: string, query?: Record<string, unknown>): Promise<JsonObject> {
    const data = await this.request(path, query);
    if (typeof data !== "object" || data === null || Array.isArray(data)) {
      throw new BacklogApiError("Backlog API returned an unexpected response shape");
    }
    return data as JsonObject;
  }

  private async request(path: string, query?: Record<string, unknown>): Promise<unknown> {
    const url = new URL(path, this.config.baseUrl);
    url.searchParams.set("apiKey", this.config.apiKey);
    this.appendQuery(url, query);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        const details = await this.safeJson(response);
        const redactedUrl = url.toString().replace(/apiKey=[^&]+/, "apiKey=***");
        let error = this.mapHttpError(response.status, details);
        error.message = `${error.message} (URL: ${redactedUrl})`;
        throw error;
      }


      return await response.json();
    } catch (error) {
      if (error instanceof BacklogApiError) {
        throw error;
      }

      if (error instanceof Error && error.name === "AbortError") {
        throw new BacklogApiError(`Backlog API request timed out after ${this.config.timeoutMs}ms`);
      }

      throw new BacklogApiError(error instanceof Error ? error.message : "Backlog API request failed");
    } finally {
      clearTimeout(timeout);
    }
  }

  private appendQuery(url: URL, query?: Record<string, unknown>): void {
    if (!query) {
      return;
    }

    for (const [key, value] of Object.entries(query)) {
      if (value == null) {
        continue;
      }

      if (Array.isArray(value)) {
        for (const item of value) {
          url.searchParams.append(key.endsWith("[]") ? key : `${key}[]`, String(item));
        }
        continue;
      }

      url.searchParams.set(key, String(value));
    }
  }

  private async safeJson(response: Response): Promise<unknown> {
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      return undefined;
    }

    try {
      return await response.json();
    } catch {
      return undefined;
    }
  }

  private mapHttpError(status: number, details: unknown): BacklogApiError {
    let message: string;
    switch (status) {
      case 400:
        message = "Backlog rejected the request as invalid";
        break;
      case 401:
      case 403:
        message = "Backlog authentication or permission failed";
        break;
      case 404:
        message = "Requested Backlog resource was not found";
        break;
      case 429:
        message = "Backlog rate limit exceeded";
        break;
      default:
        if (status >= 500) {
          message = "Backlog API returned a server error";
        } else {
          message = `Backlog API request failed with status ${status}`;
        }
    }

    if (details) {
      try {
        message += ` (Details: ${JSON.stringify(details)})`;
      } catch {
        // Skip details if stringification fails
      }
    }

    return new BacklogApiError(message, status, details);
  }

}
