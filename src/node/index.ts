import type { Plugin, Rollup } from 'vite'
import { SystemMessage, HumanMessage } from '@langchain/core/messages'
import pc from 'picocolors'
import type { ViteAiDoctorOptions } from './options'
import { createModel } from './model-factory'
import { typeWriter } from './utils'

const NAME = 'vite-plugin-ai-doctor'

export * from './options'

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
export default function vitePluginAiDoctor(options: ViteAiDoctorOptions): Plugin {
  const {
    enabled = true,
    typeWriterSpeed = 20,
    showOriginalError = true,
    model: modelConfig,
  } = options

  // 验证必需配置
  if (!modelConfig) {
    throw new Error(
      'vite-plugin-ai-doctor: model configuration is required. ' +
      'Please provide model config in plugin options.'
    )
  }

  if (!enabled) {
    return {
      name: NAME,
    }
  }

  // 预先创建模型实例（延迟初始化，避免在插件加载时立即创建）
  let modelInstance: Promise<any> | null = null
  const getModel = async () => {
    if (!modelInstance) {
      modelInstance = createModel(modelConfig)
    }
    return modelInstance
  }

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
    async buildEnd(error?: Rollup.RollupError | Error) {
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
        await typeWriter(analyzing, typeWriterSpeed)
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

        // 5. 获取模型实例并调用
        const model = await getModel()
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
        await typeWriter(pc.bold(pc.green('💡 AI 诊断建议：')), typeWriterSpeed)
        process.stdout.write('\n')
        await typeWriter(pc.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'), 5)
        process.stdout.write('\n')
        
        // 逐行输出 AI 响应，保持格式
        const lines = aiResponse.split('\n')
        for (const line of lines) {
          await typeWriter(pc.white(line), typeWriterSpeed)
        }
        
        process.stdout.write('\n')
        await typeWriter(pc.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'), 5)
        process.stdout.write('\n')
        await typeWriter(pc.dim('诊断完成，请根据上述建议修复错误。'), typeWriterSpeed)
        process.stdout.write('\n')

      } catch (aiError) {
        // 异常兜底：如果 AI 调用失败
        process.stdout.write('\n')
        await typeWriter(pc.red('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'), 5)
        process.stdout.write('\n')
        await typeWriter(pc.red('❌ AI 诊断服务调用失败'), typeWriterSpeed)
        process.stdout.write('\n')
        await typeWriter(pc.yellow('请检查：'), typeWriterSpeed)
        process.stdout.write('\n')
        
        // 根据模型类型提供不同的错误提示
        const provider = modelConfig.provider
        if (provider === 'ollama') {
          await typeWriter(pc.dim('  1. Ollama 服务是否已启动（运行 ollama serve）'), typeWriterSpeed)
          process.stdout.write('\n')
          await typeWriter(pc.dim('  2. 模型是否已下载（运行 ollama pull <model>）'), typeWriterSpeed)
          process.stdout.write('\n')
          await typeWriter(pc.dim('  3. 是否安装了 @langchain/ollama 包'), typeWriterSpeed)
          process.stdout.write('\n')
        } else if (provider === 'zhipuai') {
          await typeWriter(pc.dim('  1. API Key 是否正确（检查环境变量或配置）'), typeWriterSpeed)
          process.stdout.write('\n')
          await typeWriter(pc.dim('  2. 网络连接是否正常（需要访问 open.bigmodel.cn）'), typeWriterSpeed)
          process.stdout.write('\n')
          await typeWriter(pc.dim('  3. 模型名称是否正确（如 glm-4, glm-4.7 等）'), typeWriterSpeed)
          process.stdout.write('\n')
        } else if (provider === 'openai') {
          await typeWriter(pc.dim('  1. API Key 是否正确'), typeWriterSpeed)
          process.stdout.write('\n')
          await typeWriter(pc.dim('  2. 网络连接是否正常'), typeWriterSpeed)
          process.stdout.write('\n')
          await typeWriter(pc.dim('  3. 是否安装了 @langchain/openai 包'), typeWriterSpeed)
          process.stdout.write('\n')
        } else {
          await typeWriter(pc.dim('  1. 模型配置是否正确'), typeWriterSpeed)
          process.stdout.write('\n')
          await typeWriter(pc.dim('  2. 网络连接是否正常'), typeWriterSpeed)
          process.stdout.write('\n')
        }
        
        // 输出具体错误信息
        if (aiError instanceof Error) {
          await typeWriter(pc.dim(`  错误详情: ${aiError.message}`), typeWriterSpeed)
          process.stdout.write('\n')
        }
        
        // 输出原始错误信息作为备选
        if (showOriginalError) {
          await typeWriter(pc.yellow('原始错误信息：'), typeWriterSpeed)
          process.stdout.write('\n')
          await typeWriter(pc.red(error.message), 15)
          if (error.stack) {
            await typeWriter(pc.dim(error.stack), 10)
          }
          process.stdout.write('\n')
        }
        
        await typeWriter(pc.red('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'), 5)
        process.stdout.write('\n')
      }
    },
  }
}

