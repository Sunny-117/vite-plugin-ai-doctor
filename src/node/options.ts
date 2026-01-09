/**
 * 插件选项类型定义
 */

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
}

