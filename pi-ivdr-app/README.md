# IVDR LLM for Raspberry Pi

This is an optimized Flask app that runs a Phi-3-mini LLM on a Raspberry Pi to answer EU IVDR compliance questions.

## Setup on Raspberry Pi

1. Copy this entire `pi-ivdr-app` folder to your Raspberry Pi:
   ```bash
   scp -r pi-ivdr-app eddiemorrissey16@10.0.0.117:~/
   ```

2. SSH into the Pi:
   ```bash
   ssh eddiemorrissey16@10.0.0.117
   ```

3. Navigate to the folder and run setup:
   ```bash
   cd ~/pi-ivdr-app
   chmod +x setup.sh
   ./setup.sh
   ```

4. Start the server:
   ```bash
   source venv/bin/activate
   python3 app.py
   ```

5. The server will run on `http://10.0.0.117:5001`

## Update your website

Change the API endpoint in `_pages/euivdr-llm.html` from:
```javascript
const response = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3', {
```

To:
```javascript
const response = await fetch('http://10.0.0.117:5001/chat', {
```

## Auto-start on boot (optional)

Create a systemd service to start the server automatically when the Pi boots.
