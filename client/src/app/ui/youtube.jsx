"use client"
import React from 'react';
import dynamic from "next/dynamic";
const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

function Youtube(props) {
    return (
        <div className="grid grid-row-auto-fit  grid-cols-3 gap-10 grid-cols-auto-fill ">
            <ReactPlayer
                className='react-player'
                url='https://www.youtube.com/watch?v=jZg3iIMmSJM'
                controls={true}
                width='100%'
                height='100%'
            />
            <ReactPlayer
                className='react-player'
                url='https://www.youtube.com/watch?v=jZg3iIMmSJM'
                controls={true}
                width='100%'
                height='100%'
            />
            <ReactPlayer
                className='react-player'
                url='https://www.youtube.com/watch?v=jZg3iIMmSJM'
                controls={true}
                width='100%'
                height='100%'
            />
            <ReactPlayer
                className='react-player'
                url='https://www.youtube.com/watch?v=jZg3iIMmSJM'
                controls={true}
                width='100%'
                height='100%'

            />
            <ReactPlayer
                className='react-player'
                url='https://www.youtube.com/watch?v=jZg3iIMmSJM'
                controls={true}
                width='100%'
                height='100%'
            />
                <ReactPlayer
                    className='react-player'
                    url='https://www.youtube.com/watch?v=jZg3iIMmSJM'
                    controls={true}
                    width='100%'
                    height='100%'
                />
                <ReactPlayer
                    className='react-player'
                    url='https://www.youtube.com/watch?v=jZg3iIMmSJM'
                    controls={true}
                    width='100%'
                    height='100%'

                />
                <ReactPlayer
                    className='react-player'
                    url='https://www.youtube.com/watch?v=jZg3iIMmSJM'
                    controls={true}
                    width='100%'
                    height='100%'
                />
                <ReactPlayer
                    className='react-player'
                    url='https://www.youtube.com/watch?v=jZg3iIMmSJM'
                    controls={true}
                    width='100%'
                    height='100%'
                />
        </div>
    );
}

export default Youtube;