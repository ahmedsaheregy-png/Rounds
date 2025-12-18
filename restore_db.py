
import requests
import json

SUPABASE_URL = 'https://antzuhakwgyuswjipmnf.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFudHp1aGFrd2d5dXN3amlwbW5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NjA4ODUsImV4cCI6MjA4MTIzNjg4NX0.xqhNrQk2hwMzCve2kpfhH0JeYXHhsMx1FEgWajydV3A'

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

investors = [
    {
        "full_name": "أ.إبراهيم العص",
        "shares": 1,
        "avatar_url": "https://ahmedsaheregy-png.github.io/partner/assets/ibrahim_alas.jpg"
    },
    {
        "full_name": "أ.صهيب درع",
        "shares": 1,
        "avatar_url": "https://ahmedsaheregy-png.github.io/partner/assets/suhaib_v2.jpg"
    },
    {
        "full_name": "أ.كاوا جوي",
        "shares": 1,
        "avatar_url": "https://ahmedsaheregy-png.github.io/partner/assets/kawa_v1.jpg"
    },
    {
        "full_name": "أ. أحمد شكري",
        "shares": 1,
        "avatar_url": "https://ahmedsaheregy-png.github.io/partner/assets/ahmed_shukri.jpg"
    },
    {
        "full_name": "أ. أحمد عمار",
        "shares": 1,
        "avatar_url": "https://ahmedsaheregy-png.github.io/partner/assets/ahmed_ammar.jpg"
    },
    {
        "full_name": "رزان صهيب",
        "shares": 1,
        "avatar_url": None
    },
    {
        "full_name": "عدنان رامي",
        "shares": 1,
        "avatar_url": None
    }
]

def seed_settings():
    print("Seeding settings...")
    url = f"{SUPABASE_URL}/rest/v1/settings"
    
    # Check existing
    try:
        r = requests.get(f"{url}?select=id", headers=headers)
        r.raise_for_status()
        existing = r.json()
        
        payload = {
            "total_shares": 1000,
            "share_price": 500,
            "is_round_open": True,
            "allow_images": True,
            "display_mode": "full"
        }
        
        if existing and len(existing) > 0:
            print("Settings found. Updating...")
            id_val = existing[0]['id']
            r_up = requests.patch(f"{url}?id=eq.{id_val}", headers=headers, json=payload)
            r_up.raise_for_status()
        else:
            print("Settings missing. Inserting...")
            r_in = requests.post(url, headers=headers, json=payload)
            r_in.raise_for_status()
            
    except Exception as e:
        print(f"Error seeding settings: {e}")

def seed_investors():
    print("Seeding investors...")
    url = f"{SUPABASE_URL}/rest/v1/reservations"
    
    for inv in investors:
        try:
            # Check exist
            # Note: Checking by full_name exactly might be tricky with encoding but let's try
            # Supabase REST uses URL encoding for query params.
            
            # Simplified: Just insert if not exists (using upsert logic is hard without unique constraint on name)
            # We will search first.
            search_url = f"{url}?full_name=eq.{inv['full_name']}"
            r = requests.get(search_url, headers=headers)
            existing = r.json() if r.ok else []
            
            payload = {
                "full_name": inv['full_name'],
                "shares": inv['shares'],
                "phone": "System Added",
                "privacy": "full",
                "visible": True,
                "avatar_url": inv['avatar_url']
            }
            
            if existing and len(existing) > 0:
                print(f"Investor found. Updating...")
                id_val = existing[0]['id']
                requests.patch(f"{url}?id=eq.{id_val}", headers=headers, json=payload)
            else:
                print(f"Investor missing. Inserting...")
                requests.post(url, headers=headers, json=payload)
                
        except Exception as e:
            print(f"Error processing investor: {e}")

if __name__ == "__main__":
    seed_settings()
    seed_investors()
    print("Database restoration complete.")
