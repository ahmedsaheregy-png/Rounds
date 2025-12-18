
import requests
import json

url = "https://antzuhakwgyuswjipmnf.supabase.co/rest/v1/settings?select=*"
headers = {
    "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFudHp1aGFrd2d5dXN3amlwbW5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NjA4ODUsImV4cCI6MjA4MTIzNjg4NX0.xqhNrQk2hwMzCve2kpfhH0JeYXHhsMx1FEgWajydV3A",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFudHp1aGFrd2d5dXN3amlwbW5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NjA4ODUsImV4cCI6MjA4MTIzNjg4NX0.xqhNrQk2hwMzCve2kpfhH0JeYXHhsMx1FEgWajydV3A"
}

try:
    print("Fetching settings...")
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    data = response.json()
    print("Settings Data:", json.dumps(data, indent=2))
    
    if data and len(data) > 0:
        row = data[0]
        if 'round_status' in row:
            print("SUCCESS: 'round_status' column exists.")
        else:
            print("WARNING: 'round_status' column DOES NOT exist.")
            
            # Since user wants it fixed, I can't easily alter DB schema from here without SQL access, 
            # but I can confirm why the save might fail.
            # However, my app.js fallback should handle this.
            
    else:
        print("Settings table is empty or unreadable.")

except Exception as e:
    print(f"Error: {e}")
