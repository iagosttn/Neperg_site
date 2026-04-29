const cloudinary = require('cloudinary').v2;

/**
 * Service to handle image processing and optimization using Cloudinary
 */

// Configuration is automatically handled if CLOUDINARY_URL is present in env
// Otherwise, user should set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
if (process.env.CLOUDINARY_URL) {
    cloudinary.config({ secure: true });
} else {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true
    });
}

class ImageService {
    /**
     * Process base64 image data and upload to Cloudinary
     * @param {string} base64Data Data URI
     * @returns {Promise<string>} Cloudinary URL
     */
    async processCmsImage(base64Data) {
        if (!base64Data || !base64Data.startsWith('data:image/')) {
            return base64Data; // Return as is if not a data URI
        }

        try {
            const result = await cloudinary.uploader.upload(base64Data, {
                folder: 'neperg_cms',
                resource_type: 'image',
                // Transformation for optimization
                transformation: [
                    { width: 1200, crop: "limit" },
                    { quality: "auto" },
                    { fetch_format: "webp" }
                ]
            });
            
            return result.secure_url;
        } catch (error) {
            console.error('Cloudinary upload failed:', error);
            throw new Error('Falha ao processar imagem na nuvem.');
        }
    }

    /**
     * Delete image from Cloudinary if it's a Cloudinary URL
     * @param {string} imageUrl 
     */
    async safeDeleteUpload(imageUrl) {
        if (!imageUrl || !imageUrl.includes('cloudinary.com')) return;

        try {
            // Extract public_id from URL
            const parts = imageUrl.split('/');
            const filename = parts[parts.length - 1].split('.')[0];
            const folder = parts[parts.length - 2];
            const publicId = `${folder}/${filename}`;

            await cloudinary.uploader.destroy(publicId);
        } catch (error) {
            console.warn('Could not delete image from Cloudinary:', error);
        }
    }
}

module.exports = new ImageService();
