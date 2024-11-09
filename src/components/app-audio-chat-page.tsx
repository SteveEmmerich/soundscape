'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, Send } from "lucide-react"
import { PageTitle } from "@/components/PageTitle"

type Message = {
  id: number;
  user: string;
  content: string;
  timestamp: Date;
}

type AudioFile = {
  id: string;
  title: string;
  filename: string;
}

export function BlockPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([])

  useEffect(() => {
    // Fetch audio files
    fetchAudioFiles()
  }, [])

  const fetchAudioFiles = async () => {
    try {
      const response = await fetch('/api/get-tracks')
      if (!response.ok) {
        throw new Error('Failed to fetch audio files')
      }
      const data = await response.json()
      setAudioFiles(data)
    } catch (error) {
      console.error('Error fetching audio files:', error)
    }
  }

  const handleSendMessage = () => {
    if (newMessage.trim() === '') return

    const message: Message = {
      id: Date.now(),
      user: 'User', // In a real app, this would be the logged-in user
      content: newMessage,
      timestamp: new Date(),
    }

    setMessages([...messages, message])
    setNewMessage('')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-primary/20 to-background">
      <PageTitle>Audio Chat</PageTitle>
      <div className="w-full max-w-4xl flex gap-4">
        <Card className="w-1/3">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageCircle className="mr-2 h-6 w-6 text-primary" />
              Audio Files
            </CardTitle>
            <CardDescription>Reference these in your chat</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <ul className="space-y-2">
                {audioFiles.map((file) => (
                  <li key={file.id} className="p-2 hover:bg-accent rounded-md">
                    {file.title || file.filename}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </CardContent>
        </Card>
        <Card className="w-2/3">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageCircle className="mr-2 h-6 w-6 text-primary" />
              Chat
            </CardTitle>
            <CardDescription>Discuss your audio files</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] mb-4">
              {messages.map((message) => (
                <div key={message.id} className="flex items-start mb-4">
                  <Avatar className="mr-2">
                    <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${message.user}`} />
                    <AvatarFallback>{message.user[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{message.user}</p>
                    <p>{message.content}</p>
                    <p className="text-xs text-gray-500">{message.timestamp.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
          <CardFooter>
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex w-full items-center space-x-2">
              <Input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <Button type="submit">
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}