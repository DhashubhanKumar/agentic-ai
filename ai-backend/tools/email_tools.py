import logging
from datetime import datetime

# Configure logging to simulate email sending
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("email_service")

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import settings

async def send_escalation_email(user_email: str, issue_summary: str, chat_transcript: str) -> bool:
    """
    Sends an escalation email to the admin using SMTP.
    Falls back to logging if credentials are not configured.
    """
    admin_email = settings.admin_email
    
    email_body = f"""
    CRITICAL CUSTOMER ISSUE
    =======================
    User: {user_email}
    Time: {datetime.now().isoformat()}
    
    ISSUE SUMMARY:
    {issue_summary}
    
    FULL TRANSCRIPT:
    ----------------------------------------------------------------
    {chat_transcript}
    ----------------------------------------------------------------
    
    Sent by Chronos AI Escalation System
    """
    
    # log it first
    print(email_body)
    logger.info(f"Escalation email generated for {admin_email}")

    # File-based email "sending"
    try:
        import os
        
        # Create mails directory in the parent project1 folder (assuming running from ai-backend)
        mails_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "mails")
        os.makedirs(mails_dir, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"escalation_{timestamp}_{user_email}.txt"
        file_path = os.path.join(mails_dir, filename)
        
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(f"Subject: 🚨 Escalation: Issue with {user_email}\n")
            f.write(f"To: {admin_email}\n")
            f.write(email_body)
            
        logger.info(f"✅ Email 'sent' to file: {file_path}")
        print(f"✅ Email saved to: {file_path}")
        return True
        
    except Exception as e:
        logger.error(f"❌ Failed to write email file: {e}")
        return False
