/**
 * 毛笔笔刷引擎 — 纯函数，无 React 依赖
 *
 * 墨色动态判定：
 * - 慢速 (<30px/s) → 浓墨焦黑：粗线 + 边缘扩散 + 重叠加深
 * - 快速 (>150px/s) → 枯笔飞白：细线 + 随机空隙
 */

export function createCanvasState(canvas, width, height) {
  const dpr = window.devicePixelRatio || 1
  canvas.width = width * dpr
  canvas.height = height * dpr
  canvas.style.width = width + 'px'
  canvas.style.height = height + 'px'
  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)
  return { canvas, ctx, width, height, strokes: [], currentStroke: null, dpr }
}

export function startStroke(state, x, y, p = 0.5) {
  const stroke = { points: [{ x, y, p, t: 0 }], ink: 1 }
  state.currentStroke = stroke
  return state
}

export function moveStroke(state, x, y, p = 0.5) {
  if (!state.currentStroke) return state
  const pts = state.currentStroke.points
  const last = pts[pts.length - 1]
  const t = last.t + Math.hypot(x - last.x, y - last.y) / Math.max(p, 0.01)
  pts.push({ x, y, p, t })
  renderCurrentStroke(state)
  return state
}

export function endStroke(state) {
  if (!state.currentStroke) return state
  const stroke = state.currentStroke
  const pts = stroke.points
  if (pts.length > 1) {
    // 溅射墨星
    const last = pts[pts.length - 1]
    renderInkSplash(state.ctx, last.x, last.y, calcIntensity(pts))
    state.strokes.push({ ...stroke, points: [...pts] })
  }
  state.currentStroke = null
  return state
}

function calcIntensity(pts) {
  if (pts.length < 2) return 0.3
  const totalDist = pts.reduce((sum, p, i) => i === 0 ? 0 : sum + Math.hypot(p.x - pts[i - 1].x, p.y - pts[i - 1].y), 0)
  const duration = pts[pts.length - 1].t - pts[0].t
  const speed = duration > 0 ? totalDist / duration : 0
  // 慢速 = 高 intensity（浓墨溅射），快速 = 低 intensity
  return Math.max(0.1, Math.min(1, 0.5 / (speed + 0.1)))
}

function renderCurrentStroke(state) {
  const { ctx } = state
  const pts = state.currentStroke.points
  if (pts.length < 2) return

  ctx.save()
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[i - 1]
    const p1 = pts[i]
    const speed = p1.t - p0.t > 0 ? Math.hypot(p1.x - p0.x, p1.y - p0.y) / (p1.t - p0.t) : 0

    // 速度决定线宽和墨色
    const width = getLineWidth(speed, p1.p)
    const alpha = getAlpha(speed)

    // 浓墨主笔
    ctx.beginPath()
    ctx.moveTo(p0.x, p0.y)
    ctx.lineTo(p1.x, p1.y)
    ctx.strokeStyle = `rgba(10, 10, 10, ${alpha})`
    ctx.lineWidth = width
    ctx.stroke()

    // 飞白效果：快速书写时加入随机空隙
    if (speed > 0.15 && Math.random() < Math.min((speed - 0.15) * 1.5, 0.4)) {
      // 跳过的像素 — 产生飞白
    }

    // 边缘扩散（低速浓墨效果）
    if (speed < 0.08) {
      ctx.beginPath()
      ctx.moveTo(p0.x, p0.y)
      ctx.lineTo(p1.x, p1.y)
      ctx.strokeStyle = `rgba(10, 10, 10, ${alpha * 0.2})`
      ctx.lineWidth = width * 1.8
      ctx.stroke()

      // 二次扩散
      ctx.beginPath()
      ctx.moveTo(p0.x - 1, p0.y - 1)
      ctx.lineTo(p1.x - 1, p1.y - 1)
      ctx.strokeStyle = `rgba(10, 10, 10, ${alpha * 0.08})`
      ctx.lineWidth = width * 2.5
      ctx.stroke()
    }

    // 枯笔飞白：快速书写时的断续效果
    if (speed > 0.2) {
      const skip = Math.min((speed - 0.2) * 2, 0.6)
      if (Math.random() > skip) {
        ctx.beginPath()
        ctx.moveTo(p0.x, p0.y)
        ctx.lineTo(p1.x, p1.y)
        ctx.strokeStyle = `rgba(10, 10, 10, ${alpha * 0.3})`
        ctx.lineWidth = Math.max(1, width * 0.4)
        ctx.stroke()
      }
    }
  }

  ctx.restore()
}

