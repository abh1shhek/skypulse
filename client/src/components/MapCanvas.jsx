import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { geodesicPoints } from '../lib/flightMath'

const ROUTE_STEPS = 64

function planeSvg(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0012 2a1.5 1.5 0 00-1.5 1.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/>
  </svg>`
}

function safeCode(code) {
  return String(code || '').replace(/[^A-Za-z0-9]/g, '').slice(0, 4)
}

function aircraftIcon(flight, selected) {
  const size = selected ? 22 : 14
  const rot = Math.round(flight.bearing || 0)
  const pulse = selected
    ? '<span class="ac-pulse"></span><span class="ac-pulse ac-pulse--late"></span>'
    : ''
  return L.divIcon({
    html: `<div class="ac-wrap${selected ? ' is-selected' : ''}">
      ${pulse}
      <span class="ac-disc"></span>
      <div class="ac" style="transform:rotate(${rot}deg)">${planeSvg(size)}</div>
    </div>`,
    className: 'ac-icon',
    iconSize: [56, 56],
    iconAnchor: [28, 28],
  })
}

function airportIcon(code, kind) {
  const label = safeCode(code)
  return L.divIcon({
    html: `<div class="apt apt--${kind}"><span class="apt__dot"></span><span class="apt__code">${label}</span></div>`,
    className: 'apt-icon',
    iconSize: [78, 24],
    iconAnchor: [5, 12],
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
  return `${selected ? 1 : 0}:${Math.round((flight.bearing || 0) / 2)}`
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
  const [mapReady, setMapReady] = useState(false)
  const [routeHighlight, setRouteHighlight] = useState(false)

  useEffect(() => { onSelectRef.current = onSelect }, [onSelect])
  useEffect(() => { readyCbRef.current = onReady }, [onReady])
  useEffect(() => { selectedIdRef.current = selectedId }, [selectedId])
  useEffect(() => { followRef.current = follow }, [follow])
  useEffect(() => { onFollowChangeRef.current = onFollowChange }, [onFollowChange])

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
    requestAnimationFrame(() => map.invalidateSize())

    return () => {
      map.remove()
      instanceRef.current = null
      markersRef.current = {}
      routeRef.current = null
      hudRef.current = null
      if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current)
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
          zIndexOffset: selected ? 800 : 0,
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
        }
        marker.setZIndexOffset(selected ? 800 : 0)
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
      return
    }

    const { flown, remain } = splitRoute(selected.origin, selected.dest, selected.progress)
    const path = flown.concat(remain.slice(1))
    const from = [selected.origin.lat, selected.origin.lng]
    const to = [selected.dest.lat, selected.dest.lng]
    const accent = routeHighlight ? 1 : 0.95
    const remainOp = routeHighlight ? 0.55 : 0.38

    if (!routeRef.current) {
      const group = L.layerGroup()
      const halo = L.polyline(path, {
        color: '#050506',
        weight: 6,
        opacity: 0.4,
        lineCap: 'round',
        interactive: false,
      }).addTo(group)
      const remainLine = L.polyline(remain, {
        color: '#8d7352',
        weight: 1.6,
        opacity: remainOp,
        dashArray: '4 9',
        lineCap: 'round',
        className: 'route-remain',
        interactive: false,
      }).addTo(group)
      const flownLine = L.polyline(flown, {
        color: '#c4843a',
        weight: routeHighlight ? 3.1 : 2.4,
        opacity: accent,
        lineCap: 'round',
        interactive: false,
      }).addTo(group)
      const originM = L.marker(from, {
        icon: airportIcon(selected.from, 'origin'),
        interactive: false,
        keyboard: false,
        zIndexOffset: 200,
      }).addTo(group)
      const destM = L.marker(to, {
        icon: airportIcon(selected.to, 'dest'),
        interactive: false,
        keyboard: false,
        zIndexOffset: 200,
      }).addTo(group)
      group.addTo(map)
      routeRef.current = { group, halo, remainLine, flownLine, originM, destM, from: selected.from, to: selected.to }
    } else {
      const layer = routeRef.current
      layer.halo.setLatLngs(path)
      layer.remainLine.setLatLngs(remain)
      layer.remainLine.setStyle({ opacity: remainOp, weight: routeHighlight ? 1.9 : 1.6 })
      layer.flownLine.setLatLngs(flown)
      layer.flownLine.setStyle({ opacity: accent, weight: routeHighlight ? 3.1 : 2.4 })
      layer.originM.setLatLng(from)
      layer.destM.setLatLng(to)
      if (layer.from !== selected.from) {
        layer.originM.setIcon(airportIcon(selected.from, 'origin'))
        layer.from = selected.from
      }
      if (layer.to !== selected.to) {
        layer.destM.setIcon(airportIcon(selected.to, 'dest'))
        layer.to = selected.to
      }
    }

    const here = [selected.lat, selected.lng]
    const hk = hudKey(selected)
    if (!hudRef.current) {
      hudRef.current = {
        marker: L.marker(here, {
          icon: hudIcon(selected),
          interactive: false,
          keyboard: false,
          zIndexOffset: 850,
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
