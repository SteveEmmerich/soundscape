'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, BarChart, Upload } from "lucide-react"
import { motion } from "framer-motion"
import { AudioVisualization } from '@/components/AudioVisualization'

export function BlockPage() {
  const [file, setFile] = useState<File | null>(null)
  const [analyzedTrackId, setAnalyzedTrackId] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState('')

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0]
    if (uploadedFile) {
      setFile(uploadedFile)
    }
  }

  const handleAnalysis = async () => {
    if (!file) return

    setIsAnalyzing(true)
    setError('')
    setAnalysisResult('')
    setAnalyzedTrackId(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const uploadResponse = await fetch('/api/upload-audio', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload audio')
      }

      const { trackId } = await uploadResponse.json()

      const analysisResponse = await fetch('/api/analyze-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId }),
      })

      if (!analysisResponse.ok) {
        throw new Error('Failed to analyze audio')
      }

      const analysisData = await analysisResponse.json()
      setAnalysisResult(analysisData.analysis)
      setAnalyzedTrackId(trackId)
    } catch (error) {
      console.error('Error analyzing audio:', error)
      setError('An error occurred during audio analysis')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-primary/20 to-background">
      <h1 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
        AI Audio Analysis
      </h1>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart className="mr-2 h-6 w-6 text-primary" />
              Analyze Audio
            </CardTitle>
            <CardDescription>Upload an audio file for AI analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center w-full">
              <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">MP3, WAV or OGG (MAX. 10MB)</p>
                </div>
                <input id="dropzone-file" type="file" className="hidden" onChange={handleFileUpload} accept=".mp3,.wav,.ogg" />
              </label>
            </div>
            {file && <p className="mt-2 text-sm text-gray-600">Selected file: {file.name}</p>}
          </CardContent>
          <CardFooter className="flex flex-col items-stretch">
            <Button
              onClick={handleAnalysis}
              disabled={!file || isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze Audio'
              )}
            </Button>
            {analysisResult && (
              <div className="mt-4 w-full">
                <h3 className="font-bold mb-2">Analysis Result:</h3>
                <p className="text-sm text-gray-600">{analysisResult}</p>
              </div>
            )}
            {error && (
              <p className="mt-4 text-sm text-red-600">{error}</p>
            )}
          </CardFooter>
        </Card>
      </motion.div>
      {analyzedTrackId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 w-full max-w-4xl"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart className="mr-2 h-6 w-6 text-primary" />
                Audio Visualization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AudioVisualization trackId={analyzedTrackId} />
            </CardContent>
          </Card>
        </motion.div>
      )}
    </main>
  )
}