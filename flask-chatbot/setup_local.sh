#!/bin/bash

echo "=== EU IVDR LLM Local Setup ==="
echo ""
echo "This will download Mistral-7B-Instruct-v0.3 (~14GB) and set up the environment."
echo ""

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

echo "Python version:"
python3 --version
echo ""

# Create virtual environment
echo "Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip

# Install PyTorch (CPU version - smaller download)
echo ""
echo "Installing PyTorch (CPU version)..."
echo "Note: For GPU support, manually install: pip install torch --index-url https://download.pytorch.org/whl/cu118"
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

# Install other requirements
echo ""
echo "Installing other dependencies..."
pip install Flask==3.0.0
pip install transformers==4.36.0
pip install accelerate==0.25.0
pip install sentencepiece==0.1.99
pip install protobuf==4.25.0

echo ""
echo "=== Setup Complete! ==="
echo ""
echo "To run the chatbot:"
echo "1. Activate the virtual environment: source venv/bin/activate"
echo "2. Run the app: python app.py"
echo "3. Open browser to: http://localhost:5000"
echo ""
echo "Note: First run will download the Mistral-7B model (~14GB). This may take several minutes."
echo ""
echo "System Requirements:"
echo "- RAM: 16GB minimum (32GB recommended)"
echo "- Disk Space: 20GB free"
echo "- CPU: Multi-core processor (GPU optional but recommended)"
