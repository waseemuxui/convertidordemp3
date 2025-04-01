#!/bin/bash

# Create functions directory if it doesn't exist
mkdir -p netlify/functions

# Copy server.js to functions directory
cp server.js netlify/functions/server.js

# Install dependencies
npm install --production
