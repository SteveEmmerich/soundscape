'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Upload, Wand2, BarChart, Shuffle, AudioWaveform, Download } from "lucide-react"
import { motion } from "framer-motion"
import { AudioVisualization } from '@/components/audio-visualization'
import { Checkbox } from "@/components/ui/checkbox"
import { Waveform } from '@/components/waveform'

export function BlockPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState('')
  const [generationPrompt, setGenerationPrompt] = useState('')
  const [generatedDescription, setGeneratedDescription] = useState('')
  const [analysisResult, setAnalysisResult] = useState('')
  const [analyzedTrackId, setAnalyzedTrackId] = useState<string | null>(null)
  const [tracks, setTracks] = useState([])
  const [selectedTracks, setSelectedTracks] = useState([])
  const [mashupDescription, setMashupDescription] = useState('')
  const [mashupAnalysis, setMashupAnalysis] = useState(null)
  const [mashupFilename, setMashupFilename] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isCreatingMashup, setIsCreatingMashup] = useState(false)
  const [error, setError] = useState('')

  const audioContextRef = useRef<AudioContext | null>(null)
  const audioBuffersRef = useRef<AudioBuffer[]>([])

  useEffect(() => {
    fetchTracks()
    audioContextRef.current = new (window.AudioContext || window.AudioContext)()
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  const fetchTracks = async () => {
    try {
      const response = await fetch('/api/get-tracks')
      if (!response.ok) {
        throw new Error('Failed to fetch tracks')
      }
      const data = await response.json()
      setTracks(data)
    } catch (error) {
      console.error('Error fetching tracks:', error)
      setError('Failed to fetch tracks')
    }
  }

  const handleTrackSelection = async (trackId) => {
    if (selectedTracks.includes(trackId)) {
      setSelectedTracks(prev => prev.filter(id => id !== trackId))
      audioBuffersRef.current = audioBuffersRef.current.filter((_, index) => selectedTracks[index] !== trackId)
    } else {
      setSelectedTracks(prev => [...prev, trackId])
      try {
        const response = await fetch(`/api/get-audio/${trackId}`)
        const arrayBuffer = await response.arrayBuffer()
        const audioBuffer = await audioContextRef.current!.decodeAudioData(arrayBuffer)
        audioBuffersRef.current.push(audioBuffer)
      } catch (error) {
        console.error('Error loading audio:', error)
        setError('Failed to load audio for selected track')
      }
    }
  }

  const handleCreateMashup = async () => {
    if (selectedTracks.length < 2) {
      setError('Please select at least two tracks for mashup')
      return
    }

    setIsCreatingMashup(true)
    setError('')

    try {
      // Process audio data
      const processedAudioData = await processAudio(audioBuffersRef.current)

      const response = await fetch('/api/create-mashup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          trackIds: selectedTracks,
          processedAudioData
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create mashup')
      }

      const data = await response.json()
      setMashupDescription(data.description)
      setMashupAnalysis(data.analysis)
      setAnalyzedTrackId(data.trackId)
      setMashupFilename(data.filename)
    } catch (error) {
      console.error('Error creating mashup:', error)
      setError('An error occurred while creating the mashup')
    } finally {
      setIsCreatingMashup(false)
    }
  }

  const handleDownloadMashup = () => {
    if (mashupFilename) {
      const downloadLink = document.createElement('a')
      downloadLink.href = `/uploads/${mashupFilename}`
      downloadLink.download = mashupFilename
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    }
  }

  const processAudio = async (audioBuffers: AudioBuffer[]) => {
    const offlineContext = new OfflineAudioContext(2, audioBuffers[0].length, audioBuffers[0].sampleRate)

    const sources = audioBuffers.map(buffer => {
      const source = offlineContext.createBufferSource()
      source.buffer = buffer
      return source
    })

    const gainNodes = sources.map(() => offlineContext.createGain())

    sources.forEach((source, index) => {
      source.connect(gainNodes[index])
      gainNodes[index].connect(offlineContext.destination)
      gainNodes[index].gain.setValueAtTime(1 / sources.length, 0)
      source.start(0)
    })

    const renderedBuffer = await offlineContext.startRendering()

    // Extract features
    const analyser = audioContextRef.current!.createAnalyser()
    const sourceNode = audioContextRef.current!.createBufferSource()
    sourceNode.buffer = renderedBuffer
    sourceNode.connect(analyser)

    analyser.fftSize = 2048
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    analyser.getByteFrequencyData(dataArray)

    // Calculate average frequency and estimate tempo
    const avgFrequency = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength
    const estimatedTempo = Math.round(avgFrequency * 2) // This is a very rough estimation

    // Estimate key (this is a placeholder - actual key detection is more complex)
    const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    const estimatedKey = keys[Math.floor(Math.random() * keys.length)]

    return {
      combinedFeatures: Array.from(dataArray),
      duration: renderedBuffer.duration,
      tempo: estimatedTempo,
      key: estimatedKey
    }
  }

  // ... (previous handleFileUpload, handleAudioGeneration, and handleAnalysis functions)

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-primary/20 to-background">
      <h1 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
        Audio Management
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* ... (previous upload and generation cards) */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shuffle className="mr-2 h-6 w-6 text-primary" />
                Create AI Mashup
              </CardTitle>
              <CardDescription>Select tracks to create an AI-powered mashup</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tracks.map((track) => (
                  <div key={track.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={track.id}
                      checked={selectedTracks.includes(track.id)}
                      onCheckedChange={() => handleTrackSelection(track.id)}
                    />
                    <label htmlFor={track.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {track.title || track.filename}
                    </label>
                  </div>
                ))}
              </div>
              <Button
                onClick={handleCreateMashup}
                disabled={selectedTracks.length < 2 || isCreatingMashup}
                className="w-full mt-4"
              >
                {isCreatingMashup ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Mashup...
                  </>
                ) : (
                  'Create Mashup'
                )}
              </Button>
            </CardContent>
            <CardFooter className="flex flex-col items-start">
              {mashupDescription && (
                <div>
                  <h3 className="font-bold">Mashup Description:</h3>
                  <p className="text-sm text-gray-600">{mashupDescription}</p>
                </div>
              )}
              {mashupFilename && (
                <Button onClick={handleDownloadMashup} className="mt-4">
                  <Download className="mr-2 h-4 w-4" />
                  Download Mashup
                </Button>
              )}
            </CardFooter>
          </Card>
        </motion.div>
      </div>

      {analyzedTrackId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8 w-full max-w-4xl"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart className="mr-2 h-6 w-6 text-primary" />
                Audio Analysis Visualization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AudioVisualization trackId={analyzedTrackId} />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {selectedTracks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-8 w-full max-w-4xl"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AudioWaveform className="mr-2 h-6 w-6 text-primary" />
                Waveform Visualization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Waveform audioBuffers={audioBuffersRef.current} />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-sm text-red-600"
        >
          {error}
        </motion.p>
      )}
    </main>
  )
}