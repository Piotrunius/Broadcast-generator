#!/bin/bash

echo "Starting Broadcast Generator Server..."
echo ""

# Open browser (wait 2 seconds for server to start)
(sleep 2 && xdg-open "http://localhost:8000/index.html" 2>/dev/null || open "http://localhost:8000/index.html" 2>/dev/null) &

# Try to use custom server first (better MIME type support)
if [ -f "server.py" ]; then
    if command -v python3 &> /dev/null; then
        python3 server.py
    elif command -v python &> /dev/null; then
        python server.py
    else
        echo "Error: Python is not installed"
        exit 1
    fi
else
    echo "Using basic HTTP server..."
    # Fallback to basic server
    if command -v python3 &> /dev/null; then
        python3 -m http.server 8000
    elif command -v python &> /dev/null; then
        python -m http.server 8000
    else
        echo "Error: Python is not installed"
        exit 1
    fi
fi
