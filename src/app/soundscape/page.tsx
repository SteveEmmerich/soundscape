'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/analysis/${data.trackId}`)
      } else {
        console.error('Upload failed')
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleGenerate = async () => {
    try {
      const response = await fetch('/api/generate-audio', {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/analysis/${data.trackId}`)
      } else {
        console.error('Generation failed')
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-6 bg-white rounded-lg shadow-xl">
        <h1 className="text-2xl font-bold mb-4">SoundScape</h1>
        <form onSubmit={handleSubmit} className="mb-4">
          <input
            type="file"
            onChange={handleFileChange}
            className="mb-4"
            accept="audio/*"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
            disabled={!file}
          >
            Upload and Analyze
          </button>
        </form>
        <button
          onClick={handleGenerate}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Generate and Analyze Audio
        </button>
      </div>
    </div>
  )
}