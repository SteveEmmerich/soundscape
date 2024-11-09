'use client'

import { useEffect, useRef } from 'react'

interface WaveformProps {
  audioBuffers: AudioBuffer[]
}

export function Waveform({ audioBuffers }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || audioBuffers.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = 'rgb(200, 200, 200)'

    audioBuffers.forEach((buffer, index) => {
      const data = buffer.getChannelData(0)
      const step = Math.ceil(data.length / width)
      const amp = height / 2

      ctx.beginPath()
      for (let i = 0; i < width; i++) {
        let min = 1.0
        let max = -1.0
        for (let j = 0; j < step; j++) {
          const datum = data[(i * step) + j]
          if (datum < min) min = datum
          if (datum > max) max = datum
        }
        ctx.moveTo(i, (1 + min) * amp)
        ctx.lineTo(i, (1 + max) * amp)
      }
      ctx.strokeStyle = `hsl(${(index * 360) / audioBuffers.length}, 100%, 50%)`
      ctx.stroke()
    })
  }, [audioBuffers])

  return <canvas ref={canvasRef} width={800} height={200} />
}