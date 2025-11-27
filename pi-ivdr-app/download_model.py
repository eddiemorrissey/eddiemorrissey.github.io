#!/usr/bin/env python3
"""
Script to download Phi-3-mini model locally (optimized for Raspberry Pi)
"""

import os
from transformers import AutoModelForCausalLM, AutoTokenizer

print("=" * 60)
print("Downloading Phi-3-mini-4k-instruct")
print("=" * 60)
print("\nThis will download approximately 7GB of data.")
print("The model will be cached in: ~/.cache/huggingface/hub/")
print("\n" + "=" * 60 + "\n")

model_name = "microsoft/Phi-3-mini-4k-instruct"

print(f"Downloading tokenizer for {model_name}...")
tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
print("✓ Tokenizer downloaded successfully!\n")

print(f"Downloading model {model_name}...")
print("This may take 15-45 minutes depending on your internet speed...\n")

model = AutoModelForCausalLM.from_pretrained(
    model_name,
    low_cpu_mem_usage=True,
    trust_remote_code=True
)

print("\n✓ Model downloaded successfully!")
print(f"\nModel is cached at: ~/.cache/huggingface/hub/")
print("\nYou can now run: python app.py")
print("=" * 60)
