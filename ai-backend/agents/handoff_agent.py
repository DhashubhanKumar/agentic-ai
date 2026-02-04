"""Agent 6: Human Handoff Agent - Seamless escalation with context transfer"""

from typing import Dict, Any
from langchain_groq import ChatGroq
from langchain.prompts import ChatPromptTemplate
from workflow.state import ConversationState
from utils.groq_prompts import HANDOFF_SUMMARY_PROMPT
import json
import re
from datetime import datetime


class HumanHandoffAgent:
    """Manages escalation to human agents with full context"""
    
    def __init__(self, llm: ChatGroq):
        self.llm = llm
        self.prompt = ChatPromptTemplate.from_template(HANDOFF_SUMMARY_PROMPT)
    
    async def process(self, state: ConversationState) -> Dict[str, Any]:
        """
        Create handoff package for human agent
        
        Args:
            state: Current conversation state
            
        Returns:
            Updated state with handoff data
        """
        try:
            # Format conversation history
            chat_history = self._format_chat_history(state.get("messages", []))
            
            # Format extracted entities
            entities = json.dumps(state.get("extracted_entities", {}), indent=2)
            
            # Format sentiment data
            sentiment_data = {
                "current_sentiment": state.get("sentiment_score", 0.0),
                "friction_signals": state.get("escalation_signals", []),
                "ai_confidence": state.get("ai_confidence", 0.0)
            }
            
            # Generate handoff summary using Groq
            chain = self.prompt | self.llm
            response = await chain.ainvoke({
                "full_chat_history": chat_history,
                "entities": entities,
                "sentiment_data": json.dumps(sentiment_data, indent=2)
            })
            
            # Parse handoff summary
            handoff_summary = self._parse_handoff_response(response.content)
            
            # Create complete handoff package
            handoff_data = {
                "session_id": state.get("session_id", ""),
                "user_id": state.get("user_id"),
                "timestamp": datetime.utcnow().isoformat(),
                "conversation_history": state.get("messages", []),
                "conversation_summary": state.get("conversation_summary", ""),
                "user_intent": state.get("user_intent", ""),
                "sentiment_analysis": sentiment_data,
                "extracted_context": {
                    "products_discussed": [p.get("name", "") for p in state.get("retrieved_products", [])],
                    "entities": state.get("extracted_entities", {})
                },
                "ai_recommendation": handoff_summary.get("suggested_approach", ""),
                "urgency_level": self._determine_urgency(state),
                "handoff_summary": handoff_summary
            }
            
            # Update state
            state["agent_type"] = "handoff"
            state["ai_response"] = (
                "I apologize for the trouble. I've escalated your issue to our human support team. "
                "A specialist will review your case and contact you via email within 24 hours."
            )
            
            # Store handoff data in state metadata
            if state.get("metadata") is None:
                state["metadata"] = {}
            state["metadata"]["handoff_data"] = handoff_data
            
            # Send Escalation Email
            from tools.email_tools import send_escalation_email
            
            # Construct a comprehensive summary for the email
            email_summary = (
                f"Issue: {handoff_summary.get('issue_summary')}\n"
                f"Urgency: {handoff_data['urgency_level']}\n"
                f"Sentiment Score: {sentiment_data['current_sentiment']}\n"
                f"AI Recommendation: {handoff_summary.get('suggested_approach')}"
            )
            
            await send_escalation_email(
                user_email=state.get("user_id", "Unknown User"), 
                issue_summary=email_summary, 
                chat_transcript=chat_history
            )
            
            print(f"✓ Handoff package created, urgency: {handoff_data['urgency_level']}")
            
        except Exception as e:
            print(f"✗ Handoff agent error: {e}")
            state["ai_response"] = "I apologize for the difficulty. Let me connect you with a human agent."
        
        return state
    
    def _format_chat_history(self, messages: list) -> str:
        """Format full chat history for handoff"""
        formatted = []
        for msg in messages:
            sender = msg.get("sender", "unknown").upper()
            content = msg.get("content", "")
            timestamp = msg.get("timestamp", "")
            formatted.append(f"[{timestamp}] {sender}: {content}")
        
        return "\n".join(formatted)
    
    def _parse_handoff_response(self, response: str) -> Dict[str, Any]:
        """Parse Groq handoff summary response"""
        try:
            # Try to extract JSON
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
        except:
            pass
        
        # Fallback: return raw response
        return {
            "issue_summary": "Customer needs assistance",
            "key_points": [response[:200]],
            "suggested_approach": "Review conversation history and assist customer",
            "urgent_flags": []
        }
    
    def _determine_urgency(self, state: ConversationState) -> str:
        """Determine urgency level for handoff"""
        sentiment = state.get("sentiment_score", 0.0)
        friction_signals = state.get("escalation_signals", [])
        
        # High urgency
        if sentiment < -0.5 or len(friction_signals) >= 4:
            return "high"
        
        # Medium urgency
        if sentiment < -0.2 or len(friction_signals) >= 2:
            return "medium"
        
        # Low urgency
        return "low"


def create_handoff_agent(llm: ChatGroq) -> HumanHandoffAgent:
    """Factory function to create handoff agent"""
    return HumanHandoffAgent(llm)
