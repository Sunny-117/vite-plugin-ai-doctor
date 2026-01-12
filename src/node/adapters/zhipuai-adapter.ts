/**
 * 智谱AI HTTP API 适配器
 * 
 * 参考文档：https://docs.bigmodel.cn/cn/guide/start/quick-start
 */

import type { BaseMessage } from '@langchain/core/messages'
import type { BaseLanguageModel } from '@langchain/core/language_models/base'
import type { BaseLanguageModelCallOptions } from '@langchain/core/language_models/base'

interface ZhipuAIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface ZhipuAIRequest {
  model: string
  messages: ZhipuAIMessage[]
  temperature?: number
  stream?: boolean
}

interface ZhipuAIResponse {
  choices: Array<{
    message: {
      role: string
      content: string
    }
  }>
}

/**
 * 将 LangChain Message 转换为智谱AI API 格式
 */
function convertMessages(messages: BaseMessage[]): ZhipuAIMessage[] {
  return messages.map((msg) => {
    const content = typeof msg.content === 'string' 
      ? msg.content 
      : JSON.stringify(msg.content)
    
    // 根据消息类型确定角色
    if (msg.getType() === 'system') {
      return { role: 'system' as const, content }
    } else if (msg.getType() === 'human') {
      return { role: 'user' as const, content }
    } else if (msg.getType() === 'ai') {
      return { role: 'assistant' as const, content }
    } else {
      // 默认作为用户消息
      return { role: 'user' as const, content }
    }
  })
}

/**
 * 智谱AI HTTP API 适配器
 * 实现 LangChain BaseLanguageModel 接口，直接调用智谱AI HTTP API
 * 
 * 注意：这是一个简化实现，只实现插件需要的 invoke 方法
 */
export class ZhipuAIAdapter implements Partial<BaseLanguageModel> {
  private apiKey: string
  private model: string
  private baseURL: string
  private temperature: number

  constructor(config: {
    apiKey: string
    model?: string
    baseURL?: string
    temperature?: number
  }) {
    this.apiKey = config.apiKey
    this.model = config.model || 'glm-4'
    this.baseURL = config.baseURL || 'https://open.bigmodel.cn/api/paas/v4'
    this.temperature = config.temperature ?? 0.7
  }

  /**
   * 调用智谱AI API
   * 这是插件主要使用的方法
   */
  async invoke(
    messages: BaseMessage[],
    options?: BaseLanguageModelCallOptions
  ): Promise<any> {
    // 从 options 中提取 temperature（如果存在）
    const temperature = (options as any)?.temperature ?? this.temperature
    
    const requestBody: ZhipuAIRequest = {
      model: this.model,
      messages: convertMessages(messages),
      temperature,
      stream: false, // 非流式输出
    }

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(
          `ZhipuAI API error (${response.status}): ${errorText}`
        )
      }

      const data = await response.json() as ZhipuAIResponse

      if (!data.choices || data.choices.length === 0) {
        throw new Error('ZhipuAI API returned no choices')
      }

      // 返回 LangChain 兼容的格式
      return {
        content: data.choices[0].message.content,
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to call ZhipuAI API: ${error.message}`)
      }
      throw error
    }
  }
}

