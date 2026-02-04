"""Agent 8: Refund Agent - Policy-aware return/refund validation"""

from typing import Dict, Any
from langchain_groq import ChatGroq
from workflow.state import ConversationState
import json
import re
from datetime import datetime, timedelta


class RefundAgent:
    """
    Agent responsible for handling return/refund requests.
    Validates customer requests against return policy through guided questioning.
    """
    
    def __init__(self, llm: ChatGroq):
        self.llm = llm
        
        # Return Policy Rules
        self.policy = {
            "return_window_days": 7,
            "refund_window_days": 10,
            "restocking_fee_percent": 15,
            "valid_reasons": [
                "defective",
                "damaged_on_arrival", 
                "wrong_item",
                "changed_mind",
                "size_fit_issue",
                "not_as_described"
            ],
            "non_returnable_conditions": [
                "custom_engraved",
                "broken_seal",
                "tampered_warranty",
                "final_sale"
            ]
        }
        
        self.system_prompt = """
        You are the Refund Specialist for Chronos Luxury Watches.
        Your goal is to validate return/refund requests against our policy through professional questioning.
        
        RETURN POLICY SUMMARY:
        - Returns: Within 7 days of delivery
        - Refunds: Within 10 days of delivery
        - Product must be unworn, pristine condition with all original packaging
        - Valid reasons: Defective, Wrong item, Changed mind (15% restocking fee), Size/fit, Not as described
        - Non-returnable: Custom/engraved, broken seals, final sale items
        
        VALIDATION QUESTIONS (Ask in order, one at a time):
        1. **Order Information**: "Could you provide your order ID or the email you used for the purchase?"
        2. **Purchase Date**: "When did you receive the watch?" (Check if within 7-10 days)
        3. **Return Reason**: "What is the reason for your return?" (Must match valid reasons)
        4. **Product Condition**: "Is the watch unworn with all original packaging, tags, and protective film intact?"
        5. **Special Conditions**: "Was this a custom/engraved watch or purchased during a final sale?"
        6. **Shipping Preference**: "Are you able to ship the item back using insured, trackable shipping?"
        
        COLLECTED INFO:
        {collected_info}
        
        LAST USER MESSAGE: "{last_message}"
        
        INSTRUCTIONS:
        - Analyze the user's response and extract relevant information
        - Update collected_info with new details
        - If you have all required information and the request meets policy requirements, set next_step to "approve"
        - If the request violates policy (e.g., outside time window, damaged condition), set next_step to "deny"
        - If you need more information, ask the NEXT question in sequence
        - Be empathetic and professional, especially when denying requests
        
        OUTPUT FORMAT (JSON):
        {{
            "updated_info": {{
                "order_id": "...",
                "purchase_date": "YYYY-MM-DD",
                "days_since_purchase": number,
                "reason": "...",
                "condition": "pristine|worn|damaged",
                "has_packaging": true|false,
                "is_custom": true|false,
                "can_ship_insured": true|false
            }},
            "next_step": "question|approve|deny",
            "response_text": "Your question or decision message",
            "policy_violation": "reason if denied, else null"
        }}
        
        Example (Asking for order ID):
        {{
            "updated_info": {{}},
            "next_step": "question",
            "response_text": "I'd be happy to help with your return. To get started, could you please provide your order ID or the email address you used for the purchase?",
            "policy_violation": null
        }}
        
        Example (Approved):
        {{
            "updated_info": {{"order_id": "ORD123", "purchase_date": "2026-02-01", "days_since_purchase": 3, "reason": "defective", "condition": "pristine", "has_packaging": true}},
            "next_step": "approve",
            "response_text": "Thank you for providing all the details. Your return request meets our policy requirements. I'll initiate the return process. You'll receive a return shipping label via email within 24 hours. Once we receive and inspect the watch, your refund will be processed within 5-7 business days.",
            "policy_violation": null
        }}
        
        Example (Denied - Outside window):
        {{
            "updated_info": {{"purchase_date": "2026-01-15", "days_since_purchase": 20}},
            "next_step": "deny",
            "response_text": "I understand your situation, and I apologize for any inconvenience. Unfortunately, your purchase was 20 days ago, which is outside our 7-day return window. As per our policy, we're unable to process returns after this period. However, if the watch is defective, please let me know and I can escalate this to our warranty team.",
            "policy_violation": "outside_return_window"
        }}
        """
    
    async def process(self, state: ConversationState) -> Dict[str, Any]:
        """Process refund request validation"""
        
        messages = state.get("messages", [])
        last_message = messages[-1]["content"] if messages else ""
        
        # Get currently collected refund info
        current_info = state.get("refund_collected_info") or {}
        
        # Construct Prompt
        formatted_prompt = self.system_prompt.format(
            collected_info=json.dumps(current_info, indent=2),
            last_message=last_message
        )
        
        try:
            print(f"DEBUG Refund Agent: Processing message: '{last_message}'")
            response = await self.llm.ainvoke(formatted_prompt)
            content = response.content.strip()
            
            # Safe Fallback Defaults
            updated_info = current_info
            next_step = "question"
            response_text = "Could you provide your order ID so I can look into your return request?"
            policy_violation = None
            
            try:
                # JSON Parsing
                if "```" in content:
                    content = re.sub(r'```json\s*', '', content)
                    content = re.sub(r'```', '', content)
                content = content.strip()
                
                result = None
                try:
                    result = json.loads(content)
                except json.JSONDecodeError:
                    json_match = re.search(r'(\{.*\})', content, re.DOTALL)
                    if json_match:
                        try:
                            result = json.loads(json_match.group(1))
                        except:
                            pass
                
                if result and isinstance(result, dict):
                    new_info = result.get("updated_info", {})
                    updated_info = {**current_info, **new_info}
                    updated_info = {k: v for k, v in updated_info.items() if v is not None}
                    
                    response_text = result.get("response_text", response_text)
                    next_step = result.get("next_step", "question")
                    policy_violation = result.get("policy_violation")
                    
                    if next_step == "approve":
                        # Initiate return process
                        state["route"] = "refund_approved"
                        state["refund_active"] = False
                        
                        # Store refund data for processing
                        if state.get("metadata") is None:
                            state["metadata"] = {}
                        state["metadata"]["refund_data"] = {
                            "status": "approved",
                            "info": updated_info,
                            "timestamp": datetime.utcnow().isoformat()
                        }
                        
                    elif next_step == "deny":
                        state["route"] = "refund_denied"
                        state["refund_active"] = False
                        
                        # Optionally offer escalation
                        if "defective" in last_message.lower() or "damaged" in last_message.lower():
                            response_text += "\n\nWould you like me to connect you with our warranty team?"
                        
                        if state.get("metadata") is None:
                            state["metadata"] = {}
                        state["metadata"]["refund_data"] = {
                            "status": "denied",
                            "reason": policy_violation,
                            "info": updated_info,
                            "timestamp": datetime.utcnow().isoformat()
                        }
                else:
                    print(f"Refund Agent JSON parse failed. Raw: {content[:100]}...")
                    if len(content) < 200 and "{" not in content:
                        response_text = content
                        
            except Exception as parse_error:
                print(f"Refund Agent Logic Error: {parse_error}")
            
            # Final State Update
            state["refund_collected_info"] = updated_info
            state["ai_response"] = response_text
            state["agent_type"] = "refund_agent"
            state["refund_active"] = (next_step == "question")
            
        except Exception as e:
            print(f"CRITICAL Refund Agent Error: {e}")
            state["ai_response"] = "I apologize for the technical difficulty. Let me connect you with our support team to handle your return request."
            state["route"] = "escalate"
            state["refund_active"] = False
        
        return state


def create_refund_agent(llm: ChatGroq) -> RefundAgent:
    return RefundAgent(llm)
