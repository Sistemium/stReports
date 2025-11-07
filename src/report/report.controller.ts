import { Request, Response, NextFunction } from 'express';
import contentDisposition from 'content-disposition';
import { renderReport } from './createFile.js';
import { uploadToS3 } from './uploadToS3.js';

export async function renderHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const {
      url,
      name,
      width,
      height,
      media,
      background,
      scale = '2',
      s3,
      upload,
      filename,
      title,
      json
    } = req.query;
    const { format } = req.params;

    // Validate format
    if (!/^(png|pdf)$/.test(format)) {
      res.status(400).send('Wrong format. Allowed types are pdf and png');
      return;
    }

    // Validate URL is provided
    if (!url || typeof url !== 'string') {
      res.status(400).send('Missing required parameter: url');
      return;
    }

    // Parse render options
    const options: any = {
      media: media as string | undefined,
      background: background === 'true' || background === '1',
      scale: parseInt(scale as string, 10),
    };

    if (width && height) {
      options.width = parseInt(width as string, 10);
      options.height = parseInt(height as string, 10);
    }

    // Generate filename for S3 if needed
    const generatedFilename = filename as string | undefined;

    // Render the report
    const result = await renderReport(url, format as 'pdf' | 'png', generatedFilename, options);

    // Check if should upload to S3
    const shouldUploadToS3 = s3 === 'true' || s3 === '1' || upload === 'true' || upload === '1';

    if (shouldUploadToS3) {
      // Upload to S3 and return URL
      const s3Url = await uploadToS3(result, {
        filename: (filename as string) || result.filename,
        title: title as string | undefined,
      });

      if (json === 'true' || json === '1') {
        res.json({ src: s3Url });
      } else {
        res.redirect(s3Url);
      }
    } else {
      // Return file directly
      res.contentType(result.contentType);

      if (name && typeof name === 'string') {
        const nameExt = `${name.replace(/\//g, '-')}.${format}`;
        const fileName = contentDisposition(nameExt, { fallback: false });
        res.header('Content-Disposition', fileName);
      }

      res.send(result.buffer);
    }
  } catch (error) {
    next(error);
  }
}
