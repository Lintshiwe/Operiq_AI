/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import { registerTool, getAllTools, getTool, toolsToAISDK } from "./registry";
import { webSearchTool } from "./web-search";
import { fetchUrlTool } from "./fetch-url";
import { generateImageTool } from "./huggingface-image";
import { generateVideoTool } from "./huggingface-video";

// Auto-register all built-in tools
registerTool(webSearchTool);
registerTool(fetchUrlTool);
registerTool(generateImageTool);
registerTool(generateVideoTool);

export type { ToolDefinition, ToolResult, ToolCall } from "./types";
export { registerTool, getAllTools, getTool, toolsToAISDK };
export { webSearchTool, fetchUrlTool, generateImageTool, generateVideoTool };
