import type { DrawResponse, Eligibility } from '@/types'

const API_BASE = '/api'

/**
 * 执行抽奖
 */
export async function executeDraw(deviceId?: string): Promise<DrawResponse> {
  const response = await fetch(`${API_BASE}/draw`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ deviceId }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || '抽取失败')
  }

  return response.json()
}

/**
 * 检查抽取资格
 */
export async function checkEligibility(deviceId?: string): Promise<Eligibility> {
  const url = new URL(`${API_BASE}/eligibility`, window.location.origin)
  if (deviceId) {
    url.searchParams.set('deviceId', deviceId)
  }

  const response = await fetch(url.toString())

  if (!response.ok) {
    throw new Error('检查资格失败')
  }

  return response.json()
}

/**
 * 获取统计信息
 */
export async function getStats() {
  const response = await fetch(`${API_BASE}/stats`)

  if (!response.ok) {
    throw new Error('获取统计信息失败')
  }

  return response.json()
}
