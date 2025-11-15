# Running EU IVDR LLM Locally with Mistral-7B

## System Requirements

- **RAM**: 16GB minimum (32GB recommended for better performance)
- **Disk Space**: 20GB free (for model download)
- **CPU**: Multi-core processor (GPU optional but highly recommended)
- **Python**: 3.8 or higher

## Quick Start

### 1. Run the setup script:
```bash
cd flask-chatbot
chmod +x setup_local.sh
./setup_local.sh
```

### 2. Activate the virtual environment:
```bash
source venv/bin/activate
```

### 3. Run the application:
```bash
python app.py
```

### 4. Open your browser:
Navigate to `http://localhost:5000`

## Manual Setup (Alternative)

If the setup script doesn't work, follow these steps:

### 1. Create virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate
```

### 2. Install PyTorch:

**For CPU only:**
```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
```

**For GPU (NVIDIA CUDA):**
```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

### 3. Install dependencies:
```bash
pip install -r requirements.txt
```

### 4. Run the app:
```bash
python app.py
```

## First Run

The first time you run the application:
- Mistral-7B-Instruct-v0.3 model will be downloaded (~14GB)
- This may take 10-30 minutes depending on your internet connection
- The model will be cached locally for future use
- Subsequent runs will start much faster

## Performance Notes

### CPU vs GPU
- **CPU**: Works but slower responses (5-30 seconds per query)
- **GPU**: Much faster responses (1-3 seconds per query)

### Memory Usage
- Model uses ~14GB of disk space
- Runtime RAM usage: 8-16GB depending on context length

## Troubleshooting

### Out of Memory Error
- Close other applications
- Reduce `max_new_tokens` in app.py (line 75)
- Use quantized model version (requires additional setup)

### Slow Responses
- Expected on CPU - consider GPU acceleration
- Reduce context length in prompts
- Lower `max_new_tokens` parameter

### Model Download Fails
- Check internet connection
- Ensure sufficient disk space
- Try downloading again (it will resume if interrupted)

### Port Already in Use
- Change port in app.py: `app.run(port=5001)`
- Or kill the process using port 5000

## Deploying to Production

This local setup is for development/testing. For production:
1. Use a cloud GPU instance (AWS, Google Cloud, etc.)
2. Consider using smaller models for faster inference
3. Implement caching and rate limiting
4. Use production WSGI server (gunicorn with workers)

## Alternative: Lighter Models

If Mistral-7B is too large for your system, consider:
- `mistralai/Mistral-7B-Instruct-v0.3` with 4-bit quantization
- Smaller models like `microsoft/phi-2` (2.7B parameters)
- Continue using the pattern-matching fallback (no download needed)
