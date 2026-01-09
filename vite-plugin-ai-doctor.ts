import type { Plugin } from 'vite'
import type { Rollup } from 'vite'
import { SystemMessage, HumanMessage } from '@langchain/core/messages'
import pc from 'picocolors'
import { model } from '../src/core/llm'

const NAME = 'vite-plugin-ai-doctor'

// ==================== 工具函数区 ====================

/**
 * 延迟函数
 * @param ms 延迟毫秒数
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 打字机效果输出
 * 使用 process.stdout.write 实现逐字符输出，支持 ANSI 颜色
 * 
 * 为什么使用 process.stdout.write：
 * 1. console.log 会自动添加换行符，无法精确控制输出
 * 2. process.stdout.write 可以逐字符输出，实现打字机效果
 * 3. 可以保留 ANSI 颜色代码，让输出更美观
 * 
 * @param text 要输出的文本（可包含 ANSI 颜色代码）
 * @param speed 每个字符的延迟时间（毫秒），默认 20ms
 */
async function typeWriter(text: string, speed: number = 20): Promise<void> {
  for (let i = 0; i < text.length; i++) {
    process.stdout.write(text[i])
    // 如果不是最后一个字符，延迟
    if (i < text.length - 1) {
      await sleep(speed)
    }
  }
  // 输出结束后自动换行
  process.stdout.write('\n')
}

// ==================== 插件主逻辑 ====================

/**
 * Vite AI Doctor 插件
 * 
 * 功能：在构建失败时自动调用 AI 进行错误诊断
 * 
 * 为什么使用 buildEnd 而不是 transform：
 * 1. buildEnd 在构建流程的最后执行，可以捕获所有构建阶段的错误
 * 2. transform 只在模块转换时触发，无法捕获构建配置、依赖解析等阶段的错误
 * 3. buildEnd 的 error 参数包含了完整的构建错误信息
 * 
 * 为什么 enforce: "post"：
 * 1. 确保在其他插件处理完后再执行，避免干扰构建流程
 * 2. 作为后置插件，可以获取到完整的构建结果和错误信息
 * 3. 即使构建失败，也能正常执行诊断逻辑
 */
export default function vitePluginAiDoctor(): Plugin {
  return {
    name: NAME,
    enforce: 'post', // 后置执行，确保在其他插件之后运行
    
    /**
     * 构建结束 Hook
     * 仅当构建失败（error 存在）时执行 AI 诊断
     * 
     * 为什么 AI 调用要 try/catch 包住：
     * 1. 本地模型可能未启动（如 Ollama 未运行）
     * 2. 网络问题或模型服务异常
     * 3. 避免 AI 调用失败导致插件崩溃，影响构建流程
     * 4. 提供友好的错误提示，引导用户检查模型配置
     */
    async buildEnd(error: Rollup.RollupError | Error | null) {
      // 如果没有错误，直接返回
      if (!error) {
        return
      }

      try {
        // 1. 输出醒目的红色 Banner
        process.stdout.write('\n')
        const banner = pc.red('🚨 智能报错诊断系统启动')
        await typeWriter(banner, 30)
        process.stdout.write('\n')

        // 2. 输出黄色提示（AI 正在分析）
        const analyzing = pc.yellow('🤖 AI 正在分析构建错误，请稍候...')
        await typeWriter(analyzing, 20)
        process.stdout.write('\n')

        // 3. 构造 errorContext（message / stack / id）
        const errorContext = {
          message: error.message || '未知错误',
          stack: error.stack || '无堆栈信息',
          id: (error as Rollup.RollupError).id || '未知模块',
          name: error.name || 'Error',
        }

        // 4. 构造 Prompt
        const systemPrompt = `你是资深前端架构师，擅长诊断 Vite 构建错误。

请用**通俗中文**回答，**直接给出修复方案**，不要废话。

如果涉及配置，请给出 \`vite.config.ts\` 示例代码。

分析以下构建错误，并提供解决方案：`

        const userPrompt = `
错误信息：
${errorContext.message}

错误位置：
${errorContext.id}

堆栈信息：
${errorContext.stack}
`

        // 5. 调用 model.invoke
        const messages = [
          new SystemMessage(systemPrompt),
          new HumanMessage(userPrompt),
        ]

        const response = await model.invoke(messages)
        const aiResponse = typeof response === 'string' 
          ? response 
          : response.content?.toString() || 'AI 未返回有效内容'

        // 6. 将 AI 返回内容用打字机效果输出
        process.stdout.write('\n')
        await typeWriter(pc.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'), 5)
        process.stdout.write('\n')
        await typeWriter(pc.bold(pc.green('💡 AI 诊断建议：')), 20)
        process.stdout.write('\n')
        await typeWriter(pc.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'), 5)
        process.stdout.write('\n')
        
        // 逐行输出 AI 响应，保持格式
        const lines = aiResponse.split('\n')
        for (const line of lines) {
          await typeWriter(pc.white(line), 15)
        }
        
        process.stdout.write('\n')
        await typeWriter(pc.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'), 5)
        process.stdout.write('\n')
        await typeWriter(pc.dim('诊断完成，请根据上述建议修复错误。'), 20)
        process.stdout.write('\n')

      } catch (aiError) {
        // 异常兜底：如果 AI 调用失败
        process.stdout.write('\n')
        await typeWriter(pc.red('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'), 5)
        process.stdout.write('\n')
        await typeWriter(pc.red('❌ AI 诊断服务调用失败'), 20)
        process.stdout.write('\n')
        await typeWriter(pc.yellow('请检查：'), 20)
        process.stdout.write('\n')
        await typeWriter(pc.dim('  1. 本地大模型服务是否已启动（如 Ollama）'), 20)
        process.stdout.write('\n')
        await typeWriter(pc.dim('  2. 模型配置是否正确'), 20)
        process.stdout.write('\n')
        await typeWriter(pc.dim('  3. 网络连接是否正常'), 20)
        process.stdout.write('\n')
        
        // 输出原始错误信息作为备选
        await typeWriter(pc.yellow('原始错误信息：'), 20)
        process.stdout.write('\n')
        await typeWriter(pc.red(error.message), 15)
        if (error.stack) {
          await typeWriter(pc.dim(error.stack), 10)
        }
        process.stdout.write('\n')
        await typeWriter(pc.red('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'), 5)
        process.stdout.write('\n')
      }
    },
  }
}

