#!/bin/bash
# Build script for Vercel deployment

echo "Building frontend..."
cd client
npm run build

echo "Build completed successfully!"