import { useEffect, useRef } from 'react'

const COORDS = {
  DEL: [28.6, 77.1], BOM: [19.1, 72.9], BLR: [13.2, 77.7],
  HYD: [17.2, 78.4], CCU: [22.6, 88.4], MAA: [12.9, 80.2],
  LHR: [51.5, -0.45], DXB: [25.2, 55.4],
}

function makeIcon(L, flight, isSelected) {
  const color = isSelected ? '#fff' : 'rgba(255,255,255,0.6)'
  const size = isSelected ? 18 : 13
  const glow = isSelected ? 'filter:drop-shadow(0 0 6px rgba(255,255,255,0.9))' : ''
  return L.divIcon({
    html: `<div style="color:${color};transform:rotate(${flight.bearing || 45}deg);${glow}">
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0012 2a1.5 1.5 0 00-1.5 1.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/>
      </svg></div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

export default function MapCanvas({ flights, selectedId, onSelect }) {
  const mapRef = useRef(null)
  const instanceRef = useRef(null)
  const markersRef = useRef({})
  const linesRef = useRef({})

  useEffect(() => {
    if (instanceRef.current || !mapRef.current) return

    const initMap = () => {
      const L = window.L
      if (!L) return

      const map = L.map(mapRef.current, {
        center: [22, 78], zoom: 5,
        zoomControl: false,
        attributionControl: false,
      })
      instanceRef.current = map

      L.tileLayer(
        'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
        { maxZoom: 20 }
      ).addTo(map)

      L.control.attribution({ prefix: false, position: 'bottomright' }).addTo(map)

      flights.forEach(f => {
        const from = COORDS[f.from]
        const to = COORDS[f.to]
        const pos = f.lat && f.lng ? [f.lat, f.lng] : from

        if (!pos) return

        // Route line
        if (from && to) {
          const line = L.polyline([from, pos, to], {
            color: 'rgba(255,255,255,0.07)',
            weight: 1,
            dashArray: '3 6',
          }).addTo(map)
          linesRef.current[f.id] = line
        }

        // Marker
        const marker = L.marker(pos, { icon: makeIcon(L, f, false) }).addTo(map)
        marker.on('click', () => onSelect(f.id))
        markersRef.current[f.id] = marker
      })
    }

    if (window.L) {
      initMap()
    } else {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)

      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.onload = initMap
      document.head.appendChild(script)
    }

    return () => {
      if (instanceRef.current) {
        instanceRef.current.remove()
        instanceRef.current = null
      }
    }
  }, [flights])

  // Update markers when selection changes
  useEffect(() => {
    if (!instanceRef.current || !window.L) return
    Object.entries(markersRef.current).forEach(([id, marker]) => {
      const flight = flights.find(f => f.id === id)
      if (!flight) return
      marker.setIcon(makeIcon(window.L, flight, id === selectedId))
    })
    if (selectedId) {
      const f = flights.find(fl => fl.id === selectedId)
      if (f?.lat && f?.lng) {
        instanceRef.current.panTo([f.lat, f.lng], { animate: true, duration: 0.6 })
      }
    }
  }, [selectedId])

  return (
    <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
  )
}