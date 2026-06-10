/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import type { ToolDefinition } from "./types";

const toolRegistry = new Map<string, ToolDefinition>();

export function registerTool(tool: ToolDefinition): void {
  if (toolRegistry.has(tool.name)) {
    console.warn(`Tool "${tool.name}" is already registered. Overwriting.`);
  }
  toolRegistry.set(tool.name, tool);
}

export function getAllTools(): ToolDefinition[] {
  return Array.from(toolRegistry.values());
}

export function getTool(name: string): ToolDefinition | undefined {
  return toolRegistry.get(name);
}

/**
 * Converts registered tools to the format expected by the AI SDK's
 * streamText / generateText `tools` parameter.
 *
 * The AI SDK v6 expects:
 * ```
 * tools: {
 *   [name]: {
 *     description: string,
 *     parameters: JSONSchema7,
 *     execute?: (args) => Promise<unknown>
 *   }
 * }
 * ```
 */
export function toolsToAISDK(): Record<string, {
  description: string;
  parameters: Record<string, unknown>;
  execute: (args: Record<string, unknown>) => Promise<unknown>;
}> {
  const result: Record<string, {
    description: string;
    parameters: Record<string, unknown>;
    execute: (args: Record<string, unknown>) => Promise<unknown>;
  }> = {};

  for (const tool of toolRegistry.values()) {
    result[tool.name] = {
      description: tool.description,
      parameters: tool.parameters,
      execute: async (args: Record<string, unknown>) => {
        const toolResult = await tool.execute(args);
        if (toolResult.success) {
          return toolResult.output;
        }
        return `Error: ${toolResult.error || "Tool execution failed"}`;
      },
    };
  }

  return result;
}
