"use client"
import React, {useEffect} from 'react';
import dynamic from "next/dynamic";
import NavBar from "@/app/components/nav-bar";

const ReactPlayer = dynamic(() => import("react-player"), {ssr: false});

function Youtube(props) {
    const [videos, setVideos] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    useEffect(() => {
            fetch('http://localhost:8001/watch/home')
                .then(response => response.json())
                .then(data => {
                    setVideos(data);
                    setLoading(false);
                });
        }
        , []);


    return (

        <div className='h-full w-full'>
            <NavBar/>
            {loading ?
                <div className='container mx-auto flex justify-center items-center h-screen'>Loading...</div>
                : (
                    <div
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 m-10">
                        {videos.map(video => (
                            <div key={video.id}
                                 className="border rounded-md overflow-hidden">
                                <div>
                                    <ReactPlayer url={video.url}
                                                 width="360px"
                                                 height="180px"
                                                 controls={true}
                                    />
                                </div>
                                <div className="p-4">
                                    <h2 className="text-lg font-semibold mb-2">{video.title}</h2>
                                    <p className="text-gray-700">Author - {video.author}</p>
                                    <p className="text-gray-700">{video.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
        </div>
    );
}

export default Youtube;