// 动效配置参数

export const motionConfig = {
  idle: {
    swayDuration: 3000, // 轻摆动画时长 (ms)
    swayAmplitude: 1.5, // 摆动幅度 (deg)
    hoverScale: 1.03,   // 悬停放大倍数
    hoverGlow: 0.2,     // 悬停光泽强度
  },
  pickup: {
    duration: 300,      // 弹出动画时长 (ms)
    easing: 'cubic-bezier(.34,1.56,.64,1)', // 缓动函数
    lift: 48,           // 抬起高度 (px)
  },
  flip: {
    duration: 500,      // 翻转动画时长 (ms)
    easing: 'linear',   // 缓动函数
    perspective: 900,   // 3D 透视距离 (px)
  },
  reveal: {
    duration: 900,      // 结果展示时长 (ms)
    easing: 'ease-out', // 缓动函数
    floatY: -6,         // 浮起高度 (px)
  },
  settle: {
    duration: 400,      // 完成淡出时长 (ms)
    easing: 'ease-in',  // 缓动函数
    fadeTo: 0.6,        // 淡出目标透明度
  },
  tilt: {
    enabled: true,      // 是否启用陀螺仪倾斜
    maxAngle: 6,        // 最大倾斜角度 (deg)
    smoothFactor: 0.08, // 平滑系数 (0-1)
    lightShift: 0.25,   // 光线偏移系数
  },
}

export default motionConfig
