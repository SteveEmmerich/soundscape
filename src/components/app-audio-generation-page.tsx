'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Wand2 } from "lucide-react"
import { motion } from "framer-motion"

export function BlockPage() {
  const [prompt, setPrompt] = useState('')
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')

  const handleGeneration = async () => {
    setIsGenerating(true)
    setError('')
    setGeneratedAudio(null)

    try {
      const response = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate audio')
      }
      console.log(response)
      const data = await response.json()
      setGeneratedAudio(data.audioUrl)
    } catch (error) {
      console.error('Error generating audio:', error)
      setError('An error occurred while generating the audio')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-primary/20 to-background">
      <h1 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
        AI Audio Generation
      </h1>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wand2 className="mr-2 h-6 w-6 text-primary" />
              Generate Audio
            </CardTitle>
            <CardDescription>Describe the audio you want to generate</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter a description of the audio you want to generate..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px]"
            />
          </CardContent>
          <CardFooter className="flex flex-col items-stretch">
            <Button
              onClick={handleGeneration}
              disabled={!prompt || isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Audio'
              )}
            </Button>
            {generatedAudio && (
              <div className="mt-4 w-full">
                <audio controls src={generatedAudio} className="w-full">
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
            {error && (
              <p className="mt-4 text-sm text-red-600">{error}</p>
            )}
          </CardFooter>
        </Card>
      </motion.div>
    </main>
  )
}