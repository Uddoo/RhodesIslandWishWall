<template>
  <div
    class="card"
    :class="[`card--${state}`, { 'card--hover': isHovering && state === 'idle' }]"
    :style="tiltStyle"
    @click="handleClick"
    @mouseenter="isHovering = true"
    @mouseleave="isHovering = false"
  >
    <div class="card__inner">
      <!-- 卡背 -->
      <div class="card__face card__face--back">
        <div class="card__brand">
          <span class="card__brand-mark">RHODES ISLAND</span>
          <span class="card__brand-sub">RHINE LAB • ARK</span>
        </div>
        <div class="card__back-pattern"></div>
        <div class="card__back-glow"></div>
      </div>

      <!-- 卡正面（结果） -->
      <div v-if="reward" class="card__face card__face--front">
        <div class="card__reward">
          <div class="card__reward-title">{{ reward.title }}</div>
          <div v-if="reward.description" class="card__reward-desc">
            {{ reward.description }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { CardState, TiltData } from '@/types'

const props = defineProps<{
  card: CardState
  tilt?: TiltData
}>()

const emit = defineEmits<{
  pick: [card: CardState]
}>()

const isHovering = ref(false)

const state = computed(() => props.card.state)
const reward = computed(() => props.card.reward)

const tiltStyle = computed(() => {
  if (!props.tilt) return {}

  const { x, y, light } = props.tilt

  return {
    transform: `rotateX(${y}deg) rotateY(${x}deg)`,
    '--light-position': `${light * 100}%`,
  }
})

function handleClick() {
  if (state.value === 'idle') {
    emit('pick', props.card)
  }
}
</script>

<style scoped>
.card {
  position: relative;
  width: 100%;
  aspect-ratio: 2.2 / 3;
  cursor: pointer;
  transform-style: preserve-3d;
  transition: filter 0.2s ease, box-shadow 0.2s ease;
}

.card--idle {
  animation: sway 3s ease-in-out infinite;
}

.card--idle.card--hover {
  filter: brightness(1.08);
  box-shadow: 0 10px 24px rgba(124, 58, 237, 0.25);
}

.card--picked {
  pointer-events: none;
}

.card--completed {
  opacity: 0.6;
  pointer-events: none;
}

.card__inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.6s;
}

.card__face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 10px;
  overflow: hidden;
}

.card__face--back {
  background:
    linear-gradient(160deg, rgba(255, 255, 255, 0.8) 0%, rgba(234, 234, 244, 0.9) 35%, rgba(36, 46, 89, 0.95) 35%, rgba(15, 20, 45, 0.98) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.25);
}

.card__brand {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  color: rgba(153, 27, 27, 0.8);
  font-size: 0.55rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.card__brand-sub {
  color: rgba(71, 85, 105, 0.85);
  font-size: 0.5rem;
}

.card__back-pattern {
  width: 62%;
  height: 62%;
  background:
    radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.35), transparent 55%),
    repeating-linear-gradient(45deg, rgba(148, 163, 184, 0.15), rgba(148, 163, 184, 0.15) 6px, transparent 6px, transparent 12px);
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 8px;
  position: relative;
  transform: rotate(45deg);
}

.card__back-pattern::after {
  content: '';
  position: absolute;
  inset: 12px;
  border: 1px solid rgba(56, 189, 248, 0.35);
  border-radius: 6px;
}

.card__back-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 60% 40%, rgba(56, 189, 248, 0.25), transparent 50%);
  mix-blend-mode: screen;
  pointer-events: none;
}

.card__face--front {
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.9) 0%, rgba(59, 130, 246, 0.9) 100%);
  transform: rotateY(180deg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.card__reward {
  text-align: center;
  color: white;
}

.card__reward-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.card__reward-desc {
  font-size: 0.875rem;
  opacity: 0.9;
}

@keyframes sway {
  0%, 100% { transform: rotate(-1deg); }
  50% { transform: rotate(1deg); }
}
</style>
