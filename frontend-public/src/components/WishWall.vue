<template>
  <section class="wish-wall" :data-stage="stage">
    <div class="wall-panel">
      <button class="close-button" type="button" @click="handleClosePanel">×</button>

      <header class="wall-header">
        <div class="hud-label">REMAINING<br />剩余可选签数</div>
        <div class="hud-count">
          <span class="hud-value">{{ remaining }}</span>
          <span class="hud-total">/{{ total }}</span>
        </div>
      </header>

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
      <div class="panel-actions">
        <button
          class="cta-button"
          :disabled="remaining === 0 || loading"
          @click="handleButtonClick"
        >
          {{ ctaText }}
        </button>
      </div>

      <!-- 规则栏 -->
      <div class="rule-bar">
        <span class="rule-item">RULE1 用尽当日次数抽取的所有许愿签中，合成玉数量最多的1张为当日最终奖励。</span>
        <span class="rule-item">RULE2 当日许愿签合成玉奖励不足400时，次日可选择3张许愿签。</span>
        <span class="rule-item rule-item--time">结束时间 2026/12/31 03:59</span>
      </div>
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

function handleClosePanel() {
  console.log('close panel')
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
  padding: clamp(1rem, 2vw, 2rem);
  display: flex;
  align-items: center;
  justify-content: center;
  background: url('/assets/bg/wishwall_scene@1x.png') center/cover no-repeat;
  background-color: #0b0f1f;
  overflow: hidden;
}

.wish-wall::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(6, 10, 26, 0.25) 0%, rgba(6, 10, 26, 0.55) 60%, rgba(6, 10, 26, 0.8) 100%),
    radial-gradient(circle at 20% 25%, rgba(96, 165, 250, 0.18), transparent 45%),
    radial-gradient(circle at 75% 20%, rgba(167, 139, 250, 0.2), transparent 40%);
  opacity: 0.7;
  pointer-events: none;
  mix-blend-mode: normal;
}

.wall-panel {
  position: relative;
  z-index: 1;
  width: min(1180px, 100%);
  padding: clamp(1.5rem, 2.4vw, 2.5rem);
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: linear-gradient(160deg, rgba(20, 24, 60, 0.88), rgba(12, 14, 32, 0.92));
  backdrop-filter: blur(16px);
  box-shadow: 0 24px 60px rgba(6, 10, 24, 0.6);
}

.wall-panel::after {
  content: '';
  position: absolute;
  inset: 12px;
  border-radius: 14px;
  border: 1px solid rgba(124, 58, 237, 0.3);
  pointer-events: none;
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.35);
  background: rgba(15, 23, 42, 0.6);
  color: #e2e8f0;
  font-size: 1.2rem;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.close-button:hover {
  border-color: rgba(244, 63, 94, 0.7);
  background: rgba(244, 63, 94, 0.15);
}

.wall-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.hud-label {
  font-size: 0.85rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(226, 232, 240, 0.78);
  line-height: 1.4;
}

.hud-count {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  color: #e2e8f0;
}

.hud-value {
  font-size: clamp(2.2rem, 3vw, 2.8rem);
  font-weight: 700;
  color: #a78bfa;
  text-shadow: 0 0 18px rgba(167, 139, 250, 0.6);
}

.hud-total {
  font-size: 1rem;
  color: rgba(226, 232, 240, 0.7);
}

.wall-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(120px, 1fr));
  gap: clamp(0.8rem, 1.4vw, 1.4rem);
  width: 100%;
  padding: clamp(1.5rem, 3vw, 2.5rem) 0;
  transform: rotate(-5deg) skewX(-4deg);
}

@media (max-width: 1024px) {
  .wall-grid {
    grid-template-columns: repeat(4, minmax(110px, 1fr));
    transform: rotate(-4deg) skewX(-3deg);
  }
}

@media (max-width: 768px) {
  .wall-grid {
    grid-template-columns: repeat(3, minmax(100px, 1fr));
    transform: none;
  }
}

.panel-actions {
  display: flex;
  justify-content: flex-end;
  padding-bottom: 1rem;
}

.cta-button {
  background: rgba(226, 232, 240, 0.08);
  color: #e2e8f0;
  border: 1px solid rgba(226, 232, 240, 0.6);
  border-radius: 8px;
  padding: 0.75rem 1.75rem;
  font-size: 0.95rem;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.cta-button:hover:not(:disabled) {
  background: rgba(124, 58, 237, 0.2);
  border-color: rgba(124, 58, 237, 0.8);
  color: #f8fafc;
}

.cta-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.rule-bar {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 1.5rem;
  align-items: center;
  padding: 1rem 0 0;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.rule-item {
  color: rgba(226, 232, 240, 0.7);
  font-size: 0.78rem;
  line-height: 1.4;
}

.rule-item--time {
  color: rgba(226, 232, 240, 0.85);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  justify-self: end;
}

@media (max-width: 900px) {
  .rule-bar {
    grid-template-columns: 1fr;
  }

  .rule-item--time {
    justify-self: start;
  }
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
