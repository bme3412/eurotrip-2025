import os
from dotenv import load_dotenv
import pytz

# Load environment variables from .env file
load_dotenv()

class EmailConfig:
    # Gmail credentials
    GMAIL_EMAIL = os.getenv('GMAIL_EMAIL')
    GMAIL_APP_PASSWORD = os.getenv('GMAIL_APP_PASSWORD')
    
    # Recipient's email
    RECIPIENT_EMAIL = os.getenv('RECIPIENT_EMAIL')
    
    # Timezone for accurate daily updates
    # Example: 'America/New_York', 'Europe/London'
    TIMEZONE = pytz.timezone(os.getenv('TIMEZONE', 'UTC'))
    
    ALERT_TIME = os.getenv('ALERT_TIME', '08:00')
    
    COUNTRY_COLORS = {
        "france":  ["#E1000F", "#FFFFFF", "#000091"],
        "iceland": ["#D72828", "#FFFFFF", "#003897"],
        "norway":  ["#BA0C2F", "#FFFFFF", "#00205B"],
        "denmark": ["#C8102E", "#FFFFFF"],
        "sweden":  ["#005583", "#FFC200"],
        "finland": ["#003580", "#FFFFFF"],
        # travel-day aliases fall back to a neutral red
        "travel":               ["#E8433F"],
        "travel-france-sweden": ["#005583"],  # first leg's colour
        "travel-sweden-norway": ["#BA0C2F"],
        "travel-denmark-norway": ["#C8102E"],
        "travel-norway-denmark": ["#BA0C2F"],
        "travel-norway-iceland": ["#D72828"],
    }
    
    @classmethod
    def validate(cls):
        """Validate that all required environment variables are set."""
        required_vars = ['GMAIL_EMAIL', 'GMAIL_APP_PASSWORD', 'RECIPIENT_EMAIL']
        missing = [var for var in required_vars if not getattr(cls, var)]
        
        if missing:
            raise ValueError(f"Missing required environment variables: {', '.join(missing)}")
        
        # Check for placeholder values
        if cls.GMAIL_EMAIL and "your_email" in cls.GMAIL_EMAIL:
            print("Warning: Please update the placeholder email addresses in your .env file")
        
        if cls.RECIPIENT_EMAIL and "recipient_email" in cls.RECIPIENT_EMAIL:
            print("Warning: Please update the recipient email address in your .env file")
        
        if cls.GMAIL_APP_PASSWORD and "your_app_password" == cls.GMAIL_APP_PASSWORD:
            print("Warning: Please set your Gmail App Password in your .env file")
        
        return True