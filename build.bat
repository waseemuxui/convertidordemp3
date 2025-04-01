@echo off

REM Create functions directory if it doesn't exist
if not exist "netlify\functions" mkdir netlify\functions

REM Copy server.js to functions directory
copy /Y server.js netlify\functions\server.js

REM Install dependencies
npm install --production
