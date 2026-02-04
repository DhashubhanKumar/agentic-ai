"""Agent 7: Consultant Agent - Guided Discovery for Indecisive Users"""

from typing import Dict, Any, List
from langchain_groq import ChatGroq
from workflow.state import ConversationState
import json
import re

class ConsultantAgent:
    """
    Agent responsible for interviewing the user to find the perfect watch.
    It gathers Style, Budget, Features, and Brand preferences step-by-step.
    """
    
    def __init__(self, llm: ChatGroq):
        self.llm = llm
        
        self.system_prompt = """
        You are a sophisticated Luxury Watch Consultant for Chronos.
        Your goal is to help a customer find the perfect watch by asking targeted questions.
        
        You need to gather the following preferences if they are missing:
        1. STRATEGY (Style/Occasion): Sport, Dress, Casual, Diving, Business, Gift
        2. BUDGET: Price range
        3. FEATURES: Chronograph, Automatic, Smart, Water Resistant, etc.
        4. BRAND: Specific brand preference (Optional)

        CURRENT STATUS:
        Collected Preferences: {preferences}
        Last User Message: "{last_message}"

        INSTRUCTIONS:
        - Analyze the user's message to see if they provided any new preferences.
        - If the user provides a preference (like specific brand 'Patek Philippe' or constraint 'cheap'), update the list.
        - NOTE: If the user asks for something contradictory (e.g. 'Cheap Patek Philippe'), acknowledge it in your response text (e.g. 'Patek Philippe watches are typically premium, but I will look for the most accessible options').
        - If you have enough information (at least Style and Budget), recommend 3 types of watches and set action to "search".
        - If you need more info, ask ONE polite, professional question.
        - Be consultative and helpful, like a high-end concierge.
        
        OUTPUT FORMAT:
        Return a JSON object:
        {{
            "updated_preferences": {{
                "style": "...", 
                "budget": "...", 
                "features": "...", 
                "brand": "..."
            }},
            "next_step": "question" or "search",
            "response_text": "Your question or closing statement here",
            "search_query": "search query string if next_step is search"
        }}
        
        Example 1 (Asking for Style):
        {{
            "updated_preferences": {{}},
            "next_step": "question",
            "response_text": "I'd be delighted to assist you. To start, are you looking for a dress watch for formal occasions, or perhaps something more sporty and robust?",
            "search_query": null
        }}
        
        Example 2 (User answered Budget, ready to search):
        {{
            "updated_preferences": {{"style": "Dress", "budget": "Under $1000"}},
            "next_step": "search",
            "response_text": "Excellent choice. Let me find some exquisite dress watches under $1000 for you.",
            "search_query": "Dress watches under 1000 dollars"
        }}
        """

    async def process(self, state: ConversationState) -> Dict[str, Any]:
        """Process the consultation step"""
        
        messages = state.get("messages", [])
        last_message = messages[-1]["content"] if messages else ""
        
        # Get currently collected preferences
        current_prefs = state.get("collected_preferences") or {}
        
        # Construct Prompt
        formatted_prompt = self.system_prompt.format(
            preferences=json.dumps(current_prefs, indent=2),
            last_message=last_message
        )
        
        try:
            print(f"DEBUG Consultant: Processing message: '{last_message}'")
            response = await self.llm.ainvoke(formatted_prompt)
            # Clean up content to just get the JSON part
            content = response.content.strip()
            # Safe Fallback Defaults
            updated_prefs = current_prefs
            next_step = "question"
            response_text = "Could you tell me a bit more about what you're looking for? (Style, Budget, or Brands)"
            
            try:
                # JSON Parsing Logic
                if "```" in content:
                    content = re.sub(r'```json\s*', '', content)
                    content = re.sub(r'```', '', content)
                content = content.strip()
                
                result = None
                try:
                    result = json.loads(content)
                except json.JSONDecodeError:
                    # Regex fallback
                    json_match = re.search(r'(\{.*\})', content, re.DOTALL)
                    if json_match:
                        try:
                            result = json.loads(json_match.group(1))
                        except:
                            pass
                
                if result and isinstance(result, dict):
                    # Valid JSON parsed
                    new_prefs = result.get("updated_preferences", {})
                    updated_prefs = {**current_prefs, **new_prefs}
                    updated_prefs = {k: v for k, v in updated_prefs.items() if v}
                    
                    response_text = result.get("response_text", response_text)
                    next_step = result.get("next_step", "question")
                    
                    if next_step == "search":
                         search_query = result.get("search_query")
                         if search_query:
                             state["route"] = "search"
                             state["extracted_entities"]["category"] = updated_prefs.get("style")
                             state["extracted_entities"]["price_range"] = updated_prefs.get("budget")
                             state["consultation_active"] = False
                             # Early return for search route
                             state["collected_preferences"] = updated_prefs
                             state["ai_response"] = response_text
                             state["agent_type"] = "consultant"
                             return state
                else:
                    # Parsing failed, use raw content as response if it looks like text
                    print(f"Consultant JSON fail. Raw content: {content[:100]}...")
                    # If content is not too long and looks like a sentence, use it
                    if len(content) < 200 and "{" not in content:
                         response_text = content
            except Exception as parse_error:
                print(f"Consultant Logic Error: {parse_error}")
            
            # Final State Update (Fallback or Success)
            state["collected_preferences"] = updated_prefs
            state["ai_response"] = response_text
            state["agent_type"] = "consultant"
            state["consultation_active"] = True # Keep active by default unless searched
            state["route"] = "question"
            # Clear previous search results so they don't appear during the interview
            state["retrieved_products"] = []

        except Exception as e:
            print(f"CRITICAL Consultant Error: {e}")
            state["ai_response"] = "I'm having a brief moment of hesitation. Could you remind me of your budget?"
            state["route"] = "question"
            state["consultation_active"] = True
            
        return state

def create_consultant_agent(llm: ChatGroq) -> ConsultantAgent:
    return ConsultantAgent(llm)