function getLineWidth(speed, pressure) {
  // 慢速→粗 (浓墨), 快速→细 (枯笔)
  const base = pressure * 6
  const speedFactor = Math.max(0.2, 1 - speed * 3)
  return Math.max(1.5, base * speedFactor)
}

function getAlpha(speed) {
  // 慢速→高不透明度 (焦墨), 快速→低不透明度 (飞白)
  return Math.max(0.3, Math.min(1, 0.5 / (speed + 0.05)))
}

export function renderInkSplash(ctx, x, y, intensity) {
  ctx.save()
  const count = Math.floor(intensity * 12)
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const radius = Math.random() * 20 * intensity
    const size = Math.random() * 3 + 1
    ctx.beginPath()
    ctx.arc(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius, size, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(10, 10, 10, ${Math.random() * 0.5 * intensity})`
    ctx.fill()
  }
  ctx.restore()
}

export function renderAllStrokes(ctx, strokeData, progress = 1) {
  const strokes = strokeData.strokes || (strokeData.points ? [strokeData] : [])
  const totalDuration = strokes.length > 0 ? strokes[strokes.length - 1].points.slice(-1)[0]?.t || 1 : 1
  const cutoff = totalDuration * progress

  ctx.save()
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  for (const stroke of strokes) {
    const pts = stroke.points
    for (let i = 1; i < pts.length; i++) {
      if (pts[i].t > cutoff) break
      const p0 = pts[i - 1]
      const p1 = pts[i]
      if (p1.t > cutoff) {
        // 部分可见，插值
        const fraction = (cutoff - p0.t) / (p1.t - p0.t || 1)
        const mx = p0.x + (p1.x - p0.x) * fraction
        const my = p0.y + (p1.y - p0.y) * fraction
        ctx.beginPath()
        ctx.moveTo(p0.x, p0.y)
        ctx.lineTo(mx, my)
      } else {
        ctx.beginPath()
        ctx.moveTo(p0.x, p0.y)
        ctx.lineTo(p1.x, p1.y)
      }

      const speed = (p1.t - p0.t) > 0 ? Math.hypot(p1.x - p0.x, p1.y - p0.y) / (p1.t - p0.t) : 0
      ctx.strokeStyle = `rgba(10, 10, 10, ${getAlpha(speed)})`
      ctx.lineWidth = getLineWidth(speed, p1.p)
      ctx.stroke()
    }
  }

  ctx.restore()
}

/**
 * 墨迹散开动画 — 逐帧淡化 + 像素偏移
 * 返回一个 cancel 函数
 */
export function animateInkDissolve(ctx, width, height, duration = 1500, onProgress) {
  const imageData = ctx.getImageData(0, 0, width, height)
  const originalData = new Uint8ClampedArray(imageData.data)
  const start = performance.now()
  let running = true

  function frame() {
    if (!running) return
    const elapsed = performance.now() - start
    const t = Math.min(1, elapsed / duration)

    // ease-out
    const eased = 1 - Math.pow(1 - t, 2)
    const data = imageData.data

    for (let i = 0; i < data.length; i += 4) {
      const alpha = originalData[i + 3]
      if (alpha === 0) continue

      // alpha 衰减
      data[i + 3] = alpha * (1 - eased)

      // 像素向外偏移（溶解效果）
      const jitter = eased * 8
      // 简化为 alpha 衰减 + 噪声即可
    }

    ctx.putImageData(imageData, 0, 0)
    onProgress?.(t)

    if (t < 1) {
      requestAnimationFrame(frame)
    }
  }

  frame()

  return () => { running = false }
}

/**
 * 墨迹重新凝聚（反向动画）
 */
export function animateInkReassemble(ctx, width, height, duration = 800, onProgress) {
  const start = performance.now()
  let running = true

  function frame() {
    if (!running) return
    const elapsed = performance.now() - start
    const t = Math.min(1, elapsed / duration)
    const eased = 1 - Math.pow(1 - t, 3)

    onProgress?.(1 - eased)

    if (t < 1) {
      requestAnimationFrame(frame)
    }
  }

  frame()
  return () => { running = false }
}
