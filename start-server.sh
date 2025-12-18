#!/bin/bash

echo "Starting Broadcast Generator Server..."
echo ""
echo "Opening in browser at: http://localhost:8000/pages/home/index.html"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Try python3 first, then python
if command -v python3 &> /dev/null; then
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    python -m http.server 8000
else
    echo "Error: Python is not installed"
    exit 1
fi
