import sys
import os
import traceback

# Add current directory to path
sys.path.append(os.getcwd())

print("Attempting to import app.__main__...")
try:
    from app.__main__ import app
    print("SUCCESS: app.__main__ imported correctly.")
except Exception:
    print("FAILURE: Could not import app.__main__.")
    traceback.print_exc()
