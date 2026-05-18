import os
import asyncio
import httpx
import html

TELEGRAM_TOKEN = "8695051283:AAEbeHwjAZsZDa3J3NHTuwfEpPkbTpMD_B8"

async def send_interview_link(name: str, phone: str, link: str, method: str = 'telegram'):
    """
    Sends an interview link to a candidate via SMS or Telegram.
    """
    clean_phone = "".join(filter(str.isdigit, phone))
    safe_name = html.escape(name)
    safe_link = html.escape(link)

    message = (
        f"<b>👋 Hello {safe_name}!</b>\n\n"
        f"Congratulations! You have been selected for the interview at <b>Kannada AI</b>.\n\n"
        f"🚀 <b><a href='{safe_link}'>Click here to start your interview</a></b>\n\n"
        f"Best of luck! 🎯"
    )

    if method == 'telegram':
        # NOTE: Telegram bots cannot message users by phone number. 
        # The user must have started a chat with the bot first.
        # For now, we will log the attempt and provide the code to send if a chat_id is available.
        print(f"DEBUG: [TELEGRAM] Attempting to notify {name}...")
        
        async with httpx.AsyncClient() as client:
            try:
                # This is a placeholder Chat ID. In a real scenario, you'd store the user's telegram_id in the DB.
                # If you want to test this, replace with your own Chat ID.
                CHAT_ID = os.getenv("TELEGRAM_CHAT_ID") 
                
                if CHAT_ID:
                    url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
                    response = await client.post(url, data={
                        "chat_id": CHAT_ID,
                        "text": message,
                        "parse_mode": "HTML"
                    })
                    if response.status_code == 200:
                        print(f"SUCCESS: [TELEGRAM] Message sent to Chat ID {CHAT_ID}")
                    else:
                        print(f"ERROR: [TELEGRAM] Failed to send: {response.text}")
                else:
                    print(f"INFO: [TELEGRAM] Mock mode (No Chat ID provided). Message: {message}")
            except Exception as e:
                print(f"ERROR: [TELEGRAM] API call failed: {e}")

    elif method == 'sms':
        auth_key = os.getenv("MSG91_AUTH_KEY")
        template_id = os.getenv("MSG91_TEMPLATE_ID")
        sender_id = os.getenv("MSG91_SENDER_ID", "KNDAAI")
        
        if not auth_key or not template_id:
            print("ERROR: [MSG91] Credentials (MSG91_AUTH_KEY/MSG91_TEMPLATE_ID) missing in .env")
            print(f"DEBUG: [SMS Mock] Sending to {clean_phone}: {message}")
            return False

        url = "https://control.msg91.com/api/v5/flow/"
        headers = {
            "authkey": auth_key,
            "accept": "application/json",
            "content-type": "application/json"
        }
        
        # Format phone with 91 if needed
        formatted_phone = clean_phone if clean_phone.startswith("91") else f"91{clean_phone}"
        
        payload = {
            "template_id": template_id,
            "sender": sender_id,
            "short_url": "0",
            "mobiles": formatted_phone,
            "name": name,
            "link": link
        }
        
        print(f"DEBUG: [MSG91] Sending SMS to {formatted_phone} using template {template_id}...")
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(url, headers=headers, json=payload)
                if response.status_code == 200:
                    print(f"SUCCESS: [MSG91] SMS sent to {formatted_phone}")
                    return True
                else:
                    print(f"ERROR: [MSG91] Failed to send: {response.text}")
                    return False
            except Exception as e:
                print(f"ERROR: [MSG91] API call failed: {e}")
                return False
    
    else:
        print(f"DEBUG: [UNKNOWN METHOD] Mock sending to {clean_phone}: {message}")
    
    await asyncio.sleep(0.1)
    return True
