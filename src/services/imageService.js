const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

/**
 * Service to handle image processing and optimization
 */
class ImageService {
    /**
     * Optimizes an image and saves it as WebP
     * @param {string} inputPath Path to original image
     * @param {string} outputDir Directory to save optimized image
     * @returns {Promise<string>} Filename of optimized image
     */
    async optimizeToWebP(inputPath, outputDir) {
        const filename = path.basename(inputPath, path.extname(inputPath)) + '.webp';
        const outputPath = path.join(outputDir, filename);

        await sharp(inputPath)
            .resize(1200, null, { // Max width 1200px, keep aspect ratio
                withoutEnlargement: true,
                fit: 'inside'
            })
            .webp({ quality: 80 }) // 80% quality is a good balance
            .toFile(outputPath);

        return filename;
    }

    /**
     * Process base64 image data from the CMS
     * @param {string} base64Data Data URI
     * @param {string} outputDir Directory to save
     * @returns {Promise<string>} Final filename
     */
    async processCmsImage(base64Data, outputDir) {
        if (!base64Data || !base64Data.startsWith('data:image/')) {
            return base64Data; // Return as is if not a data URI
        }

        // Create temp file from base64
        const matches = base64Data.match(/^data:image\/([A-Za-z-+/]+);base64,(.+)$/);
        if (!matches) return base64Data;

        const buffer = Buffer.from(matches[2], 'base64');
        const tempName = `temp-${Date.now()}.bin`;
        const tempPath = path.join(outputDir, tempName);

        await fs.writeFile(tempPath, buffer);

        try {
            const webpFilename = await this.optimizeToWebP(tempPath, outputDir);
            await fs.unlink(tempPath); // Cleanup temp
            return webpFilename;
        } catch (error) {
            console.error('Image optimization failed, falling back to original:', error);
            // Fallback: save original if sharp fails
            const ext = matches[1].split('+')[0] || 'jpg';
            const fallbackName = `img-${Date.now()}.${ext}`;
            await fs.writeFile(path.join(outputDir, fallbackName), buffer);
            await fs.unlink(tempPath);
            return fallbackName;
        }
    }
}

module.exports = new ImageService();
