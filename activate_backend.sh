#!/bin/bash

# Quick activation script for backend virtual environment

if [ -f "backend/venv/bin/activate" ]; then
    source backend/venv/bin/activate
    echo "✅ Virtual environment activated"
    echo "Current Python: $(which python)"
    echo "To deactivate, run: deactivate"
else
    echo "❌ Virtual environment not found. Please run ./setup_backend.sh first"
    exit 1
fi
