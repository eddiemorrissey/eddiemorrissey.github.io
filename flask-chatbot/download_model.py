#!/usr/bin/env python3
"""
Script to download Mistral-7B-Instruct-v0.3 model locally
"""

import os
from transformers import AutoModelForCausalLM, AutoTokenizer

print("=" * 60)
print("Downloading Mistral-7B-Instruct-v0.3")
print("=" * 60)
print("\nThis will download approximately 14GB of data.")
print("The model will be cached in: ~/.cache/huggingface/hub/")
print("\n" + "=" * 60 + "\n")

model_name = "mistralai/Mistral-7B-Instruct-v0.3"

print(f"Downloading tokenizer for {model_name}...")
tokenizer = AutoTokenizer.from_pretrained(model_name)
print("✓ Tokenizer downloaded successfully!\n")

print(f"Downloading model {model_name}...")
print("This may take 10-30 minutes depending on your internet speed...\n")

model = AutoModelForCausalLM.from_pretrained(
    model_name,
    low_cpu_mem_usage=True
)

print("\n✓ Model downloaded successfully!")
print(f"\nModel is cached at: ~/.cache/huggingface/hub/")
print("\nYou can now run: python app.py")
print("=" * 60)
