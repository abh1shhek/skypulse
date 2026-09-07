import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

function planeSvg(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0012 2a1.5 1.5 0 00-1.5 1.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/>
  </svg>`
}

function makeIcon(flight, selectedId) {
  const selected = flight.uid === selectedId
  const near = !selected && flight.progress > 0.35 && flight.progress < 0.75
  const size = selected ? 20 : near ? 16 : 14
  const cls = selected ? 'ac is-selected' : near ? 'ac is-near' : 'ac'
  const ring = selected ? '<div class="ac-ring"></div>' : ''
  const rot = flight.bearing || 45
  return L.divIcon({
    html: `<div class="ac-wrap">
      ${ring}
      <div class="${cls}" style="transform:rotate(${rot}deg)">${planeSvg(size)}</div>
    </div>`,
    className: 'ac-icon',
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  })
}

function nearestFlight(map, latlng, flights) {
  let best = null
  let bestD = Infinity
  flights.forEach((f) => {
    if (f.lat == null || f.lng == null) return
    const a = map.latLngToLayerPoint(latlng)
    const b = map.latLngToLayerPoint([f.lat, f.lng])
    const d = a.distanceTo(b)
    if (d < bestD) {
      bestD = d
      best = f
    }
  })
  return bestD < 36 ? best : null
}

export default function MapCanvas({ flights, selectedId, onSelect, onReady }) {
  const mapRef = useRef(null)
  const instanceRef = useRef(null)
  const markersRef = useRef({})
  const iconStateRef = useRef({})
  const routeRef = useRef(null)
  const onSelectRef = useRef(onSelect)
  const readyCbRef = useRef(onReady)
  const flightsRef = useRef(flights)
  const selectedIdRef = useRef(selectedId)
  const highlightTimeoutRef = useRef(null)
  const [mapReady, setMapReady] = useState(false)
  const [routeHighlight, setRouteHighlight] = useState(false)

  onSelectRef.current = onSelect
  readyCbRef.current = onReady
  flightsRef.current = flights
  selectedIdRef.current = selectedId

  useEffect(() => {
    if (instanceRef.current || !mapRef.current) return

    const map = L.map(mapRef.current, {
      center: [22.5, 78.5],
      zoom: 5,
      zoomControl: false,
      attributionControl: false,
      minZoom: 3,
      maxZoom: 18,
      zoomAnimation: true,
      fadeAnimation: true,
      markerZoomAnimation: true,
      worldCopyJump: true,
    })
    instanceRef.current = map

    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19 }
    ).addTo(map)

    map.on('click', (e) => {
      const hit = nearestFlight(map, e.latlng, flightsRef.current)
      if (hit) onSelectRef.current(hit.uid)
    })

        readyCbRef.current?.({
      zoomIn: () => map.zoomIn(),
      zoomOut: () => map.zoomOut(),
      focusRoute: () => {
        const f = flightsRef.current.find((fl) => fl.uid === selectedIdRef.current)
        if (!f?.origin || !f?.dest) return
        const bounds = L.latLngBounds(
          [f.origin.lat, f.origin.lng],
          [f.dest.lat, f.dest.lng]
        )
        map.flyToBounds(bounds, { padding: [96, 96], maxZoom: 7, duration: 1 })
        setRouteHighlight(true)
        if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current)
        highlightTimeoutRef.current = setTimeout(() => setRouteHighlight(false), 1600)
      },
    })
    setMapReady(true)
    requestAnimationFrame(() => map.invalidateSize())

    return () => {
      map.remove()
      instanceRef.current = null
      markersRef.current = {}
      routeRef.current = null
      if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    const map = instanceRef.current
    if (!mapReady || !map) return

    const seen = new Set()
    flights.forEach((f) => {
      if (f.lat == null || f.lng == null) return
      seen.add(f.uid)
      const pos = [f.lat, f.lng]
      const existing = markersRef.current[f.uid]
      const iconKey = `${f.uid}:${selectedId === f.uid}`
      if (existing) {
        existing.setLatLng(pos)
        if (iconStateRef.current[f.uid] !== iconKey) {
          existing.setIcon(makeIcon(f, selectedId))
          iconStateRef.current[f.uid] = iconKey
        }
      } else {
        const marker = L.marker(pos, {
          icon: makeIcon(f, selectedId),
          riseOnHover: true,
          keyboard: true,
        }).addTo(map)
        marker.on('click', (ev) => {
          L.DomEvent.stopPropagation(ev)
          onSelectRef.current(f.uid)
        })
        markersRef.current[f.uid] = marker
        iconStateRef.current[f.uid] = iconKey
      }
    })

    Object.entries(markersRef.current).forEach(([id, marker]) => {
      if (!seen.has(id)) {
        map.removeLayer(marker)
        delete markersRef.current[id]
        delete iconStateRef.current[id]
      }
    })
  }, [flights, selectedId, mapReady])

    useEffect(() => {
    const map = instanceRef.current
    if (!mapReady || !map) return
    if (routeRef.current) {
      map.removeLayer(routeRef.current)
      routeRef.current = null
    }
    const f = flightsRef.current.find((fl) => fl.uid === selectedId)
    if (!f?.origin || !f?.dest) return
    const from = [f.origin.lat, f.origin.lng]
    const now = [f.lat, f.lng]
    const to = [f.dest.lat, f.dest.lng]
    const group = L.layerGroup()
    L.polyline([from, now, to], {
      color: routeHighlight ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.12)',
      weight: routeHighlight ? 1.6 : 1.2,
      dashArray: '2 7',
      className: routeHighlight ? 'route-line--focus' : '',
    }).addTo(group)
    L.polyline([from, now], {
      color: '#c4843a',
      weight: routeHighlight ? 3.4 : 2,
      opacity: routeHighlight ? 1 : 0.9,
      className: routeHighlight ? 'route-line--focus' : '',
    }).addTo(group)
    group.addTo(map)
    routeRef.current = group
    if (!routeHighlight) {
      map.flyTo(now, Math.max(map.getZoom(), 5.4), { duration: 0.85 })
    }
  }, [selectedId, mapReady, routeHighlight])

  return <div ref={mapRef} className="ops-map" />
}
