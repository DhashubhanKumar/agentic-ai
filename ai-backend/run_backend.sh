#!/bin/bash
cd "$(dirname "$0")"

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate venv
source venv/bin/activate

# Install dependencies if needed (quietly)
echo "Checking dependencies..."
pip install -r requirements.txt > /dev/null

# Run the server
echo "Starting AI Backend..."
python3 main.py
