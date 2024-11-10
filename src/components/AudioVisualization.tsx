'use client'

import { useEffect, useState } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, RadialLinearScale, PointElement, LineElement, Filler } from 'chart.js'
import { Bar, Radar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, RadialLinearScale, PointElement, LineElement, Filler, Title, Tooltip, Legend)

interface AudioAnalysisResult {
  genre: string
  mood: string
  tempo: number
  key: string
  timeSignature: number
  energy: number
  danceability: number
  valence: number
  acousticness: number
  instrumentalness: number
}

export function AudioVisualization({ trackId }: { trackId: string }) {
  const [analysisResult, setAnalysisResult] = useState<AudioAnalysisResult | null>(null)

  useEffect(() => {
    const fetchAnalysisResult = async () => {
      try {
        const response = await fetch(`/api/get-analysis/${trackId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch analysis result')
        }
        const data = await response.json()
        setAnalysisResult(data)
      } catch (error) {
        console.error('Error fetching analysis result:', error)
      }
    }

    fetchAnalysisResult()
  }, [trackId])

  if (!analysisResult) {
    return <div>Loading analysis results...</div>
  }

  const tempoData = {
    labels: ['Tempo'],
    datasets: [
      {
        label: 'BPM',
        data: [analysisResult.tempo],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  }

  const genreData = {
    labels: ['Genre'],
    datasets: [
      {
        label: analysisResult.genre,
        data: [1],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  }

  const moodData = {
    labels: ['Mood'],
    datasets: [
      {
        label: analysisResult.mood,
        data: [1],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  }

  const audioFeaturesData = {
    labels: ['Energy', 'Danceability', 'Valence', 'Acousticness', 'Instrumentalness'],
    datasets: [
      {
        label: 'Audio Features',
        data: [
          analysisResult.energy,
          analysisResult.danceability,
          analysisResult.valence,
          analysisResult.acousticness,
          analysisResult.instrumentalness,
        ],
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Audio Analysis Results',
      },
    },
    scales: {
      r: {
        angleLines: {
          display: true
        },
        suggestedMin: 0,
        suggestedMax: 1
      }
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Tempo</h3>
        <Bar options={options} data={tempoData} />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Genre</h3>
        <Bar options={options} data={genreData} />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Mood</h3>
        <Bar options={options} data={moodData} />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Audio Features</h3>
        <Radar data={audioFeaturesData} options={options} />
      </div>
      <div className="col-span-2">
        <h3 className="text-lg font-semibold mb-2">Additional Information</h3>
        <p>Key: {analysisResult.key}</p>
        <p>Time Signature: {analysisResult.timeSignature}/4</p>
      </div>
    </div>
  )
}