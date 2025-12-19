#!/usr/bin/env python3
"""
Simple HTTP Server with proper MIME types for ES6 modules
Ensures JavaScript files are served with correct Content-Type
"""

import http.server
import socketserver
import os
import sys

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Set MIME types for JavaScript modules
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

    def guess_type(self, path):
        """Override to ensure .js files get correct MIME type"""
        mimetype = super().guess_type(path)
        if path.endswith('.js'):
            return 'application/javascript'
        if path.endswith('.mjs'):
            return 'application/javascript'
        return mimetype

def run_server():
    # Ensure we're in the correct directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    Handler = MyHTTPRequestHandler

    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            print("=" * 60)
            print("🚀 Broadcast Generator Server Started!")
            print("=" * 60)
            print(f"\n📍 Server running at: http://localhost:{PORT}")
            print(f"🏠 Home page: http://localhost:{PORT}/pages/home/index.html")
            print(f"\n✅ All JavaScript modules will load correctly")
            print("\n⚠️  Press Ctrl+C to stop the server\n")
            print("=" * 60)
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\n👋 Server stopped. Goodbye!")
        sys.exit(0)
    except OSError as e:
        if e.errno == 48 or e.errno == 98:
            print(f"\n❌ Error: Port {PORT} is already in use!")
            print("💡 Try closing other servers or change the PORT in this script.")
            sys.exit(1)
        else:
            raise

if __name__ == '__main__':
    run_server()
