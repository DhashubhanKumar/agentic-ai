from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application configuration settings"""
    
    # Groq API
    groq_api_key: str = "your_groq_api_key_here"
    
    # Database
    database_url: str = "file:../dev.db"
    
    # Redis
    redis_url: Optional[str] = None
    
    # CORS
    cors_origins: str = "http://localhost:3000"
    
    # Model Configuration
    primary_model: str = "llama-3.3-70b-versatile"
    fallback_model: str = "llama-3.1-8b-instant"
    model_temperature: float = 0.3
    
    # Agent Configuration
    ai_confidence_threshold: float = 0.5
    escalation_sentiment_threshold: float = -0.3
    max_conversation_history: int = 20
    
    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8000
    backend_service_key: str = "your_service_key_here"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()
