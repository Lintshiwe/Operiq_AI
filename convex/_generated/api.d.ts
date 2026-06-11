/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai from "../ai.js";
import type * as analyses from "../analyses.js";
import type * as analytics from "../analytics.js";
import type * as apiKeys from "../apiKeys.js";
import type * as auth from "../auth.js";
import type * as billing from "../billing.js";
import type * as documents from "../documents.js";
import type * as emailDrafts from "../emailDrafts.js";
import type * as http from "../http.js";
import type * as huggingface from "../huggingface.js";
import type * as notifications from "../notifications.js";
import type * as plans from "../plans.js";
import type * as presence from "../presence.js";
import type * as profiles from "../profiles.js";
import type * as prompts from "../prompts.js";
import type * as sharedChats from "../sharedChats.js";
import type * as summaries from "../summaries.js";
import type * as threads from "../threads.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  analyses: typeof analyses;
  analytics: typeof analytics;
  apiKeys: typeof apiKeys;
  auth: typeof auth;
  billing: typeof billing;
  documents: typeof documents;
  emailDrafts: typeof emailDrafts;
  http: typeof http;
  huggingface: typeof huggingface;
  notifications: typeof notifications;
  plans: typeof plans;
  presence: typeof presence;
  profiles: typeof profiles;
  prompts: typeof prompts;
  sharedChats: typeof sharedChats;
  summaries: typeof summaries;
  threads: typeof threads;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
