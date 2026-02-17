#!/bin/bash

# Clean installation
echo "Cleaning previous installation..."
rm -rf node_modules package-lock.json

# Install dependencies
echo "Installing dependencies..."
npm install --no-package-lock

# Set Node options to avoid memory issues
export NODE_OPTIONS="--max-old-space-size=3072"

# Build the project
echo "Building the project..."
npm run build

echo "Build completed successfully!" 