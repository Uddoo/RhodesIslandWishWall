import { ref } from 'vue'
import type { AnimationStage } from '@/types'
import { motionConfig } from '@/config/motionConfig'

/**
 * 卡片动画 Composable
 * 管理卡片动画的时序和状态
 */
export function useCardAnimation() {
  const stage = ref<AnimationStage>('wall_idle')

  // 延迟工具函数
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  /**
   * 播放完整的抽取动画序列
   */
  async function playPickSequence(callback?: (stage: AnimationStage) => void) {
    // 1. 弹出
    stage.value = 'card_pickup'
    callback?.('card_pickup')
    await delay(motionConfig.pickup.duration)

    // 2. 翻转
    stage.value = 'flip_reveal'
    callback?.('flip_reveal')
    await delay(motionConfig.flip.duration)

    // 3. 结果展示
    stage.value = 'result_hold'
    callback?.('result_hold')
    await delay(motionConfig.reveal.duration)

    // 4. 淡出
    stage.value = 'settle_fade'
    callback?.('settle_fade')
    await delay(motionConfig.settle.duration)

    // 5. 返回初始状态
    stage.value = 'wall_idle'
    callback?.('wall_idle')
  }

  /**
   * 重置动画状态
   */
  function resetAnimation() {
    stage.value = 'wall_idle'
  }

  return {
    stage,
    playPickSequence,
    resetAnimation,
  }
}
