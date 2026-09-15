import { useState } from 'react'
import { airlineInitials, airlineLogoSrc } from '../lib/airlineLogo'
import cabin from '../assets/aircraft-hero.png'

export default function AirlineLogo({ airline, size = 28 }) {
  const src = airlineLogoSrc(airline)
  const [failedFor, setFailedFor] = useState(null)
  const failed = failedFor === airline

  if (!src || failed) {
    return (
      <span className="airline-logo airline-logo--mark" style={{ width: size, height: size }} aria-hidden="true">
        {airlineInitials(airline)}
      </span>
    )
  }

  return (
    <img
      className="airline-logo"
      src={src}
      alt=""
      width={size}
      height={size}
      onError={() => setFailedFor(airline)}
    />
  )
}

export function AirlineBrand({ airline }) {
  const src = airlineLogoSrc(airline)
  const [failedFor, setFailedFor] = useState(null)
  const failed = failedFor === airline

  if (!src || failed) {
    return (
      <div className="detail__visual flight-media">
        <img src={cabin} alt="" />
      </div>
    )
  }

  return (
    <div className="detail__brand" aria-hidden="true">
      <img src={src} alt="" onError={() => setFailedFor(airline)} />
    </div>
  )
}
