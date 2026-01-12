/**
 * 插件选项类型定义
 */

import type { BaseLanguageModel } from '@langchain/core/language_models/base'

/**
 * 模型提供商类型
 */
export type ModelProvider = 'zhipuai' | 'openai' | 'ollama' | 'custom'

/**
 * 智谱AI配置
 */
export interface ZhipuAIConfig {
  provider: 'zhipuai'
  apiKey: string
  model?: string
  baseURL?: string
  temperature?: number
}

/**
 * OpenAI配置
 */
export interface OpenAIConfig {
  provider: 'openai'
  apiKey: string
  model?: string
  baseURL?: string
  temperature?: number
}

/**
 * Ollama配置
 */
export interface OllamaConfig {
  provider: 'ollama'
  model: string
  baseURL?: string
  temperature?: number
}

/**
 * 自定义模型配置
 */
export interface CustomModelConfig {
  provider: 'custom'
  model: BaseLanguageModel
}

/**
 * 模型配置联合类型
 */
export type ModelConfig = ZhipuAIConfig | OpenAIConfig | OllamaConfig | CustomModelConfig

export interface ViteAiDoctorOptions {
  /**
   * 是否启用插件
   * @default true
   */
  enabled?: boolean

  /**
   * 打字机效果的速度（毫秒）
   * @default 20
   */
  typeWriterSpeed?: number

  /**
   * 是否在 AI 调用失败时输出原始错误
   * @default true
   */
  showOriginalError?: boolean

  /**
   * 模型配置
   * 
   * 支持多种模型提供商：
   * - zhipuai: 智谱AI
   * - openai: OpenAI
   * - ollama: Ollama（本地模型）
   * - custom: 自定义模型实例
   * 
   * @example
   * // 智谱AI
   * model: {
   *   provider: 'zhipuai',
   *   apiKey: 'your-api-key',
   *   model: 'glm-4',
   * }
   * 
   * @example
   * // OpenAI
   * model: {
   *   provider: 'openai',
   *   apiKey: 'your-api-key',
   *   model: 'gpt-4',
   * }
   * 
   * @example
   * // Ollama
   * model: {
   *   provider: 'ollama',
   *   model: 'llama3',
   *   baseURL: 'http://localhost:11434',
   * }
   * 
   * @example
   * // 自定义模型
   * model: {
   *   provider: 'custom',
   *   model: yourModelInstance,
   * }
   */
  model: ModelConfig
}

