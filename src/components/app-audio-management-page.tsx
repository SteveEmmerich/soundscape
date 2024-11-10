'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/hooks/use-toast"
import { Loader2, Music, Upload, BarChart4 } from "lucide-react"
import { motion } from "framer-motion"
import { PageTitle } from "@/components/PageTitle"

type AudioTrack = {
  id: string;
  title: string;
  filename: string;
  analysis?: {
    genres: string[];
    moods: string[];
    tempo: number;
    key: string;
    timeSignature: string;
  };
}

export function BlockPage() {
  const [tracks, setTracks] = useState<AudioTrack[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    fetchTracks()
  }, [])

  const fetchTracks = async () => {
    try {
      const response = await fetch('/api/get-tracks')
      console.log(response)
      if (!response.ok) throw new Error('Failed to fetch tracks')
      const data = await response.json()
      setTracks(data)
    } catch (error) {
      console.error('Error fetching tracks:', error)
      toast({
        title: "Error",
        description: "Failed to fetch tracks. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const response = await fetch('/api/upload-audio', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Failed to upload file')

      const data = await response.json()
      setTracks(prev => [...prev, data])
      setSelectedFile(null)
      toast({
        title: "Success",
        description: "Audio file uploaded successfully.",
      })
    } catch (error) {
      console.error('Error uploading file:', error)
      toast({
        title: "Error",
        description: "Failed to upload audio file. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleAnalyze = async (trackId: string) => {
    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/analyze-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId }),
      })

      if (!response.ok) throw new Error('Failed to analyze audio')

      const analysisResult = await response.json()
      setTracks(prev => prev.map(track => 
        track.id === trackId ? { ...track, analysis: analysisResult } : track
      ))
      toast({
        title: "Success",
        description: "Audio analysis completed successfully.",
      })
    } catch (error) {
      console.error('Error analyzing audio:', error)
      toast({
        title: "Error",
        description: "Failed to analyze audio. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-primary/20 to-background">
      <PageTitle subtitle="Manage and analyze your audio tracks">Audio Management</PageTitle>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="mr-2 h-6 w-6 text-primary" />
              Upload New Track
            </CardTitle>
            <CardDescription>Select an audio file to upload</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Input
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                disabled={isUploading}
              />
              <Button onClick={handleUpload} disabled={!selectedFile || isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Music className="mr-2 h-6 w-6 text-primary" />
              Audio Tracks
            </CardTitle>
            <CardDescription>Manage and analyze your audio tracks</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Filename</TableHead>
                  <TableHead>Analysis</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tracks.map((track) => (
                  <TableRow key={track.id}>
                    <TableCell>{track.title}</TableCell>
                    <TableCell>{track.filename}</TableCell>
                    <TableCell>
                      {track.analysis ? (
                        <div className="text-sm">
                          <p><strong>Genres:</strong> {track.analysis.genres.join(', ')}</p>
                          <p><strong>Moods:</strong> {track.analysis.moods.join(', ')}</p>
                          <p><strong>Tempo:</strong> {track.analysis.tempo} BPM</p>
                          <p><strong>Key:</strong> {track.analysis.key}</p>
                          <p><strong>Time Signature:</strong> {track.analysis.timeSignature}</p>
                        </div>
                      ) : (
                        'Not analyzed'
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleAnalyze(track.id)}
                        disabled={isAnalyzing}
                        size="sm"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <BarChart4 className="mr-2 h-4 w-4" />
                            Analyze
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  )
}