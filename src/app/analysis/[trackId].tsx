import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

interface AnalysisData {
  track: {
    filename: string
    duration: number
  }
  genrePrediction: {
    genre: string
    confidence: number
  }
}

export default function Analysis() {
  const router = useRouter()
  const { trackId } = router.query
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)

  useEffect(() => {
    if (trackId) {
      fetch(`/api/analyze?trackId=${trackId}`)
        .then(response => response.json())
        .then(data => setAnalysisData(data))
        .catch(error => console.error('Error:', error))
    }
  }, [trackId])

  if (!analysisData) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-6 bg-white rounded-lg shadow-xl">
        <h1 className="text-2xl font-bold mb-4">Audio Analysis</h1>
        <p>Filename: {analysisData.track.filename}</p>
        <p>Duration: {analysisData.track.duration.toFixed(2)} seconds</p>
        <p>Predicted Genre: {analysisData.genrePrediction.genre}</p>
        <p>Confidence: {(analysisData.genrePrediction.confidence * 100).toFixed(2)}%</p>
      </div>
    </div>
  )
}