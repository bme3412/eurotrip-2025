import yagmail
import json
import argparse
from datetime import datetime
from jinja2 import Template
from config import EmailConfig

class TripEmailService:
    def __init__(self):
        EmailConfig.validate()
        self.yag = yagmail.SMTP(EmailConfig.GMAIL_EMAIL, EmailConfig.GMAIL_APP_PASSWORD)
        
    def load_trip_data(self):
        with open('../trip-itinerary.json', 'r') as f:
            return json.load(f)
    
    def get_today_activities(self, trip_data):
        today = datetime.now(EmailConfig.TIMEZONE).strftime('%Y-%m-%d')
        timeline = trip_data.get('timeline', {})
        today_data = timeline.get(today)
        
        if today_data:
            # Add the date to the dictionary, as the template uses it.
            today_data['date'] = today
            
        return today_data
    
    def create_email_content(self, day_data):
        if not day_data:
            return None, None

        # Choose an accent colour based on the day's country (fallback = Nordic red)
        accent = EmailConfig.COUNTRY_COLORS.get(
            day_data.get("type", ""), ["#E8433F"]
        )[0]

        template = Template("""<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>{{ day_data.date }} – {{ day_data.city or day_data.location }}</title>
</head>
<body style="margin: 0; padding: 0; background: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size: 14px; line-height: 1.5;">
        <!-- Header -->
        <tr>
            <td style="background: {{ accent }}; color: #ffffff; padding: 12px 15px;">
                <p style="margin: 0; font-size: 20px; font-weight: 600;">{{ day_data.icon or '📅' }} {{ day_data.activity }}</p>
                <p style="margin: 4px 0 0; font-size: 14px; opacity: 0.9;">{{ day_data.date }} • {{ day_data.city or day_data.location }}</p>
            </td>
        </tr>
        
        <!-- Macro for content sections -->
        {% macro render_section(title, accent_color, items, icon, type) %}
        {% if items %}
        <tr>
            <td style="padding: 15px; border-top: 1px solid #eeeeee;">
                <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="padding-bottom: 10px;">
                            <p style="margin: 0; font-size: 16px; color: {{ accent_color }}; font-weight: 600;">{{ icon }} {{ title }}</p>
                        </td>
                    </tr>
                    {% for item in items %}
                    <tr>
                        <td style="padding-bottom: 5px;">
                            <p style="margin: 0; color: #333333;">
                            {% if type == 'schedule' %}
                                <strong style="font-weight: 600;">{{ item.time or 'All day' }}:</strong> {{ item.activity }}{% if item.location %} <span style="color:#666666;">– {{ item.location }}</span>{% endif %}
                            {% elif type == 'attractions' %}
                                <strong style="font-weight: 600;">{{ item.name }}</strong>{% if item.time %} <span style="color:#666666;">({{ item.time }})</span>{% endif %}
                            {% elif type == 'transport' %}
                                {% if item is mapping %}<strong style="font-weight: 600;">{{ item.method }}:</strong> {{ item.route }} <span style="color:#666666;">({{ item.duration }})</span>{% else %}{{ item }}{% endif %}
                            {% elif type == 'tips' %}
                                {{ item }}
                            {% elif type == 'costs' %}
                                <strong style="text-transform: capitalize;">{{ item[0].replace('_', ' ') }}:</strong> {{ item[1] }}
                            {% endif %}
                            </p>
                        </td>
                    </tr>
                    {% endfor %}
                </table>
            </td>
        </tr>
        {% endif %}
        {% endmacro %}
        
        {{ render_section("Schedule", accent, day_data.scheduledActivities, '📋', 'schedule') }}
        {{ render_section("Attractions", '#27ae60', day_data.attractions, '⭐', 'attractions') }}
        {{ render_section("Transportation", '#f39c12', day_data.transportation, '🚌', 'transport') }}
        {{ render_section("Tips", '#16a085', day_data.tips, '💡', 'tips') }}
        {{ render_section("Costs", '#5D6D7E', day_data.costs.items() if day_data.costs else none, '💰', 'costs') }}

        <!-- Footer -->
        <tr>
            <td style="padding: 15px; text-align: center; background: #fafafa; border-top: 1px solid #eeeeee;">
                <p style="margin: 0; font-size: 11px; color: #888888;">This is an automated reminder for your trip.</p>
            </td>
        </tr>
    </table>
</body>
</html>""")

        subject = f"📅 Today: {day_data.get('activity')} in {day_data.get('city') or day_data.get('location', '')}"
        html_content = template.render(day_data=day_data, accent=accent)

        return subject, html_content

    def send_daily_email(self):
        try:
            trip_data = self.load_trip_data()
            today_data = self.get_today_activities(trip_data)
            
            if not today_data:
                print(f"No activities found for today ({datetime.now(EmailConfig.TIMEZONE).strftime('%Y-%m-%d')})")
                return False
                
            subject, content = self.create_email_content(today_data)
            
            if subject and content:
                self.yag.send(
                    to=EmailConfig.RECIPIENT_EMAIL,
                    subject=subject,
                    contents=content
                )
                print(f"Daily email sent successfully for {today_data.get('date')}")
                return True
            else:
                print("No email content generated")
                return False
                
        except Exception as e:
            print(f"Error sending daily email: {str(e)}")
            return False
    
    def test_email(self):
        try:
            test_html = """
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                        font-size: 14px; color: #333; max-width: 600px; margin: 0 auto; 
                        padding: 20px; background: #f9f9f9; border-radius: 8px;">
                <p style="margin: 0 0 10px 0;"><strong>✅ Email service is working!</strong></p>
                <p style="margin: 0 0 10px 0;">You'll get daily itinerary updates during your Nordic trip.</p>
                <p style="color: #666; font-size: 12px; margin: 0;">This was a test message.</p>
            </div>
            """
            
            self.yag.send(
                to=EmailConfig.RECIPIENT_EMAIL,
                subject="🧪 Test - Nordic Trip Alerts",
                contents=test_html
            )
            print("Test email sent successfully!")
            return True
        except Exception as e:
            print(f"Test email failed: {str(e)}")
            return False

    def send_preview_email(self, date_override=None):
        """Send a preview email for a specific date (useful for testing)"""
        try:
            trip_data = self.load_trip_data()
            
            if date_override:
                timeline = trip_data.get('timeline', {})
                preview_data = timeline.get(date_override)
                if preview_data:
                    preview_data['date'] = date_override
            else:
                preview_data = self.get_today_activities(trip_data)
            
            if not preview_data:
                print(f"No activities found for date: {date_override or 'today'}")
                return False
                
            subject, content = self.create_email_content(preview_data)
            
            if subject and content:
                preview_subject = f"🔍 PREVIEW: {subject}"
                self.yag.send(
                    to=EmailConfig.RECIPIENT_EMAIL,
                    subject=preview_subject,
                    contents=content
                )
                print(f"Preview email sent successfully for {preview_data.get('date')}")
                return True
            else:
                print("No email content generated for preview")
                return False
                
        except Exception as e:
            print(f"Error sending preview email: {str(e)}")
            return False

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Send trip itinerary emails.")
    parser.add_argument("--test", action="store_true", help="Send a test email.")
    parser.add_argument("--send", action="store_true", help="Send the daily itinerary email.")
    parser.add_argument("--preview", type=str, help="Send a preview email for a specific date (YYYY-MM-DD).")
    args = parser.parse_args()

    service = TripEmailService()

    if args.test:
        print("Sending a test email...")
        service.test_email()
    elif args.send:
        print("Sending the daily itinerary...")
        service.send_daily_email()
    elif args.preview:
        print(f"Sending a preview email for {args.preview}...")
        service.send_preview_email(args.preview)
    else:
        print("Please specify an action: --test, --send, or --preview YYYY-MM-DD")