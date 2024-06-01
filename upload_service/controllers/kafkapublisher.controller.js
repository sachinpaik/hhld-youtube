import KafkaConfig from "../kafka/kafka.js";

const sendMessageToKafka = async (req, res) => {
    try {
        console.log("got here in upload service...")
        const message = req.body;
        const kafka = new KafkaConfig();
        const msgs = [{
            key: "key1",
            value: JSON.stringify(message)
        }]
        const result = await kafka.produce("transcode", msgs);
        res.status(200).send("Message sent to kafka successfully");
    } catch (error) {
        console.log("Error in sending message to kafka: ", error);
        res.status(500).send("Error in sending message to kafka");
    }
}

export const videoUpload = async (fileName, url) => {
    try {
        console.log(`Uploading video ${fileName} to kafka...`)
        const message = {
            fileName: fileName,
            url: url
        };
        const msgs = [{
            key: "key1",
            value: JSON.stringify(message)
        }]
        const kafka = new KafkaConfig();
        await kafka.produce("transcode", msgs);
        console.log(`Video ${fileName} uploaded to kafka successfully`)
    } catch (error) {
        console.log("Error in uploading video to kafka: ", error);
    }
}

export default sendMessageToKafka;