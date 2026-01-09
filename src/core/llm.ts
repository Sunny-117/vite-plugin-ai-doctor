/**
 * LLM 模型单例
 * 
 * 此模块提供本地大模型实例，供 vite-plugin-ai-doctor 使用
 * 
 * 使用示例（Ollama）：
 * ```ts
 * import { ChatOllama } from '@langchain/ollama'
 * 
 * export const model = new ChatOllama({
 *   model: 'llama3',
 *   baseUrl: 'http://localhost:11434',
 * })
 * ```
 * 
 * 使用示例（OpenAI）：
 * ```ts
 * import { ChatOpenAI } from '@langchain/openai'
 * 
 * export const model = new ChatOpenAI({
 *   modelName: 'gpt-4',
 *   temperature: 0.7,
 * })
 * ```
 */

import type { BaseLanguageModel } from '@langchain/core/language_models/base'

// 占位实现：实际使用时需要替换为真实的模型实例
// 这里使用 any 类型，因为不同的 LangChain 模型实现可能不同
export const model: BaseLanguageModel = {
  // 这是一个占位实现，实际使用时需要替换为真实的模型实例
  // 例如：new ChatOllama({ model: 'llama3' })
  invoke: async (messages: any) => {
    // 占位实现：返回一个示例响应
    // 实际使用时，这里应该是真实的模型调用
    return {
      content: '这是一个占位实现。请配置真实的 LLM 模型实例。\n\n建议使用 @langchain/ollama 或 @langchain/openai 等包来初始化模型。',
    }
  },
} as any

