import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import convertToHls from "./hls/transcode.js";
import KafkaConfig from "./kafka/kafka.js";
import s3Tos3 from "./hls/s3Tos3.js";

const app = express();
dotenv.config();
const PORT = process.env.PORT || 8001;

const corsOptions = {
    origin: '*',
    credentials: true
}
app.use(cors(corsOptions));


app.get("/", (req, res) => {
    res.status(200).send("Welcome to transcoder service")
})

app.get("/health", (req, res) => {
    res.status(200).send("transcoder service is healthy")
})

app.get("/transcode", (req, res) => {
    convertToHls().then(() => {
            res.status(200).send("Transcoding converted to HLS format")
        }
    ).catch((err) => {
        res.status(500).send("Error in transcoding")
    })
});

const kafkaconfig = new KafkaConfig()
kafkaconfig.consume("transcode", async (message) => {
    console.log("Received message", message)
    const value = JSON.parse(message)

    if (value && value.fileName) {
        console.log("Filename is", value.fileName);
        await s3Tos3(value.fileName); // Make this change in controller
    } else {
        console.log("Didn't receive filename to be picked from S3");
    }

})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
});

