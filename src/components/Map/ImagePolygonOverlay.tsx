import { useMemo, useRef, useState } from 'react'

type Point = { x: number; y: number }

export type PolygonTooltip = {
  title: string
  description?: string
  metrics?: Array<{ label: string; value: string }>
}

type PolygonLabelStyle = {
  fontSize?: number
  fontWeight?: number
  fill?: string
  stroke?: string
  strokeWidth?: number
}

export type OverlayPolygon = {
  id: string
  points: string | Point[]
  stroke?: string
  strokeWidth?: number
  fill?: string
  hoverFill?: string
  title?: string
  label?: string
  showLabel?: boolean
  labelStyle?: PolygonLabelStyle
  cursor?: 'default' | 'pointer' | 'crosshair' | 'move'
  onClick?: (id: string) => void
  tooltip?: PolygonTooltip
}

export type ImagePolygonOverlayProps = {
  imageSrc: string
  alt?: string
  width?: number | string
  polygons: OverlayPolygon[]
  defaultFill?: string
  defaultHoverFill?: string
  defaultStroke?: string
  defaultStrokeWidth?: number
  onPolygonClick?: (id: string) => void
  onHoverChange?: (id: string | null) => void
}

function toPointsString(points: string | Point[]) {
  if (typeof points === 'string') return points
  return points.map((p) => `${p.x},${p.y}`).join(' ')
}

function toPointArray(points: string | Point[]): Point[] {
  if (typeof points !== 'string') return points
  return points
    .trim()
    .split(/\s+/)
    .map((pair) => {
      const [xStr, yStr] = pair.split(',')
      return { x: Number(xStr), y: Number(yStr) }
    })
    .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y))
}

function polygonCentroid(points: Point[]): Point | null {
  if (points.length < 3) return null

  // centróide por área (Shoelace). Mais estável que média simples em polígonos irregulares.
  let a = 0
  let cx = 0
  let cy = 0

  for (let i = 0; i < points.length; i++) {
    const p0 = points[i]
    const p1 = points[(i + 1) % points.length]
    const cross = p0.x * p1.y - p1.x * p0.y
    a += cross
    cx += (p0.x + p1.x) * cross
    cy += (p0.y + p1.y) * cross
  }

  a *= 0.5
  if (a === 0) return null
  return { x: cx / (6 * a), y: cy / (6 * a) }
}

export default function ImagePolygonOverlay(props: ImagePolygonOverlayProps) {
  const {
    imageSrc,
    alt = 'Imagem',
    width = '800px',
    polygons,
    defaultFill = 'transparent',
    defaultHoverFill = 'rgba(255,255,0,0.4)',
    defaultStroke = '#facc15',
    defaultStrokeWidth = 2,
    onPolygonClick,
    onHoverChange,
  } = props

  const wrapRef = useRef<HTMLDivElement>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null)
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null)

  const viewBox = useMemo(() => {
    const w = natural?.w ?? 800
    const h = natural?.h ?? 400
    return `0 0 ${w} ${h}`
  }, [natural])

  const hoveredPolygon = useMemo(() => {
    if (!hoveredId) return null
    return polygons.find((p) => p.id === hoveredId) ?? null
  }, [hoveredId, polygons])

  return (
    <div ref={wrapRef} style={{ position: 'relative', width }}>
      <img
        src={imageSrc}
        alt={alt}
        style={{ width: '100%', display: 'block' }}
        onLoad={(e) => {
          const img = e.currentTarget
          if (img.naturalWidth && img.naturalHeight) setNatural({ w: img.naturalWidth, h: img.naturalHeight })
        }}
      />

      {hoveredPolygon?.tooltip && tooltipPos ? (
        <div
          style={{
            position: 'absolute',
            left: tooltipPos.x,
            top: tooltipPos.y,
            transform: 'translate(12px, 12px)',
            width: 240,
            background: 'rgba(15, 23, 42, 0.92)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 12,
            padding: 12,
            boxShadow: '0 14px 38px rgba(0,0,0,0.35)',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 14, lineHeight: 1.25 }}>
            {hoveredPolygon.tooltip.title}
          </div>
          {hoveredPolygon.tooltip.description ? (
            <div style={{ marginTop: 6, opacity: 0.92, fontSize: 12, lineHeight: 1.35 }}>
              {hoveredPolygon.tooltip.description}
            </div>
          ) : null}
          {hoveredPolygon.tooltip.metrics?.length ? (
            <div style={{ marginTop: 10, display: 'grid', gap: 6 }}>
              {hoveredPolygon.tooltip.metrics.map((m) => (
                <div key={`${m.label}-${m.value}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                  <span style={{ opacity: 0.85, fontSize: 12 }}>{m.label}</span>
                  <span style={{ fontWeight: 800, fontSize: 12 }}>{m.value}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <svg
        viewBox={viewBox}
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        {polygons.map((p) => {
          const isHover = hoveredId === p.id
          const fill = isHover ? (p.hoverFill ?? defaultHoverFill) : (p.fill ?? defaultFill)
          const stroke = p.stroke ?? defaultStroke
          const strokeWidth = p.strokeWidth ?? defaultStrokeWidth
          const points = toPointsString(p.points)

          const labelText = p.label ?? p.title
          const shouldShowLabel = p.showLabel ?? Boolean(labelText)
          const centroid = shouldShowLabel ? polygonCentroid(toPointArray(p.points)) : null
          const labelStyle: Required<PolygonLabelStyle> = {
            fontSize: p.labelStyle?.fontSize ?? 14,
            fontWeight: p.labelStyle?.fontWeight ?? 800,
            fill: p.labelStyle?.fill ?? '#ffffff',
            stroke: p.labelStyle?.stroke ?? 'rgba(15, 23, 42, 0.85)',
            strokeWidth: p.labelStyle?.strokeWidth ?? 3,
          }

          return (
            <g key={p.id}>
              <polygon
                points={points}
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
                style={{
                  transition: '0.2s',
                  pointerEvents: 'all',
                  cursor: p.cursor ?? 'pointer',
                }}
                onMouseEnter={() => {
                  setHoveredId(p.id)
                  onHoverChange?.(p.id)
                }}
                onMouseLeave={() => {
                  setHoveredId(null)
                  onHoverChange?.(null)
                  setTooltipPos(null)
                }}
                onMouseMove={(e) => {
                  const rect = wrapRef.current?.getBoundingClientRect()
                  if (!rect) return
                  setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
                }}
                onClick={() => {
                  p.onClick?.(p.id)
                  onPolygonClick?.(p.id)
                }}
              >
                {p.title ? <title>{p.title}</title> : null}
              </polygon>

              {shouldShowLabel && labelText && centroid ? (
                <text
                  x={centroid.x}
                  y={centroid.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{
                    pointerEvents: 'none',
                    userSelect: 'none',
                  }}
                  fontSize={labelStyle.fontSize}
                  fontWeight={labelStyle.fontWeight}
                  fill={labelStyle.fill}
                  stroke={labelStyle.stroke}
                  strokeWidth={labelStyle.strokeWidth}
                  paintOrder="stroke"
                >
                  {labelText}
                </text>
              ) : null}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

