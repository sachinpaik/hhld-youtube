import express from 'express';
import sendMessageToKafka from "../controllers/kafkapublisher.controller.js";

const kafkaPublish = express.Router();
kafkaPublish.post("/", sendMessageToKafka)

export default kafkaPublish;