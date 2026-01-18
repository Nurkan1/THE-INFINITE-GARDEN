#!/bin/bash
# Move to the directory containing the script
cd "$(dirname "$0")"

# Start the dev server in the background
npm run dev > /dev/null 2>&1 &

# Wait for server to warm up
sleep 2

# Open in default browser
xdg-open http://localhost:5173
