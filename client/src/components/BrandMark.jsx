import { useId } from 'react'

export default function BrandMark({ size = 28 }) {
  const uid = useId().replace(/:/g, '')
  const blade = `sp-blade-${uid}`
  const fin = `sp-fin-${uid}`
  const h = Math.round(size * 0.78)

  return (
    <svg
      className="brand-mark"
      width={size}
      height={h}
      viewBox="0 0 72 52"
      fill="none"
      aria-hidden="true"
    >
      <path
        fill={`url(#${blade})`}
        d="M0 34 44 20.5 38.5 32.5 2 43Z"
      />
      <path
        fill={`url(#${fin})`}
        d="M41 21.5 58 1.5 50.5 9 45 33Z"
      />
      <defs>
        <linearGradient id={blade} x1="2" y1="36" x2="42" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9AA3AE" />
          <stop offset=".5" stopColor="#E6EAF0" />
          <stop offset="1" stopColor="#fff" />
        </linearGradient>
        <linearGradient id={fin} x1="40" y1="30" x2="66" y2="4" gradientUnits="userSpaceOnUse">
          <stop stopColor="#C4843A" />
          <stop offset=".45" stopColor="#E59A3A" />
          <stop offset="1" stopColor="#F6C889" />
        </linearGradient>
      </defs>
    </svg>
  )
}
