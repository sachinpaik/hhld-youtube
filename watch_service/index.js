import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import watchRouter from "./routes/watch.route.js";

const app = express();
dotenv.config();
const PORT = process.env.PORT || 8001;

const corsOptions = {
    origin: '*',
    credentials: true
}
app.use(cors(corsOptions));

app.use("/watch", watchRouter);

app.get("/", (req, res) => {
    res.status(200).send("Welcome to watch service")
})

app.get("/health", (req, res) => {
    res.status(200).send("watch service is healthy")
})



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
});

