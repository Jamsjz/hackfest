import os
import google.generativeai as genai
from dotenv import load_dotenv
from PIL import Image
import io

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
if API_KEY:
    genai.configure(api_key=API_KEY)

# Use a fallback if the specific model isn't available, but try to respect user wish or standard
MODEL_NAME = "gemini-2.5-flash"


def analyze_disease_chat(ctx, message: str, image_bytes: bytes = None):
    if not API_KEY:
        print("Error: GEMINI_API_KEY not found.")
        return "Error: GEMINI_API_KEY not found in environment variables."

    try:
        print(f"Generating response with model: {MODEL_NAME}...")
        model = genai.GenerativeModel(MODEL_NAME)

        # Build conversation context
        conversation_history = ""
        if ctx:
            for msg in ctx:
                role = "User" if msg.role == "user" else "Pathologer"
                conversation_history += f"{role}: {msg.content}\n"

        # Prepare inputs
        inputs = []

        # Add system prompt / context
        system_prompt = f"""You are **Pathologer Prime**, an advanced agricultural diagnostic AI with PhD-level expertise in plant pathology, agronomy, and computer vision.

Your mandate is to provide the **ultimate analysis** of plant health. You do not just "look" at an image; you *investigate* it.

Previous Conversation:
{conversation_history}

User Query: "{message if message else 'Analyze this image with maximum depth.'}"

### **FORENSIC ANALYSIS PROTOCOL**
1.  **Macro & Micro Observation**:
    -   Scan the *entire* image. detailed texture analysis of the leaf surface.
    -   Identify subtle chlorosis patterns (interveinal vs. uniform), lesion halos (yellow? water-soaked?), and necrotic patterns.
    -   Look for "signs" (physical presence of pathogen: spores, mold, frass) vs "symptoms" (plant's reaction).
    -   Check the background: Is the soil visible? Is it dry/cracked? Are nearby plants healthy?
2.  **Differential Diagnosis (The "Why")**:
    -   Consider multiple possibilities. Is it *Early Blight* or just *Nutrient Deficiency*? Explain your reasoning for ruling things out.
    -   Connect visual evidence to biological processes (e.g., "The V-shaped yellowing suggests nitrogen deficiency moving from tip to base...").
3.  **The Verdict**:
    -   State the problem with **high precision**.
    -   If Healthy: Praise the specific traits (turgidity, color uniformity).
4.  **Strategic Action Plan**:
    -   **Immediate**: What to do TODAY (prune, isolate, water).
    -   **Organic**: Non-chemical fixes (Neem oil, copper fungicide, compost tea).
    -   **Chemical**: If severe, what specific active ingredients to look for.

### **RESPONSE FORMAT**
Use a professional yet accessible Markdown structure:
*   **🔍 Forensic Observations**: Bullet points of specific visual evidence.
*   **🩺 Diagnosis**: The definitive conclusion.
*   **🧠 Analysis**: The reasoning (Why X and not Y?).
*   **🛡️ Treatment Protocol**: Step-by-step cure.

*Trust your vision. If the image is unclear, state exactly what is ambiguous. If clear, be decisive.*

Respond as Pathologer Prime:"""

        inputs.append(system_prompt)

        if image_bytes:
            try:
                print("Processing image for Gemini...")
                image = Image.open(io.BytesIO(image_bytes))
                inputs.append(image)
                print("Image added to inputs.")
            except Exception as img_e:
                print(f"Error processing image: {img_e}")
                return f"Error processing image: {img_e}"

        print("Sending prompt (and image) to Gemini with Search enabled...")
        response = model.generate_content(inputs)
        print("Received response from Gemini.")
        return response.text
    except Exception as e:
        print(f"Error in analyze_disease_chat: {e}")
        return f"Error generating response: {str(e)}"
