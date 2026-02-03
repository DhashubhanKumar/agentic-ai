"""Agent 3: Context & Memory Agent - Conversation state and history management"""

from typing import Dict, Any
from langchain_groq import ChatGroq
from langchain.prompts import ChatPromptTemplate
from workflow.state import ConversationState
from utils.groq_prompts import CONVERSATION_SUMMARY_PROMPT


class ContextMemoryAgent:
    """Manages conversation context and generates summaries"""
    
    def __init__(self, llm: ChatGroq):
        self.llm = llm
        self.prompt = ChatPromptTemplate.from_template(CONVERSATION_SUMMARY_PROMPT)
    
    async def process(self, state: ConversationState) -> Dict[str, Any]:
        """
        Update conversation summary and maintain context
        
        Args:
            state: Current conversation state
            
        Returns:
            Updated state with conversation summary
        """
        messages = state.get("messages", [])
        
        # Only generate summary if we have enough messages
        if len(messages) < 3:
            state["conversation_summary"] = "Conversation just started."
            state["agent_type"] = "memory"
            return state
        
        try:
            # Format chat history
            chat_history = self._format_chat_history(messages)
            
            # Generate summary using Groq
            chain = self.prompt | self.llm
            response = await chain.ainvoke({"chat_history": chat_history})
            
            # Update state
            state["conversation_summary"] = response.content
            state["agent_type"] = "memory"
            
            print(f"✓ Conversation summary updated ({len(messages)} messages)")
            
        except Exception as e:
            print(f"✗ Memory agent error: {e}")
            state["conversation_summary"] = "Unable to generate summary."
        
        return state
    
    def _format_chat_history(self, messages: list) -> str:
        """Format messages for summary generation"""
        formatted = []
        for msg in messages[-10:]:  # Last 10 messages
            sender = msg.get("sender", "unknown").upper()
            content = msg.get("content", "")
            formatted.append(f"{sender}: {content}")
        
        return "\n".join(formatted)


def create_memory_agent(llm: ChatGroq) -> ContextMemoryAgent:
    """Factory function to create memory agent"""
    return ContextMemoryAgent(llm)
