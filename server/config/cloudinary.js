import { v2 as cloudinary } from 'cloudinary'
import { env } from './env.js'

cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
})

export { cloudinary }

export async function uploadBufferToCloudinary(buffer, folder = 'replyfy', filename = 'file') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto', public_id: `${folder}/${Date.now()}-${filename}` },
      (err, result) => {
        if (err) reject(err)
        else
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            bytes: result.bytes,
          })
      }
    )
    stream.end(buffer)
  })
}
