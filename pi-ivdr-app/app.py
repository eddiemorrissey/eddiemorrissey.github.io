from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load smaller model suitable for Raspberry Pi
print("Loading Phi-3-mini model...")
model_name = "microsoft/Phi-3-mini-4k-instruct"

device = "cpu"  # Raspberry Pi will use CPU
print(f"Using device: {device}")

try:
    tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        torch_dtype=torch.float32,
        low_cpu_mem_usage=True,
        trust_remote_code=True
    )
    model = model.to(device)
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None
    tokenizer = None

def generate_response(user_message):
    """Generate response using Phi-3 model"""
    if model is None or tokenizer is None:
        return "Model not loaded. Please ensure the model is downloaded properly."
    
    try:
        # Prepare the prompt
        prompt = f"""<|system|>
You are an expert EU IVDR (In Vitro Diagnostic Regulation) compliance assistant. Provide accurate, detailed answers about EU IVDR requirements, classifications, conformity assessment, technical documentation, clinical evidence, UDI registration, vigilance, and quality management systems. Keep responses concise but informative (2-3 paragraphs maximum).<|end|>
<|user|>
{user_message}<|end|>
<|assistant|>"""
        
        # Tokenize and generate
        inputs = tokenizer(prompt, return_tensors="pt").to(device)
        
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=400,
                temperature=0.7,
                top_p=0.95,
                do_sample=True,
                pad_token_id=tokenizer.eos_token_id
            )
        
        # Decode the response
        full_response = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Extract only the assistant's response
        if "<|assistant|>" in full_response:
            response = full_response.split("<|assistant|>")[-1].strip()
        else:
            response = full_response
        
        return response
        
    except Exception as e:
        print(f"Error generating response: {e}")
        return f"Error: {str(e)}"

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'model_loaded': model is not None})

@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.json.get('message', '')
    
    if not user_message:
        return jsonify({'response': 'Please enter a message.'})
    
    bot_response = generate_response(user_message)
    
    return jsonify({'response': bot_response})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=False)
