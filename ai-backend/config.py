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
    primary_model: str = "llama-3.1-8b-instant"
    fallback_model: str = "llama-3.1-8b-instant"
    model_temperature: float = 0.3
    
    # Agent Configuration
    ai_confidence_threshold: float = 0.5
    escalation_sentiment_threshold: float = -0.1
    max_conversation_history: int = 20
    max_conversation_history: int = 20
    
    # Email Configuration
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: Optional[str] = None
    smtp_password: Optional[str] = None
    admin_email: str = "dhashupersonal@gmail.com"
    
    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8000
    backend_service_key: str = "your_service_key_here"
    
    class Config:
        env_file = "../.env"  # Look in parent directory
        case_sensitive = False
        extra = "ignore"  # Ignore Next.js variables in shared .env


# Global settings instance
settings = Settings()
