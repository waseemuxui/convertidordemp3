const fs = require('fs');
const path = require('path');

// Create functions directory if it doesn't exist
const functionsDir = path.join(__dirname, '..', 'netlify', 'functions');
if (!fs.existsSync(functionsDir)) {
    fs.mkdirSync(functionsDir, { recursive: true });
}

// Copy server.js to functions directory
const serverSrc = path.join(__dirname, '..', 'server.js');
const serverDest = path.join(functionsDir, 'server.js');
fs.copyFileSync(serverSrc, serverDest);

console.log('Build completed successfully!');
