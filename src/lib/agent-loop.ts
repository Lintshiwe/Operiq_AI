/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import { generateText, type CoreMessage, type CoreToolMessage } from "ai";
import type { LanguageModelV2 } from "@ai-sdk/provider";
import { toolsToAISDK, getTool } from "./tools/index";
import type { ToolCall, ToolDefinition, ToolResult } from "./tools/types";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export interface AgentConfig {
  /** Maximum number of reasoning steps (default: 10) */
  maxSteps: number;
  /** The language model to use */
  model: LanguageModelV2;
  /** Base system instructions for the agent */
  systemPrompt: string;
  /** Additional tools beyond the globally registered ones */
  tools?: ToolDefinition[];
}

export interface AgentStep {
  /** Agent's reasoning/thought for this step */
  thought: string;
  /** What tool was called (null if final answer) */
  action: ToolCall | null;
  /** The result of the action */
  observation: string;
}

export interface AgentResult {
  finalAnswer: string;
  steps: AgentStep[];
  totalSteps: number;
  tokensUsed?: number;
}

/* ------------------------------------------------------------------ */
/*  Agent System Prompt                                               */
/* ------------------------------------------------------------------ */

export const AGENT_SYSTEM_EXTENSION = `
You are Operiq AI, an autonomous agent with access to tools. Follow this ReAct pattern:

1. THINK about what you need to do to answer the user's request.
2. If you need to fetch data or search, use the appropriate tool.
3. Observe the tool result and decide if you need more information.
4. Once you have enough information, provide a clear, helpful final answer.

Guidelines:
- Use web_search to find current information from the internet.
- Use fetch_url to retrieve content from specific web pages.
- If a tool returns insufficient results, try a different approach before giving up.
- Be concise and direct in your final answer.
- When you have enough information to answer, respond directly without calling more tools.
`.trim();

/* ------------------------------------------------------------------ */
/*  Core Loop                                                         */
/* ------------------------------------------------------------------ */

/**
 * Runs the autonomous agent loop using the ReAct (Reasoning + Acting) pattern.
 * Each step: the model reasons about what to do, calls a tool if needed,
 * observes the result, and repeats until it produces a final answer.
 */
export async function runAgentLoop(
  config: AgentConfig,
  userMessage: string,
  onStep: (step: AgentStep) => void,
): Promise<AgentResult> {
  const maxSteps = config.maxSteps || 10;

  // Build the tools object for the AI SDK
  const sdkTools = toolsToAISDK();

  // Build initial messages
  const messages: CoreMessage[] = [
    {
      role: "system",
      content: `${config.systemPrompt}\n\n${AGENT_SYSTEM_EXTENSION}`,
    },
    { role: "user", content: userMessage },
  ];

  const steps: AgentStep[] = [];
  let totalTokens = 0;
  let finalAnswer = "";

  for (let i = 0; i < maxSteps; i++) {
    // Call the model
    const result = await generateText({
      model: config.model,
      messages,
      tools: sdkTools,
      temperature: 0.3,
    });

    // Track token usage
    if (result.usage) {
      totalTokens += result.usage.totalTokens || 0;
    }

    // Extract text response (may include reasoning/thoughts)
    const responseText = result.text || "";

    // Check for tool calls
    if (result.toolResults && result.toolResults.length > 0) {
      // Model made tool calls and they were executed
      for (const tcResult of result.toolResults) {
        const toolCall: ToolCall = {
          id: tcResult.toolCallId,
          name: tcResult.toolName,
          params: tcResult.args as Record<string, unknown>,
        };

        const observation =
          typeof tcResult.result === "string"
            ? tcResult.result
            : JSON.stringify(tcResult.result);

        const step: AgentStep = {
          thought: responseText,
          action: toolCall,
          observation,
        };

        steps.push(step);
        onStep(step);
      }

      // Add assistant message with tool calls
      messages.push({
        role: "assistant",
        content: responseText
          ? [
              { type: "text" as const, text: responseText },
              ...result.toolResults.map((tc) => ({
                type: "tool-call" as const,
                toolCallId: tc.toolCallId,
                toolName: tc.toolName,
                args: tc.args,
              })),
            ]
          : result.toolResults.map((tc) => ({
              type: "tool-call" as const,
              toolCallId: tc.toolCallId,
              toolName: tc.toolName,
              args: tc.args,
            })),
      });

      // Add tool result messages
      const toolResultMessages: CoreToolMessage = {
        role: "tool",
        content: result.toolResults.map((tc) => ({
          type: "tool-result" as const,
          toolCallId: tc.toolCallId,
          toolName: tc.toolName,
          result: tc.result,
        })),
      };
      messages.push(toolResultMessages);

      continue; // Next iteration
    }

    // No tool calls — this is the final answer
    finalAnswer = responseText;
    break;
  }

  // If we exhausted max steps without a final answer
  if (!finalAnswer && steps.length > 0) {
    // Make one final call to summarize
    messages.push({
      role: "user",
      content:
        "Please provide a final answer based on all the tool results you've seen so far.",
    });

    try {
      const finalResult = await generateText({
        model: config.model,
        messages,
        temperature: 0.3,
      });

      if (finalResult.usage) {
        totalTokens += finalResult.usage.totalTokens || 0;
      }

      finalAnswer = finalResult.text || "I was unable to complete this task.";
    } catch {
      finalAnswer =
        "I completed several steps but was unable to formulate a final answer. Please try again with a more specific query.";
    }
  }

  if (!finalAnswer) {
    finalAnswer =
      "I wasn't able to find enough information to answer. Could you rephrase or provide more details?";
  }

  return {
    finalAnswer,
    steps,
    totalSteps: steps.length,
    tokensUsed: totalTokens,
  };
}
