<template>
  <section class="wish-wall" :data-stage="stage">
    <!-- HUD: 剩余次数 -->
    <div class="wall-hud">
      <div class="count-badge">
        <span class="count-text">{{ remaining }}/{{ total }}</span>
      </div>
    </div>

    <!-- 卡片网格 -->
    <div class="wall-grid">
      <Card
        v-for="card in cards"
        :key="card.id"
        :card="card"
        :tilt="tilt"
        @pick="handlePick"
      />
    </div>

    <!-- 主按钮 -->
    <button
      class="cta-button"
      :disabled="remaining === 0 || loading"
      @click="handleButtonClick"
    >
      {{ ctaText }}
    </button>

    <!-- 规则栏 -->
    <div class="rule-bar">
      <span class="rule-item">RULE1: 每日可抽取 {{ total }} 次</span>
      <span class="rule-item">活动时间: 2026-12-31</span>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="error-toast">
      {{ error }}
    </div>

    <!-- 弹出卡层 -->
    <PickedCardLayer
      :card="pickedCard"
      :stage="stage"
      @close="handleCloseLayer"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Card from './Card.vue'
import PickedCardLayer from './PickedCardLayer.vue'
import { useTilt } from '@/composables/useTilt'
import { useCardAnimation } from '@/composables/useCardAnimation'
import { useDrawLogic } from '@/composables/useDrawLogic'
import type { CardState } from '@/types'

// 组合式函数
const { tilt } = useTilt()
const { stage, playPickSequence, resetAnimation } = useCardAnimation()
const {
  cards,
  pickedCard,
  remaining,
  total,
  loading,
  error,
  initDeviceId,
  initCards,
  fetchEligibility,
  performDraw,
  completeDraw,
} = useDrawLogic()

// CTA 按钮文本
const ctaText = computed(() => {
  if (loading.value) return '抽取中...'
  if (remaining.value === 0) return '已抽取完毕'
  return '请选择许愿签'
})

// 处理卡片点击
async function handlePick(card: CardState) {
  if (loading.value || remaining.value === 0) return

  // 播放动画序列
  await playPickSequence()

  // 执行抽取
  const reward = await performDraw(card)

  if (reward) {
    // 抽取成功，等待用户关闭弹出层
  } else {
    // 抽取失败，重置动画
    resetAnimation()
  }
}

// 处理按钮点击（其实可以不用，只是为了提示）
function handleButtonClick() {
  if (remaining.value > 0) {
    console.log('请点击上方的许愿签进行抽取')
  }
}

// 处理关闭弹出层
function handleCloseLayer() {
  if (pickedCard.value) {
    completeDraw(pickedCard.value)
  }
  resetAnimation()
}

// 初始化
onMounted(async () => {
  initDeviceId()
  initCards(18) // 创建 18 张卡片
  await fetchEligibility()
})
</script>

<style scoped>
.wish-wall {
  position: relative;
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(to bottom, #1a1a2e, #16213e);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.wall-hud {
  position: absolute;
  top: 2rem;
  left: 2rem;
  z-index: 10;
}

.count-badge {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.count-text {
  color: white;
  font-size: 1.25rem;
  font-weight: bold;
}

.wall-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1.5rem;
  max-width: 1200px;
  width: 100%;
  margin: 4rem auto 2rem;
  padding: 0 1rem;
}

@media (min-width: 768px) {
  .wall-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}

.cta-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 24px;
  padding: 1rem 3rem;
  font-size: 1.125rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
  margin: 2rem 0;
}

.cta-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(102, 126, 234, 0.6);
}

.cta-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.rule-bar {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  justify-content: center;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  margin-top: auto;
}

.rule-item {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
}

.error-toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(239, 68, 68, 0.9);
  color: white;
  padding: 1rem 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translate(-50%, 100%);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}
</style>
