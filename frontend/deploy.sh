#!/bin/bash

# Exit on any error
set -e

echo "Building the frontend..."
npm run build

echo "Deploying to Netlify..."
netlify deploy --prod

echo "Deployment completed!"