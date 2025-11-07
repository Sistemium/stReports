#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
REMOTE_DIR="/var/www/stReports"
PM2_LOGS_DIR="/var/www/logs"
NODE_ENV="production"

# Load configuration from .deployrc
if [ ! -f .deployrc ]; then
  echo -e "${RED}Error: .deployrc file not found${NC}"
  echo "Copy .deployrc.example to .deployrc and configure your settings"
  exit 1
fi

source .deployrc

# Validate required variables
if [ -z "$SERVER" ]; then
  echo -e "${RED}Error: SERVER not set in .deployrc${NC}"
  exit 1
fi

if [ -z "$PM2_NAME" ]; then
  echo -e "${RED}Error: PM2_NAME not set in .deployrc${NC}"
  exit 1
fi

echo -e "${GREEN}Starting deployment to $SERVER${NC}"
echo "Remote directory: $REMOTE_DIR"
echo "PM2 process name: $PM2_NAME"

# Build the project
echo -e "\n${YELLOW}Building project...${NC}"
npm run build

# Check if .env.production exists
if [ ! -f .env.production ]; then
  echo -e "${RED}Error: .env.production file not found${NC}"
  exit 1
fi

# Create temporary deployment directory
TEMP_DIR=$(mktemp -d)
echo -e "\n${YELLOW}Preparing files for deployment...${NC}"

# Copy files to temp directory
cp -r dist "$TEMP_DIR/"
cp package.json "$TEMP_DIR/"
cp .env.production "$TEMP_DIR/.env"

# Create PM2 ecosystem file
cat > "$TEMP_DIR/ecosystem.config.cjs" << EOF
module.exports = {
  apps: [{
    name: '$PM2_NAME',
    cwd: '$REMOTE_DIR',
    script: './dist/app.js',
    node_args: '-r dotenv-flow/config',
    env: {
      NODE_ENV: '$NODE_ENV'
    },
    error_file: '$PM2_LOGS_DIR/$PM2_NAME-error.log',
    out_file: '$PM2_LOGS_DIR/$PM2_NAME-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '500M'
  }]
};
EOF

# Sync files to server
echo -e "\n${YELLOW}Syncing files to server...${NC}"
rsync -avz --delete \
  "$TEMP_DIR/" \
  "$SERVER:$REMOTE_DIR/"

# Clean up temp directory
rm -rf "$TEMP_DIR"

# Execute remote commands
echo -e "\n${YELLOW}Installing dependencies on server...${NC}"
ssh "$SERVER" << ENDSSH
  set -e
  cd $REMOTE_DIR

  # Install production dependencies
  echo "Installing npm packages..."
  npm install --omit=dev

  # Create logs directory if it doesn't exist
  # mkdir -p $PM2_LOGS_DIR

  # Start or restart PM2 process
  echo "Starting/restarting PM2 process..."
  pm2 startOrRestart ecosystem.config.cjs
  pm2 save

  echo "Deployment completed successfully!"
ENDSSH

echo -e "\n${GREEN}✓ Deployment completed successfully!${NC}"
echo -e "Run ${YELLOW}pm2 logs $PM2_NAME${NC} on the server to view logs"
