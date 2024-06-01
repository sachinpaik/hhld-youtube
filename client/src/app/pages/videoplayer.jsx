"use client"
import React, { useRef, useEffect } from 'react';
import Hls from 'hls.js';

const VideoPlayer = () => {
    const videoRef = useRef(null);
    const src = "https://hhld-youtube-sachin.s3.amazonaws.com/output/hhld-youtube-week4_mp4_master.m3u8";
    const originalvideo ="https://hhld-youtube-sachin.s3.amazonaws.com/hhld-youtube-week4.mp4";
    useEffect(() => {
        const video = videoRef.current;

        if (Hls.isSupported()) {
            console.log("HLS is supported");
            console.log(src);
            const hls = new Hls();
            hls.attachMedia(video);
            hls.loadSource(src);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                console.log("playing video");
                video.play();
            });
        } else {
            console.log('HLS is not supported');
            video.src = originalvideo;
            video.play();
        }
    }, [src]);
    return <video ref={videoRef} controls />;
};

export default VideoPlayer;