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
      <!-- Back of Card (The Kjerag Theme) -->
      <div class="card__face card__face--back">
        
        <!-- Top White Section -->
        <div class="kjerag-top">
            <div class="kjerag-pattern-text">
                <span>KIERAGARDES BLESSING</span>
                <span>KIERAGARDES BLESSING</span>
                <span>KIERAGARDES BLESSING</span>
            </div>
            <div class="brand-badge">
                <span class="brand-main">KIERAGARDES</span>
                <span class="brand-sub">BLESSING</span>
            </div>
        </div>

        <!-- Middle Divider & Emblem -->
        <div class="kjerag-divider">
            <div class="center-emblem">
                <div class="diamond-glow"></div>
                <div class="diamond-shape"></div>
                <div class="inner-cross"></div>
            </div>
        </div>

        <!-- Bottom Blue Tech Section -->
        <div class="kjerag-bottom">
            <div class="tech-lines"></div>
            <div class="bottom-code">No. 07971</div>
        </div>

      </div>

      <!-- Front/Reward Face -->
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
    transform: `rotateX(${y * 0.5}deg) rotateY(${x * 0.5}deg)`,
    '--light-pos': `${light * 100}%`,
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
  /* Taller aspect ratio approx 2:3.5 */
  aspect-ratio: 9 / 16; 
  cursor: pointer;
  transform-style: preserve-3d;
  transition: filter 0.2s ease, transform 0.3s ease;
  user-select: none;
}

.card--idle {
  animation: float 4s ease-in-out infinite;
  animation-delay: calc(var(--i) * 0.1s);
}

.card--idle.card--hover {
  transform: translateY(-8px) scale(1.02);
  filter: brightness(1.1);
  z-index: 10;
}

.card--picked {
  pointer-events: none;
}
.card--completed {
  opacity: 0.5;
  filter: grayscale(0.8);
  pointer-events: none;
}

.card__inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 4px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
}

.card__face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 4px;
  overflow: hidden;
}

/* --- Kjerag Theme Styles --- */

.card__face--back {
  background: #0f172a;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.kjerag-top {
    flex: 0 0 28%;
    background: #e2e8f0;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
}

.kjerag-pattern-text {
    position: absolute;
    inset: 0;
    opacity: 0.08;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    transform: rotate(-10deg) scale(1.2);
    pointer-events: none;
}
.kjerag-pattern-text span {
    font-size: 0.6rem;
    font-weight: 900;
    white-space: nowrap;
    text-transform: uppercase;
    color: #000;
}

.brand-badge {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #334155;
    border: 1px solid #94a3b8;
    padding: 2px 4px;
    background: rgba(255,255,255,0.6);
}
.brand-main {
    font-size: 0.45rem;
    font-weight: 800;
    letter-spacing: 0.05em;
}
.brand-sub {
    font-size: 0.35rem;
    letter-spacing: 0.15em;
}

.kjerag-divider {
    height: 2px;
    background: #3b82f6; 
    position: relative;
    z-index: 5;
    box-shadow: 0 0 8px rgba(59, 130, 246, 0.6);
}

.center-emblem {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.diamond-shape {
    width: 18px;
    height: 18px;
    background: #0f172a;
    border: 1px solid #06b6d4; 
    transform: rotate(45deg);
    box-shadow: 0 0 10px rgba(6, 182, 212, 0.5), inset 0 0 5px rgba(6, 182, 212, 0.3);
}

.diamond-glow {
    position: absolute;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(6, 182, 212, 0.8) 0%, transparent 70%);
    opacity: 0.5;
    animation: pulse 3s infinite;
}

.inner-cross {
    position: absolute;
    width: 6px;
    height: 6px;
    background: #fff;
    border-radius: 50%;
    box-shadow: 0 0 4px #fff;
}

.kjerag-bottom {
    flex: 1;
    background: linear-gradient(180deg, #1e293b 0%, #020617 100%);
    position: relative;
    overflow: hidden;
}

.tech-lines {
    position: absolute;
    inset: 0;
    background-image: 
        linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
    background-size: 10px 10px;
    mask-image: linear-gradient(to bottom, black 40%, transparent 100%);
}

.bottom-code {
    position: absolute;
    bottom: 8px;
    right: 8px;
    font-family: monospace;
    font-size: 0.5rem;
    color: rgba(148, 163, 184, 0.4);
    letter-spacing: 0.1em;
}

.card__face--front {
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.95) 0%, rgba(59, 130, 246, 0.95) 100%);
  transform: rotateY(180deg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.8rem;
  border: 1px solid rgba(255,255,255,0.2);
}

.card__reward {
  text-align: center;
  color: white;
}

.card__reward-title {
  font-size: 0.9rem;
  font-weight: 700;
  margin-bottom: 0.4rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.card__reward-desc {
  font-size: 0.75rem;
  opacity: 0.9;
  line-height: 1.3;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

@keyframes pulse {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(1.2); }
}
</style>
