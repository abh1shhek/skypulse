import mark from '../assets/skypulse-mark.png'

export default function BrandMark({ size = 44 }) {
  const h = Math.round(size * (682 / 1024))
  return (
    <img
      className="brand-mark"
      src={mark}
      alt=""
      width={size}
      height={h}
      draggable="false"
    />
  )
}
