import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Waveform, Music, Upload } from 'lucide-react'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-primary/20 to-background">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          Welcome to Widdle AI
        </h1>
        <p className="text-xl text-muted-foreground">
          Revolutionizing audio analysis and generation
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <FeatureCard
          icon={<Waveform className="h-12 w-12 text-primary" />}
          title="Music Analysis"
          description="Analyze audio tracks using cutting-edge AI technology"
          link="/music-analysis"
        />
        <FeatureCard
          icon={<Upload className="h-12 w-12 text-primary" />}
          title="Audio Management"
          description="Upload and manage your audio files with ease"
          link="/audio-management"
        />
        <FeatureCard
          icon={<Music className="h-12 w-12 text-primary" />}
          title="AI Generation"
          description="Generate unique audio descriptions and mashups"
          link="/audio-management"
        />
      </div>
    </main>
  )
}

function FeatureCard({ icon, title, description, link }) {
  return (
    <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardHeader>
        <div className="flex justify-center mb-4">{icon}</div>
        <CardTitle className="text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-center">{description}</CardDescription>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Link href={link}>
          <Button>Explore</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}