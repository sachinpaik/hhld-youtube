import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Client } from "@opensearch-project/opensearch"

dotenv.config();
const app = express();
const port = process.env.PORT || 8080;
app.use(express.json());
app.use(cors({
    allowedHeaders: ["*"],
    origin: "*"
}));


app.post('/upload', async (req,res) => {

    try{

        console.log('Inside upload call');
        const { title, description, author, videoUrl } = req.body;

        const host = "URL"
        const client = new Client({node:host})
        var index_name = "video";
        var document = {
            title: title,
            author: author,
            description: description,
            videoUrl: videoUrl,
          };

        var response = await client.index({
            id: title,
            index: index_name,
            body: document,
            refresh: true,
          });
       console.log("Adding document:");
       console.log(response.body);
       res.status(200).json({ message: 'Video uploaded successfully' });
    }
    catch (e) {
        console.log(e.message);
        res.status(500).json({ message: 'Internal Server error' });
    }

});


app.get('/', (req,res) => {
    console.log(`HHLD opensearch`);
    res.send("HHLD opensearch")
});

app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});