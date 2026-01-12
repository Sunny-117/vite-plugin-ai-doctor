/**
 * 模型工厂模块
 * 根据配置动态创建 LangChain 模型实例
 */

import type { BaseLanguageModel } from '@langchain/core/language_models/base'
import type { ModelConfig } from './options'
import { ZhipuAIAdapter } from './adapters/zhipuai-adapter'

/**
 * 创建模型实例
 * 
 * @param config 模型配置
 * @returns LangChain 模型实例（或兼容的对象）
 */
export async function createModel(config: ModelConfig): Promise<BaseLanguageModel | { invoke: (messages: any) => Promise<any> }> {
  switch (config.provider) {
    case 'zhipuai': {
      // 直接使用 HTTP API 调用智谱AI，无需额外依赖
      return new ZhipuAIAdapter({
        apiKey: config.apiKey,
        model: config.model || 'glm-4',
        baseURL: config.baseURL,
        temperature: config.temperature ?? 0.7,
      })
    }

    case 'openai': {
      // 动态导入 @langchain/openai
      // 用户需要安装: pnpm add @langchain/openai
      try {
        // @ts-ignore - 可选依赖，运行时检查
        const { ChatOpenAI } = await import('@langchain/openai')
        return new ChatOpenAI({
          openAIApiKey: config.apiKey,
          modelName: config.model || 'gpt-4',
          configuration: {
            baseURL: config.baseURL,
          },
          temperature: config.temperature ?? 0.7,
        })
      } catch (error) {
        throw new Error(
          'Failed to load @langchain/openai. Please install it: pnpm add @langchain/openai'
        )
      }
    }

    case 'ollama': {
      // 动态导入 @langchain/ollama
      // 用户需要安装: pnpm add @langchain/ollama
      try {
        // @ts-ignore - 可选依赖，运行时检查
        const { ChatOllama } = await import('@langchain/ollama')
        return new ChatOllama({
          model: config.model,
          baseUrl: config.baseURL || 'http://localhost:11434',
          temperature: config.temperature ?? 0.7,
        })
      } catch (error) {
        throw new Error(
          'Failed to load @langchain/ollama. Please install it: pnpm add @langchain/ollama'
        )
      }
    }

    case 'custom': {
      // 直接返回用户提供的模型实例
      return config.model
    }

    default: {
      const _exhaustive: never = config
      throw new Error(`Unsupported model provider: ${(_exhaustive as any).provider}`)
    }
  }
}

