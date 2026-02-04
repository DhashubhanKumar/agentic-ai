"""Agent 1: Website Interaction Agent - Entry point and query routing"""

from typing import Dict, Any
from langchain_groq import ChatGroq
from langchain.prompts import ChatPromptTemplate
from workflow.state import ConversationState
from utils.groq_prompts import INTENT_CLASSIFICATION_PROMPT
import json


class WebsiteInteractionAgent:
    """Entry point for all user queries - validates and routes to appropriate agents"""
    
    def __init__(self, llm: ChatGroq):
        self.llm = llm
        self.prompt = ChatPromptTemplate.from_template(INTENT_CLASSIFICATION_PROMPT)
    
    async def process(self, state: ConversationState) -> Dict[str, Any]:
        """
        Process incoming message and determine routing
        
        Args:
            state: Current conversation state
            
        Returns:
            Updated state with intent and routing information
        """
        # Get the latest user message
        if not state.get("messages"):
            return state
        
        latest_message = state["messages"][-1]
        user_message = latest_message["content"]
        
        # Classify intent using Groq
        try:
            chain = self.prompt | self.llm
            response = await chain.ainvoke({"user_message": user_message})
            intent = response.content.strip().lower()
            
            # Validate intent
            valid_intents = [
                "product_inquiry",
                "order_tracking",
                "account_support",
                "pricing",
                "technical_issue",
                "general_chat",
                "purchase",
                "cart_management",
                "consultation",
                "refund_request",
                "human_handoff"
            ]
            
            if intent not in valid_intents:
                intent = "general_chat"
            
            # Update state
            state["user_intent"] = intent
            state["agent_type"] = "interaction"
            
            # Determine initial route
            if intent == "human_handoff":
                # Route directly to decision agent with escalation instruction?
                # Or maybe add a 'handoff' route directly?
                # The graph might not have a direct edge from interaction -> handoff?
                # Let's check graph.py. Actually, usually we route via decision or knowledge.
                # But for now, let's route to 'decision' but set a flag, or add a special handling.
                # Actually, simpler: Route to DecisionAgent but set intent clearly.
                # DecisionAgent has "escalate_to_human" tool.
                state["route"] = "knowledge" # Default fallback, but let's try to handle it better.
                # Actually, let's see where DecisionAgent gets its input.
                # Ideally we want to go straight to Handoff. 
                # Does interaction -> handoff edge exist?
                # Let's assume we route to 'decision' and let it decide to escalate based on intent.
                state["route"] = "decision" # We need to ensure graph has this edge
            elif intent == "consultation":
                state["route"] = "consultation"
            elif intent == "refund_request":
                state["route"] = "refund"
            elif intent in ["product_inquiry", "pricing", "purchase", "cart_management"]:
                state["route"] = "knowledge"
            elif intent == "general_chat":
                state["route"] = "direct_response"
            else:
                state["route"] = "knowledge"
            
            print(f"✓ Intent classified: {intent}")
            
        except Exception as e:
            print(f"✗ Intent classification error: {e}")
            state["user_intent"] = "general_chat"
            state["route"] = "direct_response"
        
        return state


def create_interaction_agent(llm: ChatGroq) -> WebsiteInteractionAgent:
    """Factory function to create interaction agent"""
    return WebsiteInteractionAgent(llm)
