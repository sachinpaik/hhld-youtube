import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import uploadRouter from "./routes/s3upload.routes.js";
import KafkaConfig from "./kafka/kafka.js";
import kafkaPublish from "./routes/kafkapublisher.routes.js";
const app = express();
dotenv.config();
const PORT= process.env.PORT || 8000;

const corsOptions = {
    origin: '*',
    credentials: true
}
app.use(cors(corsOptions));
app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).send("Welcome to upload service")
})

app.get("/health", (req, res) => {
    res.status(200).send("upload service is healthy")
})

app.use("/upload",uploadRouter);
app.use("/publish",kafkaPublish);




app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
});

