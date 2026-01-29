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
        <div class="card__back-pattern"></div>
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
  aspect-ratio: 2 / 3;
  cursor: pointer;
  transform-style: preserve-3d;
  transition: transform 0.3s ease;
}

.card--idle {
  animation: sway 3s ease-in-out infinite;
}

.card--idle.card--hover {
  transform: scale(1.03);
  filter: brightness(1.1);
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
  border-radius: 8px;
  overflow: hidden;
}

.card__face--back {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card__back-pattern {
  width: 60%;
  height: 60%;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.card__face--front {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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
  font-size: 1.25rem;
  font-weight: bold;
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
