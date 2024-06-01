import express from "express";
import getAllVideos from "../controllers/home.controller.js";

const watchRouter = express.Router();
watchRouter.get("/home", getAllVideos);


export default watchRouter;