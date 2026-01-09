/**
 * 工具函数模块
 */

/**
 * 延迟函数
 * @param ms 延迟毫秒数
 */
export function sleep(ms: number): Promise<void> {
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
export async function typeWriter(text: string, speed: number = 20): Promise<void> {
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

