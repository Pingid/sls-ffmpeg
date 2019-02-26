import path from 'path';
import { download, uploadFolder } from './src/s3'
import { ffprobe, ffmpeg } from './src/ffmpeg'

export const main = async (event, context, callback) => {
  const { input, output, ext, args } = JSON.parse(event.body)

  // Input bucket and file key
  const [ inputBucket, ...inKeys ] = input.split(path.sep);
  const inputKey = inKeys.join(path.sep);

  // Output bucket and file key
  const [ outputBucket, ...outKeys ] = output.split(path.sep);
  const outputKey = outKeys.join(path.sep);
  
  const outputFolder = path.join(outputKey, path.parse(inputKey).dir).length > 2 ? path.join(outputKey, path.parse(inputKey).dir) + '/' : '';

  console.log(`Convert file: ${inputKey} from bucket: ${inputBucket} to file: ${outputFolder}${path.basename(inputKey, path.extname(inputKey))}.${ext} in bucket: ${outputBucket}. (ffmpeg ${path.basename(inputKey)} ${args} -o ${path.basename(inputKey, path.extname(inputKey))}.${ext})  `)

  try {
    const destPath = await download(inputBucket, inputKey)
    await ffprobe(destPath)
    const outputPath = await ffmpeg(destPath, ext, args.split(' '))
    await uploadFolder(outputBucket, outputFolder, outputPath)
  } catch (error) {
    callback(null, { statusCode: 400, body: JSON.stringify(error) })
  }
  callback(null, { statusCode: 200, body: JSON.stringify(done) })
}