import { useEffect, useRef, useState } from 'react'

export default function AnimatedNumber({ value, format, duration = 700 }) {
  const [shown, setShown] = useState(value || 0)
  const fromRef = useRef(value || 0)

  useEffect(() => {
    const from = fromRef.current
    const to = Number(value) || 0
    if (from === to) return
    const start = performance.now()
    let raf
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      const next = from + (to - from) * eased
      setShown(next)
      if (t < 1) raf = requestAnimationFrame(step)
      else fromRef.current = to
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])

  return <span className="num">{format ? format(shown) : Math.round(shown)}</span>
}
