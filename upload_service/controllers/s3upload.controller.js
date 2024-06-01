import {
    PutObjectCommand,
    S3Client,
    CreateMultipartUploadCommand,
    UploadPartCommand,
    AbortMultipartUploadCommand, CompleteMultipartUploadCommand, ListPartsCommand
} from "@aws-sdk/client-s3";
import fs from 'fs';
import AWS from 'aws-sdk';
import {addVideoMetadata} from "../db/db.js";
import {videoUpload} from "./kafkapublisher.controller.js";


export const initializeUpload = async (req, res) => {

    const fileName = req.body.fileName;
    console.log("initialize Upload request for file: ", fileName);
    const s3client = new S3Client();
    const uploadParams = {
        Bucket: process.env.BUCKET_NAME,
        Key: fileName,
        ContentType: 'video/mp4'
    };
    console.log("initialize S3 Upload request Param: ", uploadParams);
    const createCommand = new CreateMultipartUploadCommand(uploadParams);
    try {
        const response = await s3client.send(createCommand);
        console.log("initialize Upload Request Successfully with Upload ID ", response.UploadId);
        res.status(200).json(response.UploadId);
    } catch (err) {
        console.error(err);
        res.status(500).send("Failed to initiate upload");
    }

}


export const uploadChunk = async (req, res) => {

    const {fileName, chunkIndex, uploadId} = req.body;
    console.log("upload Chunk request for file: ", fileName, " chunkIndex: ", chunkIndex, " UploadId: ", uploadId);
    const s3client = new S3Client();
    const chunkParam = {
        "Body": req.file.buffer,
        "Bucket": process.env.BUCKET_NAME,
        "Key": fileName,
        "PartNumber": (parseInt(chunkIndex) + 1),
        "UploadId": uploadId,
        "ContentLength": req.file.size
    };
    console.log("upload Chunk request Param: ", chunkParam);
    const ChunkUploadCommand = new UploadPartCommand(chunkParam);
    try {
        const response = await s3client.send(ChunkUploadCommand);
        console.log("Upload Chunk Successfully with ETag ", response.ETag);
        res.status(200).json(response.ETag);
    } catch (err) {
        console.error(err);
        res.status(500).send("Failed to upload Chunk");
    }

}

export const completeUpload = async (req, res) => {

    const {fileName, uploadId, totalChunks, title, description, author} = req.body;
    console.log("Complete Chunk request for file: ", fileName, " UploadId: ", uploadId);
    const s3client = new S3Client();
    const listInput = {
        "Bucket": process.env.BUCKET_NAME,
        "Key": fileName,
        "UploadId": uploadId
    };
    const listCommand = new ListPartsCommand(listInput);
    const listResponse = await s3client.send(listCommand);
    const completeParam = {
        "Bucket": process.env.BUCKET_NAME,
        "Key": fileName,
        "MultipartUpload": {
            "Parts": listResponse.Parts
        },
        "UploadId": uploadId
    };
    console.log("Complete Chunk request Param: ", completeParam);
    const completeUploadCommand = new CompleteMultipartUploadCommand(completeParam);
    try {
        const response = await s3client.send(completeUploadCommand);
        console.log("Upload Completed Successfully ", response.Location);
        await videoUpload(fileName, response.Location);
        await addVideoMetadata(title, description, author, response.Location);
        res.status(200).json({message: "Uploaded successfully!!!"});
    } catch (err) {
        console.error(err);
        res.status(500).send("Upload completion failed");
    }

}

export const abortUpload = async (req, res) => {

    const {fileName, uploadId} = req.body;
    console.log("Abort Upload request for file: ", fileName, " UploadId: ", uploadId);
    const s3client = new S3Client();
    const abortParam = {
        "Bucket": process.env.BUCKET_NAME,
        "Key": fileName,
        "UploadId": uploadId
    };
    console.log("Abort Upload request Param: ", abortParam);
    const abortCommand = new AbortMultipartUploadCommand(abortCommand);
    try {
        const response = await s3client.send(abortCommand);
        console.log("Upload Aborted Successfully ");
        res.status(200).json({message: "Upload Aborted Successfully!!!"});
    } catch (err) {
        console.error(err);
        res.status(500).send("Upload Abort failed");
    }

}


export const s3upload = async (req, res) => {

    const filepath = 'C:\\Users\\sachi\\OneDrive\\Desktop\\HHLD-YOUTUBE\\upload_service\\asset\\hhld-youtube-week4.mp4';
    if (!fs.existsSync(filepath)) {
        return res.status(500).send("File does not exist");
    }
    let size = fs.statSync(filepath).size;
    console.log(size)
    const s3client = new S3Client();
    const uploadParams = {
        Bucket: "hhld-youtube-sachin",
        Key: "hhld-youtube-week4",
        ContentType: 'video/mp4'
    };
    const command = new CreateMultipartUploadCommand(uploadParams);
    const response = await s3client.send(command);
    const uploadId = response.UploadId;
    console.log(uploadId);
    const chunkSize = 5 * 1024 * 1024;
    const totalChunks = Math.ceil(size / chunkSize);
    let start = 0;
    let retryCounter = 3;
    let chunkNumber = 0;
    let partsList = [];
    while (true) {
        try {
            start = chunkNumber * chunkSize;
            let end = Math.min(start + chunkSize, size);
            console.log("-----------")
            console.log(chunkNumber)
            console.log(start);
            console.log(end)

            const input = {
                "Body": fs.createReadStream(filepath, {start, end}),
                "Bucket": uploadParams.Bucket,
                "Key": uploadParams.Key,
                "PartNumber": (chunkNumber + 1),
                "UploadId": uploadId,
                "ContentLength": end - start
            };
            const uploadCommand = new UploadPartCommand(input);
            const response = await s3client.send(uploadCommand);
            console.log(response.ETag)
            partsList.push({
                ETag: response.ETag,
                PartNumber: chunkNumber + 1
            });
            chunkNumber++;
            retryCounter = 3;
        } catch (e) {
            if (retryCounter === 0) {
                const input = {
                    "Bucket": uploadParams.Bucket,
                    "Key": uploadParams.Key,
                    "UploadId": uploadId
                };
                const command = new AbortMultipartUploadCommand(input);
                await s3client.send(command);
                console.log("failed to upload chunk: ", chunkNumber)
                return res.status(500).send("Failed to upload chunk: " + chunkNumber);
            }
            retryCounter--;
        }
        if (chunkNumber >= totalChunks) {
            const input = {
                "Bucket": uploadParams.Bucket,
                "Key": uploadParams.Key,
                "MultipartUpload": {
                    "Parts": partsList
                },
                "UploadId": uploadId
            };
            const command = new CompleteMultipartUploadCommand(input);
            const response = await s3client.send(command);
            return res.status(200).send("File uploaded successfully");
        }
    }
}


export const uploadToDb = async (req, res) => {
    try {
        const {title, description, author, videoUrl} = req.body;
        console.log("upload to db request for file: ", videoUrl);
        await addVideoMetadata(title, description, author, videoUrl);
        res.status(200).send("File uploaded to db successfully");
    } catch (err) {
        console.error(err);
        res.status(500).send("Failed to upload to db");
    }
}

