import { uploadBufferToCloudinary } from '../config/cloudinary.js'

function getMimeType(mimetype) {
  if (mimetype?.includes('pdf')) return 'pdf'
  if (mimetype?.startsWith('image/')) return 'image'
  return 'document'
}

/**
 * Upload multer file buffers to Cloudinary and return attachment metadata.
 * @param {import('multer').File[]} files
 * @param {string} folder - Cloudinary folder path
 */
export async function uploadFiles(files = [], folder = 'replyfy') {
  const attachments = []

  for (const file of files) {
    const uploaded = await uploadBufferToCloudinary(file.buffer, folder, file.originalname)
    attachments.push({
      url: uploaded.url,
      publicId: uploaded.publicId,
      name: file.originalname,
      type: getMimeType(file.mimetype),
      bytes: uploaded.bytes,
    })
  }

  return attachments
}
