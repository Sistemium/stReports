# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

stReports is a TypeScript/Node.js service that renders web pages to PDF and PNG formats using Puppeteer. It's a simple HTTP service with a single endpoint for rendering URLs to different formats.

## Development Commands

### Running the Application
```bash
npm run dev
```
Starts the development server with tsx watch on port 8999 (default). Automatically reloads on file changes. Uses `dotenv-flow` to load environment variables from `.env` files.

### Building
```bash
npm run build
```
Compiles TypeScript to JavaScript in the `dist` folder using `tsc`.

### Type Checking
```bash
npm run typecheck
```
Runs TypeScript type checking without emitting files.

### Production
```bash
npm start
```
Runs the compiled JavaScript from the `dist` folder.

### Deployment
```bash
npm run deploy
```
Deploys the application to a remote server using rsync and PM2.

**Setup:**
1. Copy `.deployrc.example` to `.deployrc`
2. Configure server settings in `.deployrc`:
   - `SERVER` - SSH connection string (e.g., user@example.com)
   - `REMOTE_DIR` - Remote directory (default: /var/www/stReports)
   - `PM2_NAME` - PM2 process name
   - `PM2_LOGS_DIR` - PM2 logs directory (default: /var/www/logs)
3. Copy `.env.production.example` to `.env.production` and configure production environment variables
4. Run `npm run deploy`

The deployment script will:
- Build the TypeScript code
- Sync dist/, package.json, and .env to the server
- Install production dependencies on the server
- Create PM2 ecosystem config with logging
- Start or restart the PM2 process

## Environment Configuration

Copy `.env.example` to `.env` and configure the following variables:

**Required:**
- `S3_BUCKET` - AWS S3 bucket name

**Optional:**
- `PORT` - Server port (default: 8999)
- `NODE_ENV` - Environment mode (default: development)
- `S3_FOLDER` - S3 folder path (default: vfs)
- `S3_DOMAIN` - S3 domain URL (default: https://s3-eu-west-1.amazonaws.com)
- `TIMEOUT` - Puppeteer page load timeout in ms (default: 60000)
- `DEBUG` - Debug namespace (e.g., `stm:*`)

**AWS Credentials:**
AWS credentials are loaded from environment variables or AWS instance role (for production). For local development, you can set:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`

## Architecture

### Project Structure
```
src/
├── app.ts                      # Application entry point
├── routes.ts                   # Route configuration
├── config/
│   ├── environment.ts          # Environment configuration
│   └── express.ts              # Express middleware setup
├── report/
│   ├── index.ts                # Report router
│   ├── report.controller.ts    # Request handlers
│   ├── createFile.ts           # Puppeteer rendering logic
│   └── uploadToS3.ts           # S3 upload functionality
└── utils/
    └── debug.ts                # Debug utility
```

### Request Flow
1. Request arrives at `GET /report/:format` (format: pdf or png)
2. `report.controller.ts` validates format and URL parameter
3. `createFile.ts` uses Puppeteer to render the URL to buffer
4. If `s3=true` or `upload=true`:
   - File is uploaded to S3 using `uploadToS3.ts`
   - Response is either redirect to S3 URL or JSON with URL (if `json=true`)
5. Otherwise, file is sent directly to client with appropriate Content-Type and headers

### Key Components

**src/app.ts**
- Creates Express server and HTTP server
- Configures middleware via `configureExpress()`
- Registers routes via `configureRoutes()`
- Starts listening on configured port

**src/config/environment.ts**
- Loads and validates environment variables
- Provides typed configuration object
- Throws errors for missing required variables

**src/report/createFile.ts**
- Uses Puppeteer with headless Chrome
- Renders URLs to PDF (A4, 1cm margins) or PNG
- PNG options: width, height, media emulation, background, scale
- Waits for `networkidle0` before rendering
- Returns buffer with metadata (contentType, processingTime)

**src/report/uploadToS3.ts**
- Uses AWS SDK v3 (`@aws-sdk/client-s3`)
- Automatically uses credentials from environment or instance role
- Uploads rendered files to configured S3 bucket
- Returns public S3 URL

## API Endpoints

### GET /report/:format

Renders a URL to the specified format (pdf or png). Can either return the file directly or upload to S3.

**Path Parameters:**
- `format` - Output format: `pdf` or `png` (required)

**Query Parameters:**
- `url` - URL to render (required)
- `name` - Optional filename for Content-Disposition header (when returning directly)
- `width` - PNG width in pixels (default: 870)
- `height` - PNG height in pixels (default: 600)
- `media` - Media type emulation for PNG (e.g., "print", "screen")
- `background` - Include background in PNG: "true" or "1" (default: false)
- `scale` - PNG device scale factor (default: 2)

**S3 Upload Parameters:**
- `s3` or `upload` - Upload to S3: "true" or "1" (default: return directly)
- `filename` - Custom filename for S3 (auto-generated UUID if not provided)
- `title` - Title for Content-Disposition header in S3
- `json` - Return JSON with S3 URL: "true" or "1" (default: redirect to S3 URL)

**Examples:**
```bash
# Render PDF and return directly
curl "http://localhost:8999/report/pdf?url=https://example.com"

# Render PNG with custom dimensions
curl "http://localhost:8999/report/png?url=https://example.com&width=1920&height=1080&scale=1"

# Render PDF, upload to S3, and redirect to S3 URL
curl "http://localhost:8999/report/pdf?url=https://example.com&s3=true"

# Render PDF, upload to S3, and return JSON with S3 URL
curl "http://localhost:8999/report/pdf?url=https://example.com&s3=true&json=true"

# Upload to S3 with custom filename and title
curl "http://localhost:8999/report/pdf?url=https://example.com&s3=true&filename=my-report.pdf&title=My%20Report"
```

## Technical Notes

- Built with TypeScript 5.7+ and ES modules
- Uses `tsx` for development with hot reload
- AWS SDK v3 with automatic credential resolution
- Puppeteer runs with `--no-sandbox` and `--disable-setuid-sandbox` flags
- CORS enabled for all origins with specific headers
- Debug logging available via `debug` package (namespace: `stm:reports:*`)
- All renders happen in-memory (buffers), no disk writes
