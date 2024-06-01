import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()


export async function addVideoMetadata(title, description, author, videoUrl) {
    const videoData = await prisma.videoData.create({
        data: {
            title: title,
            description: description,
            author: author,
            url: videoUrl
        }
    })
    console.log(videoData);
}
