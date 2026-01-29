// 类型定义

export interface Reward {
  id: number
  title: string
  description?: string
  type: string
  image?: string
}

export interface CardState {
  id: number
  state: 'idle' | 'picked' | 'completed'
  reward?: Reward
}

export interface DrawResponse {
  success: boolean
  reward?: Reward
  remaining?: number
  error?: string
}

export interface Eligibility {
  eligible: boolean
  reason?: string
  remaining?: number
}

export interface TiltData {
  x: number
  y: number
  light: number
}

export type AnimationStage = 'wall_idle' | 'card_pickup' | 'flip_reveal' | 'result_hold' | 'settle_fade'
