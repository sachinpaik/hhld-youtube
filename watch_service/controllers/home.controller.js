import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();


 const getAllVideos = async (req, res) => {
        try{
        console.log("test")
        const videos = await prisma.$queryRaw`SELECT * FROM "VideoData"`;
        console.log(videos);
        return res.status(200).send(videos);
    } catch (error) {
        return res.status(400).send();
    }
}

export default getAllVideos;