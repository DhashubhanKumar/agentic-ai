"""Agent 5: Decision-Making Agent - Response strategy and escalation logic"""

from typing import Dict, Any
from langchain_groq import ChatGroq
from langchain.prompts import ChatPromptTemplate
from workflow.state import ConversationState
from utils.groq_prompts import DECISION_EVALUATION_PROMPT
import json
import re


class DecisionMakingAgent:
    """Agent responsible for making decisions and calling tools"""
    
    def __init__(self, llm: ChatGroq, confidence_threshold: float = 0.5):
        self.llm = llm
        self.confidence_threshold = confidence_threshold
        
        self.system_prompt = """
        You are the Decision Agent for Chronos, a luxury watch store.
        Your goal is to decide the next action based on the user's message and context.
        
        AVAILABLE TOOLS:
        1. "search_products": Use when user asks for specific watches, brands, or browsing.
           Arguments: {"query": "string"}
           
        2. "update_address": Use when user explicitly asks to update their address.
           Arguments: {"new_address": "string"}
           
        3. "create_order": Use when user wants to place an order or buy items in their cart.
           Arguments: {"confirm": true}

        4. "clear_wishlist": Use when user wants to clear their wishlist.
           Arguments: {}
           
        5. "escalate_to_human": Use when user is very angry, threatens legal action, or explicitly asks for a human/admin.
           Arguments: {"reason": "string"}
           
        6. "direct_response": Use for greetings, small talk, or general questions NOT about specific products.
           Arguments: {"response": "string"}
           
        OUTPUT FORMAT:
        You MUST return a JSON object with "action" and "arguments".
        
        Example 1 (Search):
        {
            "action": "search_products",
            "arguments": {"query": "titan watches discount"}
        }
        
        Example 2 (Escalation):
        {
            "action": "escalate_to_human",
            "arguments": {"reason": "User requested admin contact regarding damaged item"}
        }
        
        Example 3 (Chat):
        {
            "action": "direct_response",
            "arguments": {"response": "Hello! Welcome to Chronos. How can I assist you today?"}
        }
        """

    async def process(self, state: ConversationState) -> Dict[str, Any]:
        """Process the conversation state and decide on action"""
        
        # Get latest message
        messages = state.get("messages", [])
        last_message = messages[-1]["content"] if messages else ""
        
        # Simple prompt construction
        prompt = f"{self.system_prompt}\n\nUSER MESSAGE: {last_message}\n\nDECISION JSON:"
        
        try:
            response = await self.llm.ainvoke(prompt)
            content = response.content.replace('```json', '').replace('```', '').strip()
            
            try:
                decision = json.loads(content)
            except json.JSONDecodeError:
                # Try to extract JSON from text if naive parse fails
                json_match = re.search(r'\{.*\}', content, re.DOTALL)
                if json_match:
                    decision = json.loads(json_match.group())
                else:
                    raise ValueError("Could not parse JSON from response")

            action = decision.get("action")
            args = decision.get("arguments", {})
            
            # Execute Tools (Logic handled here for simplicity in this agent)
            # Dynamic imports to avoid circular deps if any
            from tools.database_tools import search_products, update_address, clear_wishlist, create_order_from_cart
            from tools.email_tools import send_escalation_email
            
            state["route"] = "ai_response" # Default
            
            if action == "search_products":
                products = await search_products(args.get("query", ""))
                state["retrieved_products"] = products
                if products:
                    state["ai_response"] = f"I found {len(products)} timepieces matching your request."
                else:
                    state["ai_response"] = "I couldn't find any watches matching that description."
                    
            elif action == "update_address":
                user_id = state.get("user_id")
                if user_id:
                    success = await update_address(user_id, args.get("new_address", ""))
                    if success:
                        state["ai_response"] = f"I've updated your shipping address to: {args.get('new_address')}"
                    else:
                        state["ai_response"] = "I encountered an error updating your address."
                else:
                    state["ai_response"] = "I need you to be logged in to update your address."

            elif action == "create_order":
                user_id = state.get("user_id")
                if user_id:
                    result = await create_order_from_cart(user_id)
                    state["ai_response"] = result.get("message", "Order placed successfully.")
                else:
                    state["ai_response"] = "Please login to place an order."
                    
            elif action == "clear_wishlist":
                user_id = state.get("user_id")
                if user_id:
                    await clear_wishlist(user_id)
                    state["ai_response"] = "Your wishlist has been cleared."
                else:
                    state["ai_response"] = "Please login to manage your wishlist."
                    
            elif action == "escalate_to_human":
                state["route"] = "escalate"
                state["ai_response"] = "I understand your frustration. I have forwarded your request to our administration team at dhashupersonal@gmail.com. They will contact you shortly."
                
                # Send mock email
                transcript = "\n".join([f"{m['sender']}: {m['content']}" for m in messages])
                await send_escalation_email(
                        state.get("user_id", "anonymous_user"),
                        args.get("reason", "User escalation"),
                        transcript
                )
                
            else:
                # direct_response
                state["ai_response"] = args.get("response", "How can I help you regarding our luxury watches?")
                
            state["agent_type"] = "decision_agent"
            state["ai_confidence"] = 1.0
                
        except Exception as e:
            print(f"Decision error: {e}")
            state["ai_response"] = "I apologize, I'm having temporary trouble processing your request."
            state["route"] = "ai_response"
            
        return state

def create_decision_agent(llm: ChatGroq, confidence_threshold: float = 0.5) -> DecisionMakingAgent:
    """Factory function to create decision agent"""
    return DecisionMakingAgent(llm, confidence_threshold)
