'use client'
import React, {useEffect, useState} from 'react';
import LogoutBtn from "@/app/components/logout-btn";
import axios from "axios";
import FormData from "form-data";
import Youtube from "@/app/pages/youtube";
import {useSession} from "next-auth/react";
import {redirect} from "next/navigation";

function Upload() {

    const [uploadFile, setUploadFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [author, setAuthor] = useState('');

    const {data} = useSession();
    // useEffect(() => {
    //     console.log('data------- ', data);
    //     if(!data) {
    //         console.log('redirecting');
    //         redirect("/");
    //     }
    // }, [])


    const initializeUploadRequest = async (fileName) => {
        try {
            const response = await axios.post('http://localhost:8000/upload/initialize', {
                fileName: fileName
            });
            return response.data;
        } catch (e) {
            console.log("Error in initializing upload request: ", e);
        }
    }

    const uploadChunkRequest = async (fileName, chunkIndex, uploadId, chunk) => {
        const form = new FormData();
        form.append("fileName", fileName);
        form.append("chunkIndex", chunkIndex);
        form.append("uploadId", uploadId);
        form.append("chunk", chunk);
        try {
            const response = await axios.post('http://localhost:8000/upload', form);
            return response.data;
        } catch (e) {
            console.log("Error in uploading chunk: ", e);
        }
    }

    const completeUploadRequest = async (fileName, uploadId,totalChunks,title,description,author) => {
        try {
            const response = await axios.post('http://localhost:8000/upload/complete', {
                fileName: fileName,
                uploadId: uploadId,
                totalChunks: totalChunks,
                title: title,
                description: description,
                author: author
            });
            return response.data;
        } catch (e) {
            console.log("Error in completing upload request: ", e);
        }
    }

    const abortUploadRequest = async (fileName, uploadId) => {
        try {
            const response = await axios.post('http://localhost:8000/upload/abort', {
                fileName: fileName,
                uploadId: uploadId
            });
            return response.data;
        } catch (e) {
            console.log("Error in aborting upload request: ", e);
        }
    }

    const handleUpload = async () => {

        if (!title || !author) {
            alert('Title and Author are required fields.');
            return;
        }
        setUploadStatus(0);
        console.log(uploadFile);
        console.log("Uploading file process started");
        const uploadId = await initializeUploadRequest(uploadFile.name);
        console.log("Upload ID: ", uploadId);
        const chunkSize = 5 * 1024 * 1024;
        const totalChunks = Math.ceil(uploadFile.size / chunkSize);
        let start = 0;
        let uploadPromise = [];

        for(let i=0; i<totalChunks; i++){
            try {
                start=i*chunkSize;
                uploadPromise.push(uploadChunkRequest(uploadFile.name, i, uploadId, uploadFile.slice(start, start + chunkSize)));
            }
            catch (e) {
                console.log("Error in uploading chunk: ", e);
                setUploadStatus(2);
                await abortUploadRequest(uploadFile.name, uploadId);
            }
        }
        try {
            await Promise.all(uploadPromise);
            await completeUploadRequest(uploadFile.name, uploadId,totalChunks,title,description,author);
            setUploadStatus(1);
        }
        catch (e) {
            console.log("Error in completing upload request: ", e);
            setUploadStatus(2);
            await abortUploadRequest(uploadFile.name, uploadId);
            console.log("Abort S3 upload request completed");
        }
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        console.log(file);
        setUploadFile(file);
    }
    let status = null;
    if (uploadStatus === 1) {
        status = <div className="text-green-500">File uploaded successfully</div>
    } else if (uploadStatus === 2) {
        status = <div className="text-red-500">File upload failed</div>
    } else if (uploadStatus === 0) {
        status = <div className="text-red-500">File upload in progress</div>
    }

    return (
        // <div className="flex w-full h-screen bg-white">
        //     {/*<div className="flex flex-col h-full">*/}
        //     <div className="w-3/4 content-center">
        //         <Youtube/>
        //     </div>
        //     <div className="w-1/4">
        //         <header className="px-4 py-2">
        //             <div className="flex justify-end">
        //                 <LogoutBtn/>
        //             </div>
        //         </header>
        //         <div className="flex-grow flex justify-start pl-4">
        //             <div className="w-full max-w-xs">
        //                 <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
        //                        htmlFor="file_input">Upload
        //                     file</label>
        //                 <input
        //                     onChange={handleFileChange}
        //                     className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
        //                     aria-describedby="file_input_help" id="file_input" type="file"/>
        //                 <button onClick={upload}
        //                         className="text-white bg-blue-500 hover:bg-red-700 font-medium py-2 px-4 rounded">
        //                     upload
        //                 </button>
        //                 {status}
        //             </div>
        //         </div>
        //     </div>

            <div className='container mx-auto max-w-lg p-10'>
                <form encType="multipart/form-data">
                    <div className="mb-4">
                        <input type="text"
                               name="title"
                               placeholder="Title"
                               value={title}
                               onChange={(e) => setTitle(e.target.value)}
                               required
                               className="px-3 py-2 w-full border rounded-md focus:outline-none focus:border-blue-500"/>
                    </div>
                    <div className="mb-4">
                        <input type="text"
                               name="description"
                               placeholder="Description"
                               value={description}
                               onChange={(e) => setDescription(e.target.value)}
                               className="px-3 py-2 w-full border rounded-md focus:outline-none focus:border-blue-500"/>
                    </div>
                    <div className="mb-4">
                        <input type="text"
                               name="author"
                               placeholder="Author"
                               value={author}
                               onChange={(e) => setAuthor(e.target.value)}
                               required
                               className="px-3 py-2 w-full border rounded-md focus:outline-none focus:border-blue-500"/>
                    </div>
                    <div className="mb-4">
                        <input type="file"
                               name="file"
                               onChange={handleFileChange}
                               className="px-3 py-2 w-full border rounded-md focus:outline-none focus:border-blue-500"/>
                    </div>
                    <button
                        type="button"
                        onClick={handleUpload}
                        className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                    >
                        Upload
                    </button>
                </form>
            </div>
           // </div>

    )
}

export default Upload;