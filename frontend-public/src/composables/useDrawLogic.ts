import { ref } from 'vue'
import { executeDraw, checkEligibility } from '@/api/draw'
import type { CardState, Reward } from '@/types'

/**
 * 抽取逻辑 Composable
 * 管理抽取流程、状态和与后端的交互
 */
export function useDrawLogic() {
  const cards = ref<CardState[]>([])
  const pickedCard = ref<CardState | null>(null)
  const remaining = ref(2)
  const total = ref(2)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 设备 ID (简单实现，使用 localStorage)
  const deviceId = ref<string>('')

  /**
   * 初始化设备 ID
   */
  function initDeviceId() {
    let id = localStorage.getItem('deviceId')
    if (!id) {
      id = 'device_' + Math.random().toString(36).substr(2, 9) + Date.now()
      localStorage.setItem('deviceId', id)
    }
    deviceId.value = id
  }

  /**
   * 初始化卡片网格
   */
  function initCards(count: number = 18) {
    cards.value = Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      state: 'idle',
    }))
  }

  /**
   * 检查抽取资格
   */
  async function fetchEligibility() {
    try {
      const result = await checkEligibility(deviceId.value)
      if (result.eligible && result.remaining !== undefined) {
        remaining.value = result.remaining
        total.value = result.remaining // 假设 total 与 remaining 初始值相同
      } else {
        error.value = result.reason || '无法抽取'
      }
      return result.eligible
    } catch (err: any) {
      error.value = err.message
      return false
    }
  }

  /**
   * 执行抽取
   */
  async function performDraw(card: CardState): Promise<Reward | null> {
    if (loading.value) return null
    if (remaining.value <= 0) {
      error.value = '抽取次数已用完'
      return null
    }

    loading.value = true
    error.value = null

    try {
      const result = await executeDraw(deviceId.value)

      if (result.success && result.reward) {
        // 更新剩余次数
        if (result.remaining !== undefined) {
          remaining.value = result.remaining
        } else {
          remaining.value = Math.max(0, remaining.value - 1)
        }

        // 更新卡片状态
        card.state = 'picked'
        card.reward = result.reward
        pickedCard.value = card

        return result.reward
      } else {
        error.value = result.error || '抽取失败'
        return null
      }
    } catch (err: any) {
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * 完成抽取（标记卡片为已完成）
   */
  function completeDraw(card: CardState) {
    card.state = 'completed'
    pickedCard.value = null
  }

  /**
   * 重置所有状态
   */
  function reset() {
    cards.value.forEach((card) => {
      card.state = 'idle'
      card.reward = undefined
    })
    pickedCard.value = null
    error.value = null
    fetchEligibility()
  }

  return {
    cards,
    pickedCard,
    remaining,
    total,
    loading,
    error,
    deviceId,
    initDeviceId,
    initCards,
    fetchEligibility,
    performDraw,
    completeDraw,
    reset,
  }
}
