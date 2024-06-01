import ffmpeg from "fluent-ffmpeg"
import ffmpegStatic from "ffmpeg-static"
import fs from "fs"

ffmpeg.setFfmpegPath(ffmpegStatic)


const convertToHls = async () => {
    const inputFileName = "hhld-youtube-week4.mp4"
    const resolutions = [
        {
            resolution: '320x180',
            videoBitrate: '500k',
            audioBitrate: '64k'
        },
        {
            resolution: '854x480',
            videoBitrate: '1000k',
            audioBitrate: '128k'
        },
        {
            resolution: '1280x720',
            videoBitrate: '2500k',
            audioBitrate: '192k'
        }
    ];
    const variantPlaylists = [];
    const ffmgPromiseList =[]
    for (const {resolution, videoBitrate, audioBitrate} of resolutions) {
        console.log(`HLS conversion starting for ${resolution}`);
        const outputFileName = `${inputFileName.replace(".", "_")}_${resolution}.m3u8`
        const segmentFileName = `${inputFileName.replace(".", "_")}_${resolution}_%03d.ts`
        ffmgPromiseList.push(new Promise((resolve, reject) => {
            ffmpeg(inputFileName)
                .outputOptions([
                    `-c:v h264`,
                    `-b:v ${videoBitrate}`,
                    `-c:a aac`,
                    `-b:a ${audioBitrate}`,
                    `-vf scale=${resolution}`,
                    `-f hls`,
                    `-hls_time 10`,
                    `-hls_list_size 0`,
                    `-hls_segment_filename output/${segmentFileName}`
                ])
                .output(`output/${outputFileName}`)
                .on('end', () => resolve(resolution))
                .on('error', (err) => reject(err))
                .run();
        }));
        variantPlaylists.push({
            resolution,
            outputFileName
        });
        console.log(`HLS conversion finished for ${resolution}`);
    }

    await Promise.all(ffmgPromiseList).then((value) => {
        console.log('All HLS conversion finished',value);


    })
        .catch((err) => {
        console.error(err);
        process.exit(1);
    });
    console.log('HLS master m3u8 playlist generating');
    let masterPlaylist = variantPlaylists
        .map((variantPlaylist) => {
            const {resolution, outputFileName} = variantPlaylist;
            const bandwidth =
                resolution === '320x180'
                    ? 676800
                    : resolution === '854x480'
                        ? 1353600
                        : 3230400;
            return `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${resolution}\n${outputFileName}`;
        })
        .join('\n');
    masterPlaylist = `#EXTM3U\n` + masterPlaylist;

    const masterPlaylistFileName = `${inputFileName.replace(
        '.',
        '_'
    )}_master.m3u8`;
    const masterPlaylistPath = `output/${masterPlaylistFileName}`;
    fs.writeFileSync(masterPlaylistPath, masterPlaylist);
    console.log(`HLS master m3u8 playlist generated`);
}

export default convertToHls;