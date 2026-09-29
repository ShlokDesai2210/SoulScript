"""
SoulScript - "Speak Human. We'll Speak AI."
Main Flask application that powers the thought-to-prompt transformation.

How this works:
1. User types a raw, messy thought on the frontend
2. User picks a task category (writing, coding, art, etc.)
3. This backend sends both to the Gemini API with a special system prompt
4. Gemini interprets the thought, recommends the best AI tool, and generates
   a polished prompt optimized for that AI
5. We send the result back to the frontend to display
"""
from flask import Flask, render_template, request, jsonify
from google import genai
from dotenv import load_dotenv
import json
import os

# Load environment variables from .env file
# This is how we keep the API key secret and out of the code
load_dotenv()

# Create the Flask app
app = Flask(__name__)

# Initialize the Gemini AI client with our API key
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


# ---------- HELPER FUNCTIONS ----------

def load_json_file(filename):
    """Load and return data from a JSON file in the data/ folder.
    
    Args:
        filename: Name of the JSON file (e.g., 'ai_profiles.json')
    
    Returns:
        The parsed JSON data as a Python dict or list
    """
    filepath = os.path.join(os.path.dirname(__file__), "data", filename)
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


def build_system_prompt(ai_profiles, category):
    """Build the system prompt that tells Gemini how to act.
    
    This is the 'brain' of SoulScript - it instructs Gemini to:
    - Understand messy human thoughts
    - Match them to the best AI tool
    - Generate a polished, optimized prompt
    
    Args:
        ai_profiles: Dict of all AI tool profiles and their strengths
        category: The task category the user selected
    
    Returns:
        A formatted system prompt string
    """
    return f"""You are SoulScript, an expert AI prompt engineer.

Your job is to take a user's raw, unstructured, messy thought and transform it
into a well-crafted prompt. Users are often naive and don't know how to talk to AI,
so you need to understand their TRUE intent even if they express it poorly.

STEPS:
1. INTERPRET: Understand what the user actually wants, even if their thought is
   fragmented, has typos, or is vague.
2. RECOMMEND: Based on the task, recommend which AI tool(s) would be best.
   Consider the strengths of each AI tool listed below.
3. GENERATE: Create a detailed, well-structured prompt that's optimized for
   the #1 recommended AI tool.

AVAILABLE AI TOOLS:
{json.dumps(ai_profiles, indent=2)}

The user's selected task category is: {category}

RESPOND IN THIS EXACT JSON FORMAT (no other text):
{{
    "understood_intent": "Clear 1-2 sentence summary of what the user actually wants",
    "recommended_ais": [
        {{
            "name": "AI Name (use exact name from profiles)",
            "key": "ai_key (the lowercase key like 'gemini', 'chatgpt', etc.)",
            "reason": "One sentence explaining why this AI is the best choice",
            "confidence": 0.95
        }}
    ],
    "generated_prompt": "The complete, polished prompt ready to copy and paste into the recommended AI. Make it detailed, structured, and optimized for the AI's prompt style.",
    "tips": ["Practical tip 1 for better results", "Practical tip 2"]
}}

IMPORTANT RULES:
- Always recommend 2-3 AIs, ranked by suitability
- Confidence should be between 0.5 and 1.0
- The generated prompt should be at least 3-4 sentences
- Tips should be actionable and specific to this task
- If the thought is about images/art, prioritize Midjourney and DALL-E
- If the thought is about code, prioritize Gemini, Claude, and Copilot
- If the thought is about current events/research, prioritize Perplexity"""


# ---------- ROUTES ----------

@app.route("/")
def home():
    """Serve the main SoulScript page.
    
    When someone visits http://localhost:5000/, Flask renders the
    index.html template and sends it to their browser.
    """
    return render_template("index.html")


@app.route("/api/transform", methods=["POST"])
def transform_thought():
    """Transform a raw thought into a structured AI prompt.
    
    This is the main API endpoint. The frontend sends:
    - thought: The user's raw, messy thought (string)
    - category: The selected task category (string)
    
    We send these to Gemini with our system prompt, and return:
    - understood_intent: What the user actually wants
    - recommended_ais: Ranked list of best AI tools
    - generated_prompt: The polished prompt
    - tips: Helpful tips for better results
    """
    # Get the data sent from the frontend
    data = request.json
    raw_thought = data.get("thought", "").strip()
    category = data.get("category", "general")

    # Validate - don't process empty thoughts
    if not raw_thought:
        return jsonify({"error": "Please enter a thought first!"}), 400

    # Load the AI profiles from our data file
    ai_profiles = load_json_file("ai_profiles.json")

    # Build the system prompt that instructs Gemini
    system_prompt = build_system_prompt(ai_profiles, category)

    try:
        # Call the Gemini API
        # Using gemini-3.5-flash — confirmed working with this API key
        response = client.models.generate_content(
            model="gemini-flash-lite-latest",
            contents=raw_thought,
            config={
                "system_instruction": system_prompt,
                "response_mime_type": "application/json",
            }
        )

        # Parse Gemini's JSON response
        result = json.loads(response.text)
        return jsonify(result)

    except json.JSONDecodeError:
        # If Gemini didn't return valid JSON
        return jsonify({
            "error": "AI response wasn't formatted correctly. Please try again."
        }), 500
    except Exception as e:
        # Catch any other errors (network issues, API key problems, etc.)
        return jsonify({
            "error": f"Something went wrong: {str(e)}"
        }), 500


@app.route("/api/categories")
def get_categories():
    """Return the list of task categories.
    
    The frontend calls this when the page loads to build
    the category picker buttons.
    """
    categories = load_json_file("categories.json")
    return jsonify(categories)


@app.route("/api/ai-profiles")
def get_ai_profiles():
    """Return all AI tool profiles.
    
    Used by the AI Guide sidebar panel to show
    information about each AI tool.
    """
    profiles = load_json_file("ai_profiles.json")
    return jsonify(profiles)


# ---------- START THE SERVER ----------

if __name__ == "__main__":
    # debug=True means:
    # - Auto-reloads when you change code
    # - Shows detailed error pages
    # - DON'T use debug=True in production!
    print("\n🔥 SoulScript is running!")
    print("   Open http://localhost:5000 in your browser\n")
    app.run(debug=True, port=5000)
