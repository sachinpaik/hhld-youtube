import {GetObjectCommand, PutObjectCommand, S3Client} from "@aws-sdk/client-s3";
import fs, {createWriteStream} from "fs";
import ffmpeg from "fluent-ffmpeg";


const s3Tos3 = async (fileName) => {
    const s3client = new S3Client();
    const getObjectParam = {
        "Bucket": process.env.BUCKET_NAME,
        "Key": fileName
    };
    const getObjectCommand = new GetObjectCommand(getObjectParam);
    try {
        const response = await s3client.send(getObjectCommand);
        console.log("Get Object Successfully with ETag ", response.ETag);
        fs.mkdirSync('input', {recursive: true});
        const fileStream = createWriteStream(`input/${fileName}`);
        response.Body.pipe(fileStream);
        await new Promise((resolve, reject) => {
            fileStream.on('finish', resolve);
            fileStream.on('error', reject);
        });
    } catch (err) {
        console.error(err);
        throw new Error("Failed to get Object");
    }
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
    const ffmgPromiseList = []
    fs.mkdirSync('output', {recursive: true});
    for (const {resolution, videoBitrate, audioBitrate} of resolutions) {
        console.log(`HLS conversion starting for ${resolution}`);
        const outputFileName = `${fileName.replace(".", "_")}_${resolution}.m3u8`
        const segmentFileName = `${fileName.replace(".", "_")}_${resolution}_%03d.ts`
        ffmgPromiseList.push(new Promise((resolve, reject) => {
            ffmpeg(`./input/${fileName}`)
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
        console.log('All HLS conversion finished', value);


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

    const masterPlaylistFileName = `${fileName.replace(
        '.',
        '_'
    )}_master.m3u8`;
    const masterPlaylistPath = `output/${masterPlaylistFileName}`;
    fs.writeFileSync(masterPlaylistPath, masterPlaylist);
    console.log(`HLS master m3u8 playlist generated`);
    console.log(`Deleting locally downloaded s3 mp4 file`);
    fs.unlinkSync(`input/${fileName}`);
    console.log(`Deleted locally downloaded s3 mp4 file`);

    const files = fs.readdirSync('output');

    for (const file of files) {

        const fileContent = fs.readFileSync(`output/${file}`);
        const uploadParams = {
            Bucket: process.env.BUCKET_NAME,
            Key: `hls/${file}`,
            Body: fileContent,
            ContentType: file.endsWith('.ts')
                ? 'video/mp2t'
                : file.endsWith('.m3u8')
                    ? 'application/x-mpegURL'
                    : null

        };
        const uploadCommand = new PutObjectCommand(uploadParams);
        try {
            const response = await s3client.send(uploadCommand);
            fs.unlinkSync(`output/${file}`)
            console.log(
                `Uploaded media m3u8 playlists and ts segments to s3. Also deleted locally`
            );
        } catch (err) {
            console.error(err);
            throw new Error("Upload Failed");
        }
    }


}

export default s3Tos3;