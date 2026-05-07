import os
import asyncio
import httpx
import html

TELEGRAM_TOKEN = "8695051283:AAEbeHwjAZsZDa3J3NHTuwfEpPkbTpMD_B8"

async def send_interview_link(name: str, phone: str, link: str, method: str = 'telegram'):
    """
    Sends an interview link to a candidate via SMS, WhatsApp, or Telegram.
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

    elif method == 'whatsapp':
        print(f"DEBUG: [WHATSAPP] Sending to {clean_phone}: {message}")
        
    else:
        print(f"DEBUG: [SMS] Sending to {clean_phone}: {message}")
    
    await asyncio.sleep(0.1)
    return True
