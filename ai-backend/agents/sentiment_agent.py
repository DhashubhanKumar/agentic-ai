"""Agent 4: Sentiment & Friction Detection Agent - User satisfaction monitoring"""

from typing import Dict, Any, List
from langchain_groq import ChatGroq
from langchain.prompts import ChatPromptTemplate
from workflow.state import ConversationState
from utils.groq_prompts import SENTIMENT_ANALYSIS_PROMPT
import json
import re


class SentimentDetectionAgent:
    """Monitors user sentiment and detects friction signals"""
    
    def __init__(self, llm: ChatGroq):
        self.llm = llm
        self.prompt = ChatPromptTemplate.from_template(SENTIMENT_ANALYSIS_PROMPT)
        self.frustration_keywords = [
            "frustrated", "angry", "terrible", "awful", "useless",
            "worst", "horrible", "disappointed", "annoyed", "upset"
        ]
    
    async def process(self, state: ConversationState) -> Dict[str, Any]:
        """
        Analyze sentiment and detect friction signals
        
        Args:
            state: Current conversation state
            
        Returns:
            Updated state with sentiment analysis
        """
        if not state.get("messages"):
            return state
        
        latest_message = state["messages"][-1]
        user_message = latest_message["content"]
        previous_sentiment = state.get("sentiment_score", 0.0)
        conversation_summary = state.get("conversation_summary", "")
        
        try:
            # Format recent history (last 10 messages)
            recent_msgs = state["messages"][-10:]
            history_text = "\n".join([f"{m['sender']}: {m['content']}" for m in recent_msgs])
            
            # Analyze sentiment using Groq
            chain = self.prompt | self.llm
            response = await chain.ainvoke({
                "user_message": user_message,
                "chat_history": history_text
            })
            
            # Parse JSON response
            sentiment_data = self._parse_sentiment_response(response.content)
            
            # Update state
            state["sentiment_score"] = sentiment_data.get("sentiment_score", 0.0)
            state["agent_type"] = "sentiment"
            
            # Detect friction signals
            friction_signals = self._detect_friction(state, sentiment_data)
            state["escalation_signals"] = friction_signals
            
            print(f"✓ Sentiment: {state['sentiment_score']:.2f}, Signals: {len(friction_signals)}")
            
        except Exception as e:
            print(f"✗ Sentiment analysis error: {e}")
            state["sentiment_score"] = 0.0
            state["escalation_signals"] = []
        
        return state
    
    def _parse_sentiment_response(self, response: str) -> Dict[str, Any]:
        """Parse Groq sentiment response"""
        try:
            # Try to extract JSON
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
        except:
            pass
        
        # Fallback: simple parsing
        sentiment_score = 0.0
        if "sentiment_score" in response.lower():
            # Extract number between -1 and 1
            numbers = re.findall(r'-?\d+\.?\d*', response)
            if numbers:
                sentiment_score = float(numbers[0])
                sentiment_score = max(-1.0, min(1.0, sentiment_score))
        
        return {
            "sentiment_score": sentiment_score,
            "frustration_level": "low",
            "escalation_recommended": "no",
            "reason": "Parsed from text"
        }
    
    def _detect_friction(self, state: ConversationState, sentiment_data: Dict) -> List[str]:
        """Detect friction signals in conversation"""
        signals = []
        
        from config import settings
        # Check sentiment score
        if state["sentiment_score"] < settings.escalation_sentiment_threshold:
            signals.append("negative_sentiment")
        
        # Check for frustration keywords
        latest_message = state["messages"][-1]["content"].lower()
        if any(keyword in latest_message for keyword in self.frustration_keywords):
            signals.append("frustration_keywords")
        
        # Check for repeated queries (same intent multiple times)
        if len(state["messages"]) >= 6:
            recent_intents = [state.get("user_intent", "")] * 3
            if len(set(recent_intents)) == 1:
                signals.append("repeated_questions")
        
        # Check AI confidence
        if state.get("retrieval_score", 1.0) < 0.3:
            signals.append("low_confidence_retrieval")
        
        # Check escalation recommendation from sentiment analysis
        if sentiment_data.get("escalation_recommended", "no").lower() == "yes":
            signals.append("ai_recommended_escalation")
        
        return signals


def create_sentiment_agent(llm: ChatGroq) -> SentimentDetectionAgent:
    """Factory function to create sentiment agent"""
    return SentimentDetectionAgent(llm)
