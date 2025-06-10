#\!/usr/bin/env python3
"""
Test script for the email service
Usage: python test_email.py
"""

from email_service import TripEmailService
from config import EmailConfig

def main():
    print("Testing Nordic Trip Email Service...")
    
    try:
        EmailConfig.validate()
        print("✅ Configuration valid")
        
        service = TripEmailService()
        print("✅ Email service initialized")
        
        print("\nSending test email...")
        if service.test_email():
            print("✅ Test email sent successfully\!")
        else:
            print("❌ Test email failed")
            
        print("\nTesting daily email generation...")
        if service.send_daily_email():
            print("✅ Daily email sent successfully\!")
        else:
            print("ℹ️  No activities for today or email failed")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        print("\nTroubleshooting:")
        print("1. Copy .env.example to .env and fill in your Gmail credentials")
        print("2. Enable 2-factor authentication on Gmail")
        print("3. Generate an app password: https://myaccount.google.com/apppasswords")

if __name__ == "__main__":
    main()
