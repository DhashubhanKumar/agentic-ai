import logging
from datetime import datetime

# Configure logging to simulate email sending
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("email_service")

async def send_escalation_email(user_email: str, issue_summary: str, chat_transcript: str) -> bool:
    """
    Mocks sending an escalation email to the admin.
    In production, this would use SMTP or an API like SendGrid.
    """
    admin_email = "dhashupersonal@gmail.com"
    
    email_content = f"""
    ================================================================
    [ESCALATION EMAIL]
    To: {admin_email}
    From: escalation-bot@chronos.com
    Subject: CRITICAL CUSTOMER ISSUE - {user_email}
    Date: {datetime.now().isoformat()}
    
    User: {user_email}
    Issue: {issue_summary}
    
    Transcript:
    {chat_transcript}
    ================================================================
    """
    
    # "Send" the email by logging it
    print(email_content) # Print to stdout so it's visible in logs
    logger.info(f"Escalation email sent to {admin_email} for user {user_email}")
    
    return True
