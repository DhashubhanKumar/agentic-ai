# Agentic AI-Driven Business Support System - Project Overview

## 1. Project Overview
The **Agentic AI-Driven Business Support System** is a next-generation customer service solution designed to transform static business websites into intelligent, autonomous support ecosystems. Unlike traditional chatbots that operate in isolation, this system is an integrated, real-time support layer powered by a Multi-Agent System (MAS) that can reason, remember, and make autonomous decisions.

## 2. Core Problem & Solution
### The Problem
- **Manual Overload**: Traditional support teams are overwhelmed by basic queries (pricing, order status).
- **Isolated Chatbots**: Existing bots lack context, fail at multi-turn conversations, and frustrate users with generic responses.
- **Lack of Intelligence**: Bots usually don't know when they are failing or when a human needs to step in.

### Our Solution
- **Agentic Collaboration**: Six specialized agents work together like a real support department.
- **Deep Integration**: The system isn't just a widget; it's connected to the database (Prisma) and can perform real-world actions (e.g., placing orders, updating profiles).
- **Proactive Escalation**: It uses sentiment analysis and "friction detection" to autonomously hand off complex cases to human agents before the user gets frustrated.

## 3. Tech Stack
### Frontend (Website Integration)
- **Framework**: Next.js 15+ (React)
- **Styling**: Tailwind CSS (Premium Glassmorphic UI)
- **Animations**: Framer Motion (Smooth, professional transitions)
- **Icons**: Lucide React
- **State Management**: Zustand (Global cart and user state)
- **Communication**: Socket.IO Client (Real-time duplex communication)

### Backend (Process & Data)
- **Web Server**: Next.js API Routes (Serverless)
- **Database**: PostgreSQL
- **ORM**: Prisma (Type-safe database interactions)
- **Auth**: Custom Bcrypt + JWT (Secure, provider-independent authentication)

### AI Backend (The Brain)
- **Engine**: Python 3.10+ & FastAPI
- **LLM Orchestration**: LangChain (Graph-based agent workflows)
- **Models**: Groq (Llama 3 / Mixtral for blazing fast inference)
- **Vector Base**: In-memory / FAISS for semantic product retrieval
- **Real-time Server**: Socket.IO (Python)

## 4. Agentic AI Architecture (The 6-Agent Pipeline)

| Agent | Role | Responsibility |
|-------|------|----------------|
| **1. Interaction Agent** | Intent Classification | Identifies if the user is asking for price, tracking, or account help. |
| **2. Knowledge Agent** | Semantic Retrieval | Fetches real product data and schema-aware information from the database. |
| **3. Memory Agent** | Context & Summary | Maintains multi-turn state; summarizes the conversation so the LLM doesn't "forget". |
| **4. Sentiment Agent** | Friction Detection | Detects frustration, urgency, and query repetition. |
| **5. Decision Agent** | Autonomy & Tools | Decides whether to use tools (add to cart, check orders) or answer directly. |
| **6. Handoff Agent** | Human Transition | Summarizes the entire history and "reasoning path" for a human agent. |

## 5. Key Features & Capabilities
1. **Real-time NLP-to-Action**: "Add two Rolexes to my cart" - The AI interprets, verifies stock, and updates the database immediately.
2. **Persistent Context**: Remembers user preferences and previous queries across the entire browsing session.
3. **Sentiment-Driven Decisions**: Automatically escalates to human support if it detects high frustration or complex complaints.
4. **Schema Awareness**: The AI understands the underlying Prisma models, allowing it to provide highly accurate technical support.
5. **Secure Authentication**: Built-in simple bcrypt auth for personalized user support (order history, address management).

## 6. Business Impact
- **80% Automation**: Handles the majority of FAQs and transactional tasks autonomously.
- **24/7 Availability**: Instant responses at any time of day without human fatigue.
- **Improved UX**: Users get instant actions (like order placement via chat) instead of clicking through complex menus.
- **Scalability**: Can handle thousands of concurrent conversations with minimal operational cost increases.
