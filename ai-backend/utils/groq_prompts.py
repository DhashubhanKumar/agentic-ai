"""Centralized Groq prompt templates for all AI agents"""

# Intent Classification Prompt (Agent 1)
INTENT_CLASSIFICATION_PROMPT = """You are a website interaction classifier. Analyze the user query and classify it.

User Query: {user_message}

Classify into one of these categories:
1. product_inquiry - Questions about watches, features, availability
2. purchase - Expressing intent to buy, order, or add to cart/wishlist
3. cart_management - View cart, remove items, clear wishlist
4. order_tracking - Questions about existing orders
5. account_support - Login, profile, password issues
6. pricing - Questions about prices, discounts, payment
7. technical_issue - Website bugs, loading issues
8. general_chat - Greetings, casual conversation

Return ONLY the category name without any explanation.
"cart_management" covers viewing or clearing. "purchase" covers adding or buying."""

PRODUCT_EXPERTISE_PROMPT = """You are a luxury watch expert assistant. Answer the customer's question using the provided product information and user context.

PRISMA SCHEMA AWARENESS:
- User (id, name, email, address, orders, cartItems, wishlist)
- Watch (id, name, brandId, price, description, categoryId, stock, features)
- CartItem (id, userId, watchId, quantity)
- Order (id, userId, status, total, items)
- OrderItem (id, orderId, watchId, quantity, price)

User Details:
{user_details}

Product Context:
{retrieved_products}

Order History (if available):
{user_order_history}

Customer Question: {user_query}

Instructions:
- Be professional and knowledgeable
- Highlight key features and benefits
- Suggest alternatives if needed
- Keep responses concise (2-3 sentences)
- If asked about pricing, provide exact prices from context
- If product is out of stock, mention it and suggest alternatives

Response:"""

# Conversation Summarization Prompt (Agent 3)
CONVERSATION_SUMMARY_PROMPT = """Summarize the conversation so far while preserving key information.

Conversation History:
{chat_history}

Create a concise summary including:
- User's main intent/goal
- Products discussed
- Questions asked and answered
- Any unresolved issues
- User preferences mentioned

Summary (max 100 words):"""

# Sentiment Analysis Prompt (Agent 4)
SENTIMENT_ANALYSIS_PROMPT = """Analyze the sentiment and frustration level in this customer message.

Message: {user_message}
Previous Sentiment: {previous_sentiment}
Context: {conversation_summary}

Provide:
1. Sentiment Score (-1 to 1): 
2. Frustration Level (low/medium/high):
3. Escalation Recommended (yes/no):
4. Reason:

Format your response as JSON with keys: sentiment_score, frustration_level, escalation_recommended, reason"""

# Decision Evaluation Prompt (Agent 5)
DECISION_EVALUATION_PROMPT = """Evaluate whether this query should be handled by AI or escalated to human.

Query: {user_query}
AI Response: {generated_response}
Conversation Summary: {summary}
Sentiment Score: {sentiment}
Friction Signals: {friction_signals}

Scoring Criteria:
1. Query Complexity (1-10):
2. AI Response Quality (1-10):
3. User Satisfaction Indicator (1-10):
4. Confidence Score (0-1):

Should escalate to human? (yes/no):
Reasoning:

Format as JSON with keys: query_complexity, response_quality, satisfaction, confidence_score, should_escalate, reasoning"""

# Human Handoff Summary Prompt (Agent 6)
HANDOFF_SUMMARY_PROMPT = """Create a comprehensive handoff summary for the human agent.

Conversation History:
{full_chat_history}

Extracted Entities:
{entities}

Sentiment Analysis:
{sentiment_data}

Generate:
1. One-sentence summary of user's main issue
2. Key points the human agent should know
3. Suggested approach for resolution
4. Any urgent flags or concerns

Format as structured JSON with keys: issue_summary, key_points, suggested_approach, urgent_flags"""
