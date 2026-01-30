import json
import random
import datetime

# --- CONFIGURATION ---
NUM_USERS = 40
NUM_EVENTS = 20
NUM_HOT_TAKES = 80

# --- RAW DATA POOLS ---
NAMES = ["Bruno", "Lidia", "Marcus", "Sarah", "Jenna", "Tariq", "Chen", "Wei", "Sofia", "Mateo", "Priya", "Rahul", "Chloe", "Zoe", "Liam", "Noah", "Emma", "Olivia", "Ava", "Elijah", "William", "James", "Benjamin", "Lucas", "Henry", "Alexander", "Mason", "Michael", "Ethan", "Daniel", "Jacob", "Logan", "Jackson", "Levi", "Sebastian", "Jack", "Aiden", "Owen", "Samuel", "Matthew"]
BIOS = ["Coffee addict ☕️", "CS Major @ Brown", "Gym rat 💪", "Startup founder 🚀", "Artist 🎨", "Just here for the vibes", "Minecraft veteran", "Python wiz", "Hardware hacker", "Foodie 🍔"]
EVENT_TYPES = ["Party", "Hackathon", "Study Session", "Mixer", "Workshop"]
HOT_TAKES_TOPICS = [
    ("Cats", "Dogs"), ("Coffee", "Tea"), ("Minecraft", "Terraria"), 
    ("iOS", "Android"), ("Morning", "Night"), ("Summer", "Winter"),
    ("Tabs", "Spaces"), ("Vim", "Emacs"), ("Frontend", "Backend"),
    ("Pizza", "Burgers"), ("Marvel", "DC"), ("Star Wars", "Star Trek"),
    ("Pancakes", "Waffles"), ("Texting", "Calling"), ("TikTok", "Instagram"),
    ("Windows", "Mac"), ("Crunchy", "Smooth"), ("Books", "Movies"),
    ("Beach", "Mountains"), ("Chocolate", "Vanilla"), ("Soccer", "Basketball"),
    ("Pop", "Soda"), ("Pineapple on Pizza", "No Pineapple on Pizza"), ("Batman", "Superman"),
    ("Harry Potter", "Lord of the Rings"), ("Netflix", "HBO"), ("Spotify", "Apple Music"),
    ("Uber", "Lyft"), ("Airbnb", "Hotels"), ("Tesla", "Gas Cars"),
    ("Remote Work", "Office Work"), ("Cryptocurrency", "Traditional Banking"),
    ("AI", "Human Creativity"), ("Streaming", "Cable TV"), ("Electric", "Gas Stoves")
]

# --- HELPERS ---
def get_date(days_offset=0):
    date = datetime.datetime.now() + datetime.timedelta(days=days_offset)
    return date.isoformat()

# --- GENERATE HOT TAKES ---
hot_takes = []
for i in range(NUM_HOT_TAKES):
    topic = random.choice(HOT_TAKES_TOPICS)
    # Randomize percentages
    opt1_pct = random.randint(30, 70)
    hot_takes.append({
        "id": f"ht_{i}",
        "timestamp": get_date(days_offset=-i),
        "question": f"{topic[0]} vs {topic[1]}",
        "option_1": topic[0],
        "option_2": topic[1],
        "stats": {
            "option_1_percent": opt1_pct,
            "option_2_percent": 100 - opt1_pct
        }
    })

# --- GENERATE EVENTS ---
events = []
for i in range(NUM_EVENTS):
    e_type = random.choice(EVENT_TYPES)
    events.append({
        "id": f"evt_{i}",
        "title": f"{random.choice(['Epic', 'Chill', 'Late Night', 'Official'])} {e_type}",
        "description": "Come hang out and meet new people! Pizza provided.",
        "location": f"{random.choice(['Barus & Holley', 'CIT Building', 'Main Green', 'Joslin'])}",
        "host": random.choice(NAMES),
        "total_spots": random.randint(10, 100),
        "spots_taken": random.randint(0, 10),
        "cost_per_person": random.choice([0, 5, 10, 15]),
        "rsvp_deadline": get_date(days_offset=random.randint(1, 14)),
        "event_picture": f"https://picsum.photos/seed/{i}/400/200", # Random placeholder image
        "attendees": [] # To be filled later
    })

# --- GENERATE USERS ---
users = []
for i in range(NUM_USERS):
    user_name = NAMES[i] if i < len(NAMES) else f"User_{i}"
    
    # Generate Answers (Constraint: Provide Question Text + Answer)
    user_answers = []
    # User answers about 70% of the questions
    for ht in hot_takes:
        if random.random() > 0.3: 
            selected = random.choice([ht["option_1"], ht["option_2"]])
            user_answers.append({
                "question_id": ht["id"],
                "question_text": ht["question"], # Redundant but useful for POC
                "selected_option": selected
            })

    # Generate Event History
    user_events = []
    for evt in events:
        if random.random() > 0.8: # 20% chance to attend an event
            user_events.append(evt)
            evt["attendees"].append(f"u_{i}") # Add user to event

    users.append({
        "id": f"u_{i}",
        "name": user_name,
        "bio": random.choice(BIOS),
        "dob": "2003-05-15",
        "profile_picture": f"https://robohash.org/{user_name}.png",
        "events_gone_to": user_events,
        "hot_take_answers": user_answers
    })

# --- COMPILE FINAL JSON ---
final_db = {
    "users": users,
    "daily_hot_takes": hot_takes,
    "events": events,
    "current_user": "u_0"
}

# Write to file
with open("mock_data.json", "w") as f:
    json.dump(final_db, f, indent=2)

print("SUCCESS: 'mock_data.json' created with 40 Users, 20 Events, and 80 Questions.")