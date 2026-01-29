import { ref, onMounted, onUnmounted } from 'vue'
import type { TiltData } from '@/types'
import { motionConfig } from '@/config/motionConfig'

/**
 * 陀螺仪倾斜交互 Composable
 * 适用于移动端，通过设备倾斜控制卡片旋转和光泽
 */
export function useTilt() {
  const tilt = ref<TiltData>({ x: 0, y: 0, light: 0 })
  const config = motionConfig.tilt

  // 低通滤波器，平滑数据
  function smoothValue(current: number, target: number): number {
    return current + (target - current) * config.smoothFactor
  }

  function handleOrientation(event: DeviceOrientationEvent) {
    if (!config.enabled) return

    // 读取陀螺仪数据
    const beta = event.beta || 0   // 前后倾斜 (-180 ~ 180)
    const gamma = event.gamma || 0 // 左右倾斜 (-90 ~ 90)

    // 限制角度范围
    const targetX = Math.max(-config.maxAngle, Math.min(config.maxAngle, gamma / 5))
    const targetY = Math.max(-config.maxAngle, Math.min(config.maxAngle, beta / 5))

    // 平滑处理
    tilt.value.x = smoothValue(tilt.value.x, targetX)
    tilt.value.y = smoothValue(tilt.value.y, targetY)

    // 计算光线偏移 (0 ~ 1)
    tilt.value.light = (tilt.value.x / config.maxAngle + 1) / 2
  }

  // 请求权限（iOS 13+ 需要）
  async function requestPermission() {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission()
        if (permission === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation)
        }
      } catch (error) {
        console.warn('陀螺仪权限请求失败:', error)
      }
    } else {
      // 非 iOS 或旧版本，直接监听
      window.addEventListener('deviceorientation', handleOrientation)
    }
  }

  // 检查是否支持陀螺仪
  const supportsOrientation = 'DeviceOrientationEvent' in window

  // 检查 prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  onMounted(() => {
    if (supportsOrientation && !prefersReducedMotion && config.enabled) {
      requestPermission()
    }
  })

  onUnmounted(() => {
    window.removeEventListener('deviceorientation', handleOrientation)
  })

  return {
    tilt,
    supportsOrientation,
    prefersReducedMotion,
  }
}
