from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Ollama configuration (runs locally on the Raspberry Pi)
OLLAMA_HOST = os.environ.get('OLLAMA_HOST', 'http://localhost:11434')
OLLAMA_MODEL = os.environ.get('OLLAMA_MODEL', 'phi3:mini')

SYSTEM_PROMPT = (
    "You are an expert EU IVDR (In Vitro Diagnostic Regulation) compliance assistant. "
    "Provide accurate, practical guidance about IVDR requirements: device classification, "
    "conformity assessment, technical documentation, clinical evidence, UDI/EUDAMED, vigilance, "
    "transition timelines, notified bodies, and QMS (ISO 13485). Keep answers concise (1–2 paragraphs) "
    "and structured with bullet points where helpful. If unsure, say so and suggest verifying with "
    "the official IVDR text or competent authority guidance."
)

def ollama_generate(prompt: str) -> str:
    try:
        resp = requests.post(
            f"{OLLAMA_HOST}/api/generate",
            json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False,
            },
            timeout=60,
        )
        resp.raise_for_status()
        data = resp.json()
        return data.get('response', '').strip() or "(No response from model)"
    except Exception as e:
        print(f"Ollama error: {e}")
        return f"Error contacting local LLM: {e}"

def build_prompt(user_message: str) -> str:
    return (
        f"System: {SYSTEM_PROMPT}\n\n"
        f"User: {user_message}\n\n"
        f"Assistant:"
    )

@app.route('/health', methods=['GET'])
def health():
    # Check Ollama is reachable
    try:
        r = requests.get(f"{OLLAMA_HOST}/api/tags", timeout=5)
        ok = r.status_code == 200
        tags = r.json().get('models', []) if ok else []
    except Exception:
        ok = False
        tags = []
    return jsonify({'status': 'healthy', 'ollama': ok, 'model': OLLAMA_MODEL, 'available_models': tags})

@app.route('/chat', methods=['POST'])
def chat():
    user_message = (request.json or {}).get('message', '').strip()
    if not user_message:
        return jsonify({'response': 'Please enter a message.'})

    prompt = build_prompt(user_message)
    response = ollama_generate(prompt)
    return jsonify({'response': response})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=False)
