import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { geodesicPoints } from '../lib/flightMath'

const ROUTE_STEPS = 64

function cssToken(name, fallback) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

function planeSvg(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0012 2a1.5 1.5 0 00-1.5 1.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/>
  </svg>`
}

function safeCode(code) {
  return String(code || '').replace(/[^A-Za-z0-9]/g, '').slice(0, 4)
}

function aircraftIcon(flight, selected) {
  const size = selected ? 28 : 14
  const rot = Math.round(flight.bearing || 0)
  const pulse = selected
    ? '<span class="ac-pulse"></span><span class="ac-pulse ac-pulse--late"></span>'
    : ''
  const box = selected ? 72 : 48
  const anchor = box / 2
  return L.divIcon({
    html: `<div class="ac-wrap${selected ? ' is-selected' : ''}" style="width:${box}px;height:${box}px">
      ${pulse}
      <div class="ac" style="transform:rotate(${rot}deg)">${planeSvg(size)}</div>
    </div>`,
    className: 'ac-icon',
    iconSize: [box, box],
    iconAnchor: [anchor, anchor],
  })
}

function airportIcon(code, kind) {
  const label = safeCode(code)
  return L.divIcon({
    html: `<div class="apt apt--${kind}"><span class="apt__dot"></span><span class="apt__code">${label}</span></div>`,
    className: 'apt-icon',
    iconSize: [92, 28],
    iconAnchor: [6, 14],
  })
}

function toFeet(meters) {
  return Math.round((Number(meters) || 0) * 3.28084)
}

function hudIcon(flight) {
  const id = String(flight.id || '').replace(/[<>&]/g, '')
  const alt = toFeet(flight.alt).toLocaleString()
  const spd = Math.round(flight.speed || 0).toLocaleString()
  return L.divIcon({
    html: `<div class="ac-hud">
      <strong>${id}</strong>
      <span>${alt} ft</span>
      <span>${spd} km/h</span>
    </div>`,
    className: 'ac-hud-icon',
    iconSize: [92, 52],
    iconAnchor: [-16, 26],
  })
}

function hudKey(flight) {
  return `${flight.id}:${Math.round((flight.alt || 0) / 40)}:${Math.round((flight.speed || 0) / 12)}`
}

function iconKey(flight, selected) {
  return selected ? '1' : '0'
}

function setAircraftRotation(marker, bearing) {
  const el = marker.getElement()?.querySelector('.ac')
  if (el) el.style.transform = `rotate(${Math.round(bearing || 0)}deg)`
}

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

function revealPath(pts, t) {
  if (!pts.length) return []
  if (t >= 1 || pts.length < 2) return pts
  if (t <= 0) return [pts[0]]
  const span = pts.length - 1
  const f = t * span
  const i = Math.min(span - 1, Math.floor(f))
  const frac = f - i
  const out = pts.slice(0, i + 1)
  const a = pts[i]
  const b = pts[i + 1]
  out.push([a[0] + (b[0] - a[0]) * frac, a[1] + (b[1] - a[1]) * frac])
  return out
}

function drawSplit(flown, remain, t) {
  const path = flown.concat(remain.slice(1))
  if (t >= 1) return { flown, remain, path }
  const drawn = revealPath(path, t)
  const cut = Math.max(0, flown.length - 1)
  if (drawn.length <= 1) return { flown: drawn, remain: [], path }
  if (drawn.length - 1 <= cut) return { flown: drawn, remain: [], path }
  return {
    flown: flown.length ? flown : [drawn[0]],
    remain: drawn.slice(cut),
    path: drawn,
  }
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

function splitRoute(origin, dest, progress) {
  const pts = geodesicPoints(origin, dest, ROUTE_STEPS).map((p) => [p.lat, p.lng])
  const t = Math.max(0.02, Math.min(0.98, progress || 0))
  const cut = Math.max(1, Math.round(t * (pts.length - 1)))
  return {
    flown: pts.slice(0, cut + 1),
    remain: pts.slice(cut),
  }
}

export default function MapCanvas({ flights, selectedId, onSelect, onReady, follow = false, onFollowChange }) {
  const mapRef = useRef(null)
  const instanceRef = useRef(null)
  const markersRef = useRef({})
  const iconStateRef = useRef({})
  const routeRef = useRef(null)
  const hudRef = useRef(null)
  const onSelectRef = useRef(onSelect)
  const readyCbRef = useRef(onReady)
  const selectedIdRef = useRef(selectedId)
  const followRef = useRef(follow)
  const onFollowChangeRef = useRef(onFollowChange)
  const highlightTimeoutRef = useRef(null)
  const lastFitRef = useRef(null)
  const drawRef = useRef({ key: null, t: 1, start: 0, raf: 0 })
  const [mapReady, setMapReady] = useState(false)
  const [routeHighlight, setRouteHighlight] = useState(false)

  useEffect(() => { onSelectRef.current = onSelect }, [onSelect])
  useEffect(() => { readyCbRef.current = onReady }, [onReady])
  useEffect(() => { selectedIdRef.current = selectedId }, [selectedId])
  useEffect(() => { followRef.current = follow }, [follow])
  useEffect(() => { onFollowChangeRef.current = onFollowChange }, [onFollowChange])

  useLayoutEffect(() => {
    const el = mapRef.current
    if (instanceRef.current || !el) return

    const map = L.map(el, {
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

    map.on('dragstart', () => {
      if (followRef.current) onFollowChangeRef.current?.(false)
    })
    map.on('click', (e) => {
      const hit = nearestFlight(map, e.latlng, Object.values(markersRef.current).map((m) => m._flight).filter(Boolean))
      if (hit) onSelectRef.current(hit.uid)
    })

    readyCbRef.current?.({
      zoomIn: () => map.zoomIn(),
      zoomOut: () => map.zoomOut(),
      focusRoute: () => {
        onFollowChangeRef.current?.(false)
        const f = Object.values(markersRef.current).find((m) => m._flight?.uid === selectedIdRef.current)?._flight
        if (!f?.origin || !f?.dest) return
        const bounds = L.latLngBounds(
          [f.origin.lat, f.origin.lng],
          [f.dest.lat, f.dest.lng]
        ).extend([f.lat, f.lng])
        map.flyToBounds(bounds, { padding: [88, 88], maxZoom: 6.2, duration: 1 })
        setRouteHighlight(true)
        if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current)
        highlightTimeoutRef.current = setTimeout(() => setRouteHighlight(false), 1600)
      },
    })
    setMapReady(true)
    map.invalidateSize()
    const ro = new ResizeObserver(() => map.invalidateSize())
    ro.observe(el)

    return () => {
      ro.disconnect()
      map.remove()
      instanceRef.current = null
      markersRef.current = {}
      routeRef.current = null
      hudRef.current = null
      if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current)
      if (drawRef.current.raf) cancelAnimationFrame(drawRef.current.raf)
    }
  }, [])

  useEffect(() => {
    const map = instanceRef.current
    if (!mapReady || !map) return

    const live = new Set()
    flights.forEach((flight) => {
      if (flight.lat == null || flight.lng == null) return
      live.add(flight.uid)
      const selected = flight.uid === selectedId
      const key = iconKey(flight, selected)
      let marker = markersRef.current[flight.uid]
      if (!marker) {
        marker = L.marker([flight.lat, flight.lng], {
          icon: aircraftIcon(flight, selected),
          keyboard: false,
          zIndexOffset: selected ? 1200 : 40,
        })
        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e)
          onSelectRef.current(flight.uid)
        })
        marker.addTo(map)
        markersRef.current[flight.uid] = marker
        iconStateRef.current[flight.uid] = key
      } else {
        marker.setLatLng([flight.lat, flight.lng])
        if (iconStateRef.current[flight.uid] !== key) {
          marker.setIcon(aircraftIcon(flight, selected))
          iconStateRef.current[flight.uid] = key
        } else {
          setAircraftRotation(marker, flight.bearing)
        }
        marker.setZIndexOffset(selected ? 1200 : 40)
      }
      marker._flight = flight
    })

    Object.keys(markersRef.current).forEach((id) => {
      if (live.has(id)) return
      map.removeLayer(markersRef.current[id])
      delete markersRef.current[id]
      delete iconStateRef.current[id]
    })

    const selected = flights.find((f) => f.uid === selectedId)
    if (!selected?.origin || !selected?.dest) {
      if (routeRef.current) {
        map.removeLayer(routeRef.current.group)
        routeRef.current = null
      }
      if (hudRef.current) {
        map.removeLayer(hudRef.current.marker)
        hudRef.current = null
      }
      if (drawRef.current.raf) cancelAnimationFrame(drawRef.current.raf)
      drawRef.current.key = null
      return
    }

    const from = [selected.origin.lat, selected.origin.lng]
    const to = [selected.dest.lat, selected.dest.lng]
    const amber = cssToken('--route-flown', '#e59a3a')
    const steel = cssToken('--route-remain', '#7896c2')
    const remainOp = routeHighlight ? 0.55 : 0.38
    const flownW = routeHighlight ? 2.4 : 2
    const remainW = routeHighlight ? 1.8 : 1.5
    const DRAW_MS = 820
    const lineOpts = { lineCap: 'round', interactive: false, smoothFactor: 0 }

    const paintRoute = (flight, t) => {
      const split = splitRoute(flight.origin, flight.dest, flight.progress)
      const drawn = drawSplit(split.flown, split.remain, t)
      const origin = [flight.origin.lat, flight.origin.lng]
      const dest = [flight.dest.lat, flight.dest.lng]
      if (!routeRef.current) {
        const group = L.layerGroup()
        const halo = L.polyline(drawn.path, {
          ...lineOpts,
          color: steel,
          weight: 4,
          opacity: 0.08,
        }).addTo(group)
        const remainLine = L.polyline(drawn.remain, {
          ...lineOpts,
          color: steel,
          weight: remainW,
          opacity: remainOp,
          dashArray: '4 8',
          className: 'route-remain',
        }).addTo(group)
        const flownLine = L.polyline(drawn.flown, {
          ...lineOpts,
          color: amber,
          weight: flownW,
          opacity: 0.82,
          className: 'route-flown',
        }).addTo(group)
        const originM = L.marker(origin, {
          icon: airportIcon(flight.from, 'origin'),
          interactive: false,
          keyboard: false,
          zIndexOffset: 200,
        }).addTo(group)
        const destM = L.marker(dest, {
          icon: airportIcon(flight.to, 'dest'),
          interactive: false,
          keyboard: false,
          zIndexOffset: 200,
        }).addTo(group)
        group.addTo(map)
        routeRef.current = { group, halo, remainLine, flownLine, originM, destM, from: flight.from, to: flight.to }
        return
      }
      const layer = routeRef.current
      layer.halo.options.smoothFactor = 0
      layer.remainLine.options.smoothFactor = 0
      layer.flownLine.options.smoothFactor = 0
      layer.halo.setLatLngs(drawn.path)
      layer.remainLine.setLatLngs(drawn.remain)
      layer.halo.setStyle({ color: steel, opacity: 0.08, weight: 4 })
      layer.remainLine.setStyle({ color: steel, opacity: remainOp, weight: remainW })
      layer.flownLine.setLatLngs(drawn.flown)
      layer.flownLine.setStyle({ color: amber, opacity: 0.82, weight: flownW })
      layer.originM.setLatLng(origin)
      layer.destM.setLatLng(dest)
      if (layer.from !== flight.from) {
        layer.originM.setIcon(airportIcon(flight.from, 'origin'))
        layer.from = flight.from
      }
      if (layer.to !== flight.to) {
        layer.destM.setIcon(airportIcon(flight.to, 'dest'))
        layer.to = flight.to
      }
    }

    const routeKey = `${selected.uid}:${selected.from}:${selected.to}`
    const reduced = prefersReducedMotion()
    if (drawRef.current.key !== routeKey) {
      if (drawRef.current.raf) cancelAnimationFrame(drawRef.current.raf)
      drawRef.current.key = routeKey
      drawRef.current.t = reduced ? 1 : 0
      drawRef.current.start = performance.now()
      if (!reduced && routeRef.current) {
        routeRef.current.halo.setLatLngs([])
        routeRef.current.flownLine.setLatLngs([])
        routeRef.current.remainLine.setLatLngs([])
      }
      if (!reduced) {
        const tickDraw = (now) => {
          if (drawRef.current.key !== routeKey) return
          const t = Math.min(1, (now - drawRef.current.start) / DRAW_MS)
          const eased = 1 - (1 - t) ** 3
          drawRef.current.t = eased
          const live = markersRef.current[selected.uid]?._flight || selected
          if (live?.origin && live?.dest) paintRoute(live, eased)
          if (t < 1) drawRef.current.raf = requestAnimationFrame(tickDraw)
        }
        drawRef.current.raf = requestAnimationFrame(tickDraw)
      }
    }
    paintRoute(selected, drawRef.current.t)

    const here = [selected.lat, selected.lng]
    const hk = hudKey(selected)
    if (!hudRef.current) {
      hudRef.current = {
        marker: L.marker(here, {
          icon: hudIcon(selected),
          interactive: false,
          keyboard: false,
          zIndexOffset: 1400,
        }).addTo(map),
        key: hk,
      }
    } else {
      hudRef.current.marker.setLatLng(here)
      if (hudRef.current.key !== hk) {
        hudRef.current.marker.setIcon(hudIcon(selected))
        hudRef.current.key = hk
      }
    }

    if (follow) {
      map.panTo(here, { animate: true, duration: 0.28, easeLinearity: 0.35 })
      lastFitRef.current = selectedId
    } else if (lastFitRef.current !== selectedId && !routeHighlight) {
      lastFitRef.current = selectedId
      const bounds = L.latLngBounds(from, to).extend(here)
      map.flyToBounds(bounds, { padding: [88, 88], maxZoom: 6.2, duration: 0.85 })
    }
  }, [flights, selectedId, mapReady, routeHighlight, follow])

  return <div ref={mapRef} className="ops-map" />
}
