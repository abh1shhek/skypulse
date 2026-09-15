import { useState } from 'react'
import { airlineInitials, airlineLogoSrc } from '../lib/airlineLogo'

export default function AirlineLogo({ airline, size = 28 }) {
  const src = airlineLogoSrc(airline)
  const [failed, setFailed] = useState(false)

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
      onError={() => setFailed(true)}
    />
  )
}
