#!/usr/bin/env python3
"""TaskMaster Application Launcher"""
import os
from app import create_app

if __name__ == '__main__':
    print("🚀 Starting TaskMaster...")
    app = create_app()
    print("✅ Application ready!")
    print("🌐 Open: http://127.0.0.1:5000")
    app.run(host='127.0.0.1', port=5000, debug=False)
