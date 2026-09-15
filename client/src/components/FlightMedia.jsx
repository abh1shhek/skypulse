import { resolveFlightImage } from '../lib/flightImage'

export default function FlightMedia({ flight, className = '' }) {
  const { src, position } = resolveFlightImage(flight)
  return (
    <div className={`flight-media ${className}`.trim()}>
      <img src={src} alt="" style={{ objectPosition: position }} />
    </div>
  )
}
