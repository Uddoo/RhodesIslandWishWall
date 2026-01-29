<template>
  <Teleport to="body">
    <div v-if="card" class="picked-layer">
      <div class="picked-layer__overlay" @click="handleClose"></div>

      <div class="picked-layer__card-container" :data-stage="stage">
        <div class="picked-card">
          <div class="picked-card__inner">
            <!-- 卡背 -->
            <div class="picked-card__face picked-card__face--back">
              <div class="picked-card__back-pattern"></div>
            </div>

            <!-- 卡正面 -->
            <div class="picked-card__face picked-card__face--front">
              <div v-if="card.reward" class="picked-card__reward">
                <div class="picked-card__reward-title">{{ card.reward.title }}</div>
                <div v-if="card.reward.description" class="picked-card__reward-desc">
                  {{ card.reward.description }}
                </div>
                <div class="picked-card__reward-type">{{ card.reward.type }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { CardState, AnimationStage } from '@/types'

defineProps<{
  card: CardState | null
  stage: AnimationStage
}>()

const emit = defineEmits<{
  close: []
}>()

function handleClose() {
  emit('close')
}
</script>

<style scoped>
.picked-layer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.picked-layer__overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(3, 6, 23, 0.75);
  backdrop-filter: blur(8px);
}

.picked-layer__card-container {
  position: relative;
  z-index: 1001;
  perspective: 1000px;
}

.picked-card {
  width: 240px;
  height: 360px;
  transform-style: preserve-3d;
  animation: pickup 0.3s cubic-bezier(.34,1.56,.64,1) forwards;
}

.picked-card__inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.6s;
}

/* 翻转动画 */
[data-stage="flip_reveal"] .picked-card__inner {
  animation: flip 0.5s linear forwards;
}

@keyframes flip {
  from { transform: rotateY(0deg); }
  to { transform: rotateY(180deg); }
}

/* 结果停留 */
[data-stage="result_hold"] .picked-card {
  animation: float 0.9s ease-out forwards;
}

@keyframes float {
  0% { transform: translateY(0); }
  100% { transform: translateY(-6px); }
}

/* 完成淡出 */
[data-stage="settle_fade"] .picked-card {
  animation: fadeOut 0.4s ease-in forwards;
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

.picked-card__face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 14px;
  box-shadow: 0 14px 40px rgba(2, 6, 23, 0.5);
  overflow: hidden;
}

.picked-card__face--back {
  background:
    linear-gradient(160deg, rgba(255, 255, 255, 0.85) 0%, rgba(226, 232, 240, 0.9) 35%, rgba(30, 41, 59, 0.95) 35%, rgba(15, 23, 42, 0.98) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.4);
}

.picked-card__back-pattern {
  width: 62%;
  height: 62%;
  background:
    radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.35), transparent 55%),
    repeating-linear-gradient(45deg, rgba(148, 163, 184, 0.18), rgba(148, 163, 184, 0.18) 6px, transparent 6px, transparent 12px);
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 8px;
  transform: rotate(45deg);
}

.picked-card__face--front {
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.9) 0%, rgba(59, 130, 246, 0.9) 100%);
  transform: rotateY(180deg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: white;
}

.picked-card__reward {
  text-align: center;
}

.picked-card__reward-title {
  font-size: 1.6rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.picked-card__reward-desc {
  font-size: 1rem;
  opacity: 0.9;
  margin-bottom: 1rem;
}

.picked-card__reward-type {
  font-size: 0.875rem;
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

@keyframes pickup {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(0, -48px) scale(1.1); }
}
</style>
