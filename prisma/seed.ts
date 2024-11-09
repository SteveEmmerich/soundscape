import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const sampleDocuments = [
    {
      title: "Introduction to AI",
      content: "Artificial Intelligence (AI) is revolutionizing various industries. From healthcare to finance, AI is making significant impacts. Machine learning, a subset of AI, is particularly promising."
    },
    {
      title: "The Future of Web Development",
      content: "Web development is evolving rapidly. With technologies like WebAssembly and Progressive Web Apps, the line between web and native applications is blurring. Frameworks like Next.js are making it easier to build performant web applications."
    },
    {
      title: "Understanding Vector Databases",
      content: "Vector databases are becoming increasingly important in the age of AI. They allow for efficient similarity searches, which is crucial for many AI applications. PostgreSQL with pgvector is one way to implement a vector database."
    }
  ]

  for (const doc of sampleDocuments) {
    await prisma.document.create({
      data: doc
    })
  }

  console.log('Seeding completed.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })