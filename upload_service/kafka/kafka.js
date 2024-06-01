import {Kafka} from "kafkajs";
import fs from "fs";
import * as path from "node:path";

class KafkaConfig {
    constructor() {
        console.log(`${process.env.KAFKA_HOST}:${process.env.KAFKA_PORT}`)
        this.kafka = new Kafka({
            clientId: 'youtube uploader',
            brokers: [ `${process.env.KAFKA_HOST}:${process.env.KAFKA_PORT}`],
            ssl: {
                ca: [fs.readFileSync(path.resolve("./ca.pem"), "utf-8")]
            },
            //ssl: true,
            sasl: {
                mechanism: 'plain',
                username: process.env.KAFKA_USERNAME,
                password: process.env.KAFKA_PASSWORD
            },
        });
        this.consumer = this.kafka.consumer({groupId: 'youtube-uploader3'});
        this.producer = this.kafka.producer();
    }

    async produce(topic, messages) {
        try {
            const result=await this.producer.connect();
            await this.producer.send({
                topic: topic,
                messages: messages
            });

        } catch (error) {
            console.log("Error in kafka producer: ", error)
        } finally {
            await this.producer.disconnect();
        }

    }

    async consume(topic,callback) {
        try {
            await this.consumer.connect();
            await this.consumer.subscribe({topic: topic, fromBeginning: true});
            await this.consumer.run({
                eachMessage: async ({topic, partition, message}) => {
                    const value = message.value.toString();
                    callback(value);
                }
            });
        } catch (error) {
            console.log("Error in kafka consumer: ", error)
        }

    }
}

export default KafkaConfig;