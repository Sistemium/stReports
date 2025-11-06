import { Request, Response, NextFunction } from 'express';
import contentDisposition from 'content-disposition';
import { renderReport } from './createFile.js';

export async function renderHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { url, name, width, height, media, background, scale = '2' } = req.query;
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

    // Render the report
    const result = await renderReport(url, format as 'pdf' | 'png', undefined, options);

    // Set response headers
    res.contentType(result.contentType);

    if (name && typeof name === 'string') {
      const nameExt = `${name.replace(/\//g, '-')}.${format}`;
      const fileName = contentDisposition(nameExt, { fallback: false });
      res.header('Content-Disposition', fileName);
    }

    res.send(result.buffer);
  } catch (error) {
    next(error);
  }
}
