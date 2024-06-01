import express from 'express';
import {
    abortUpload,
    completeUpload,
    initializeUpload,
    s3upload,
    uploadChunk, uploadToDb
} from "../controllers/s3upload.controller.js";
import multer from 'multer';

const uploadRouter = express.Router();
const upload = multer();
//uploadRouter.post("/",upload.single('file'), s3upload)
uploadRouter.post("/",upload.single('chunk'),uploadChunk)
uploadRouter.post("/initialize",upload.none(),initializeUpload)
uploadRouter.post("/complete",upload.none(),completeUpload)
uploadRouter.post("/abort",upload.none(),abortUpload)
uploadRouter.post("/uploadToDb",uploadToDb)
export default uploadRouter;