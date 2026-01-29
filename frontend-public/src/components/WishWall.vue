<template>
  <section class="wish-wall" :data-stage="stage">
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
    <button
      class="cta-button"
      :disabled="remaining === 0 || loading"
      @click="handleButtonClick"
    >
      {{ ctaText }}
    </button>

    <!-- 规则栏 -->
    <div class="rule-bar">
      <span class="rule-item">RULE1 用尽当日次数抽取的所有许愿签中，合成玉数量最多的1张为当日最终奖励。</span>
      <span class="rule-item">RULE2 当日许愿签合成玉奖励不足400时，次日可选择3张许愿签。</span>
      <span class="rule-item rule-item--time">结束时间 2026/2/2 03:59</span>
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
  initCards(10) // 创建 10 张卡片 (2排5列)
  await fetchEligibility()
})
</script>

<style scoped>
.wish-wall {
  position: relative;
  width: 100%;
  min-height: 100vh;
  padding: clamp(1.2rem, 2vw, 2rem) clamp(1.2rem, 3vw, 3rem) 4.5rem;
  display: flex;
  flex-direction: column;
  background-color: #0b0f1f;
  overflow: hidden;
}

/* 模糊遮罩层 */
.wish-wall::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(11, 15, 31, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  pointer-events: none;
  z-index: 0;
}

/* 背景图片层 */
.wish-wall::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 1800px;
  height: 880px;
  max-width: 95vw;
  max-height: calc(95vw * 880 / 1800);
  background: url('/assets/bg/wishwall_scene@1x.png') center/contain no-repeat;
  background-size: 100% 100%;
  opacity: 0.85;
  pointer-events: none;
  z-index: 0;
}

.wall-header {
  position: absolute;
  top: clamp(1.4rem, 3vw, 2.4rem);
  left: clamp(1.6rem, 3vw, 3rem);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  z-index: 10;
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
  grid-template-columns: repeat(5, minmax(120px, 1fr));
  grid-template-rows: repeat(2, minmax(140px, 1fr));
  gap: clamp(0.6rem, 1.2vw, 1rem);
  width: min(900px, 92vw);
  margin: clamp(4.5rem, 10vh, 6.5rem) auto 0;
  transform: rotate(-5deg) skewX(-4deg);
  align-self: center;
  z-index: 10;
}

.cta-button {
  position: absolute;
  right: clamp(2rem, 5vw, 5rem);
  bottom: clamp(5.5rem, 10vh, 7rem);
  background: rgba(226, 232, 240, 0.12);
  color: #e2e8f0;
  border: 1px solid rgba(226, 232, 240, 0.65);
  border-radius: 6px;
  padding: 0.75rem 2.2rem;
  font-size: 0.95rem;
  letter-spacing: 0.12em;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
  z-index: 10;
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
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  display: grid;
  grid-template-columns: 1.2fr 1.2fr auto;
  gap: 1.2rem;
  align-items: center;
  padding: 0.9rem clamp(1.2rem, 3vw, 3rem);
  background: rgba(8, 12, 30, 0.7);
  border-top: 1px solid rgba(255, 255, 255, 0.18);
  z-index: 10;
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

@media (max-width: 1024px) {
  .wall-grid {
    grid-template-columns: repeat(5, minmax(110px, 1fr));
    grid-template-rows: repeat(2, minmax(120px, 1fr));
    transform: rotate(-4deg) skewX(-3deg);
    width: min(800px, 94vw);
  }

  .cta-button {
    bottom: clamp(6rem, 12vh, 7.5rem);
  }
}

@media (max-width: 768px) {
  .wall-grid {
    grid-template-columns: repeat(5, minmax(90px, 1fr));
    grid-template-rows: repeat(2, minmax(100px, 1fr));
    transform: none;
  }

  .cta-button {
    position: static;
    align-self: center;
    margin-top: 1rem;
  }

  .rule-bar {
    position: static;
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
