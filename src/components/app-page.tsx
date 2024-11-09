'use client'

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Wand2, Shuffle, BarChart, Music, MessageCircle } from "lucide-react"

export function BlockPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-primary/20 to-background">
      <h1 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
        Welcome to Widdle AI
      </h1>
      <p className="text-xl mb-12 text-center max-w-2xl">
        Explore the power of AI in music analysis, generation, mashup creation, and audio discussions.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wand2 className="mr-2 h-6 w-6 text-primary" />
              Audio Generation
            </CardTitle>
            <CardDescription>Create AI-generated audio tracks</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Use our advanced AI models to generate unique audio tracks based on your input.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/audio-generation" passHref>
              <Button className="w-full">Go to Generation</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Music className="mr-2 h-6 w-6 text-primary" />
              Audio Management
            </CardTitle>
            <CardDescription>Manage your audio tracks and create mashups</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Upload, organize, and create AI-powered mashups from your audio tracks.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/audio-management" passHref>
              <Button className="w-full">Go to Management</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart className="mr-2 h-6 w-6 text-primary" />
              Audio Analysis
            </CardTitle>
            <CardDescription>Analyze audio tracks with AI</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Get detailed insights into your audio tracks using our AI-powered analysis tools.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/audio-analysis" passHref>
              <Button className="w-full">Go to Analysis</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shuffle className="mr-2 h-6 w-6 text-primary" />
              AI Mashup Studio
            </CardTitle>
            <CardDescription>Create unique mashups with AI assistance</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Combine multiple tracks and let our AI enhance the mashup creation process.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/ai-mashup-studio" passHref>
              <Button className="w-full">Go to Mashup Studio</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageCircle className="mr-2 h-6 w-6 text-primary" />
              Audio Chat
            </CardTitle>
            <CardDescription>Discuss your audio files with others</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Chat about your uploaded audio files, share insights, and collaborate with other users.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/audio-chat" passHref>
              <Button className="w-full">Go to Chat</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}