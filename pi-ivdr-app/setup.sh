#!/bin/bash

echo "Setting up IVDR LLM on Raspberry Pi"
echo "===================================="

# Update system
echo "Updating system packages..."
sudo apt update
sudo apt install -y python3-pip python3-venv

# Create virtual environment
echo "Creating virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Install requirements
echo "Installing Python packages (this will take several minutes)..."
pip install --upgrade pip
pip install -r requirements.txt

# Download model
echo "Downloading Phi-3-mini model..."
python3 download_model.py

echo ""
echo "Setup complete!"
echo "To start the server, run:"
echo "  source venv/bin/activate"
echo "  python3 app.py"
