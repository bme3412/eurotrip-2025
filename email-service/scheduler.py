import schedule
import time
from datetime import datetime
from email_service import TripEmailService
from config import EmailConfig

class DailyEmailScheduler:
    def __init__(self):
        self.email_service = TripEmailService()
        
    def run_daily_email(self):
        print(f"[{datetime.now(EmailConfig.TIMEZONE)}] Running daily email check...")
        self.email_service.send_daily_email()
        
    def start_scheduler(self):
        print(f"Starting email scheduler...")
        print(f"Daily emails will be sent at {EmailConfig.ALERT_TIME} ({EmailConfig.TIMEZONE})")
        
        schedule.every().day.at(EmailConfig.ALERT_TIME).do(self.run_daily_email)
        
        while True:
            schedule.run_pending()
            time.sleep(60)

if __name__ == "__main__":
    try:
        scheduler = DailyEmailScheduler()
        scheduler.start_scheduler()
    except KeyboardInterrupt:
        print("\nScheduler stopped by user")
    except Exception as e:
        print(f"Scheduler error: {str(e)}")

