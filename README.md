# stReports

TypeScript/Node.js service for rendering web pages to PDF and PNG formats using Puppeteer, with optional AWS S3 upload.

## Features

- Render any URL to PDF or PNG
- Customizable dimensions, scale, and media type
- AWS S3 upload support
- Built with TypeScript, Express 5, and Puppeteer
- Optimized for ARM64/Graviton servers

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Start development server
npm run dev

# Build for production
npm run build
```

## API

```bash
# Render PDF
GET /report/pdf?url=https://example.com

# Render PNG with custom size
GET /report/png?url=https://example.com&width=1920&height=1080

# Upload to S3 and get URL
GET /report/pdf?url=https://example.com&s3=true&json=true
```

## Documentation

For complete documentation including architecture, deployment, and detailed API reference, see [CLAUDE.md](CLAUDE.md)

## Requirements

- Node.js >= 20.0.0
- System Chromium (production) or bundled Chromium via puppeteer (development)
