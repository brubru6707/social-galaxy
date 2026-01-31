import json
import random
import datetime
from typing import List, Dict, Any

# --- CONFIGURATION ---
NUM_USERS = 40
NUM_EVENTS = 20
NUM_HOT_TAKES = 80 

# --- PROBABILITIES ---
IDENTITY_CATEGORY_CHANCE = 0.15 
WEIGHT_BOOST = 5            
MAX_WEIGHT = 80              
MIN_WEIGHT = 5               

# --- DATA POOLS ---

# 1. IDENTITY QUESTIONS (DUAL TARGETS)
# Structure: "q": (Option A, Option B), "targets": (Target A, Target B)
# Note: They can point to different categories, or the same one.
IDENTITY_QUESTIONS = [
    # -- MIXED CATEGORY CONFLICTS --
    {
        "q": ("Gaming Setup", "Hiking Gear"), 
        "targets": ("tech", "lifestyle") 
    },
    {
        "q": ("Netflix Binge", "Gym Session"), 
        "targets": ("entertainment", "lifestyle")
    },
    {
        "q": ("Uber Eats", "Home Cooking"), 
        "targets": ("food", "lifestyle")
    },
    {
        "q": ("Kindle", "Paperback"), 
        "targets": ("tech", "entertainment") # e-reader vs traditional reading
    },

    # -- PURE CATEGORY INDICATORS (Convergent) --
    # Both options indicate interest in the same topic, just different flavors
    {
        "q": ("Fine Dining", "Street Food"), 
        "targets": ("food", "food")
    },
    {
        "q": ("iOS", "Android"), 
        "targets": ("tech", "tech")
    },
    {
        "q": ("Marvel", "DC"), 
        "targets": ("entertainment", "entertainment")
    },
    
    # -- LIFESTYLE/PERSONALITY --
    {
        "q": ("City Life", "Country Life"), 
        "targets": ("entertainment", "lifestyle") # City implies going out, Country implies nature
    },
    {
        "q": ("Early Bird", "Night Owl"), 
        "targets": ("lifestyle", "entertainment")
    }
]

# 2. REGULAR TOPIC QUESTIONS (Content)
TOPIC_CATEGORIES = {
    "lifestyle": {
        "name": "Lifestyle",
        "questions": [
            ("Coffee", "Tea"), ("Summer", "Winter"), ("Beach", "Mountains"),
            ("Remote Work", "Office Work"), ("Apartment", "House"), ("Walking", "Driving")
        ]
    },
    "tech": {
        "name": "Technology", 
        "questions": [
            ("Mac", "PC"), ("Tabs", "Spaces"), ("Vim", "Emacs"), 
            ("Frontend", "Backend"), ("Laptop", "Desktop"), ("Cloud", "Local")
        ]
    },
    "entertainment": {
        "name": "Entertainment",
        "questions": [
            ("Spotify", "Apple Music"), ("Movies", "Books"), ("TikTok", "Instagram"),
            ("Action", "Comedy"), ("Horror", "Romance")
        ]
    },
    "food": {
        "name": "Food & Drink",
        "questions": [
            ("Pizza", "Burgers"), ("Pancakes", "Waffles"), ("Chocolate", "Vanilla"),
            ("Soda", "Water"), ("Spicy", "Mild")
        ]
    }
}

NAMES = ["Bruno", "Lidia", "Marcus", "Sarah", "Jenna", "Tariq", "Chen", "Wei", "Sofia", "Mateo", "Priya", "Rahul", "Chloe", "Zoe", "Liam", "Noah", "Emma", "Olivia", "Ava", "Elijah", "William", "James", "Benjamin", "Lucas", "Henry", "Alexander", "Mason", "Michael", "Ethan", "Daniel", "Jacob", "Logan", "Jackson", "Levi", "Sebastian", "Jack", "Aiden", "Owen", "Samuel", "Matthew"]
BIOS = ["Coffee addict ☕️", "CS Major", "Gym rat 💪", "Startup founder 🚀", "Artist 🎨", "Just here for the vibes", "Minecraft veteran", "Python wiz", "Hardware hacker", "Foodie 🍔"]
EVENT_TYPES = ["Party", "Hackathon", "Study Session", "Mixer", "Workshop"]

# 3. EVENT-SPECIFIC QUESTIONS (Unique per event)
EVENT_QUESTIONS = [
    ("Study Marathon", "Social Mixer"),
    ("Networking", "Chill Hangout"),
    ("Competition", "Collaboration"),
    ("Formal", "Casual"),
    ("Indoor", "Outdoor"),
    ("Food Provided", "BYO Snacks"),
    ("Early Start", "Late Night"),
    ("Structured", "Free Form"),
    ("Small Group", "Large Crowd"),
    ("Professional", "Fun"),
    ("Educational", "Entertainment"),
    ("Team Building", "Individual Focus"),
    ("Traditional", "Modern"),
    ("Quiet", "Energetic"),
    ("Planning", "Spontaneous"),
    ("Local", "International Theme"),
    ("Tech Heavy", "Tech Light"),
    ("Artistic", "Analytical"),
    ("Physical", "Mental"),
    ("Creative", "Practical"),
    ("Group Discussion", "Individual Work"),
    ("Presentation", "Workshop"),
    ("Lecture", "Interactive"),
    ("Serious", "Lighthearted"),
    ("Professional Development", "Personal Growth")
]

# --- HELPER FUNCTIONS ---

def get_date(days_offset=0):
    return (datetime.datetime.now() + datetime.timedelta(days=days_offset)).isoformat()

def normalize_weights(weights: Dict[str, float]) -> Dict[str, float]:
    total = sum(weights.values())
    if total == 0: return weights
    return {k: (v / total) * 100 for k, v in weights.items()}

def get_initial_weights() -> Dict[str, float]:
    base_categories = list(TOPIC_CATEGORIES.keys())
    # Identity gets 10%, others share the remaining 90% equally
    identity_weight = 10.0
    remaining_weight = 90.0
    other_weight = remaining_weight / len(base_categories)
    weights = {cat: other_weight for cat in base_categories}
    weights["identity"] = identity_weight
    return weights

def update_category_weights(current_weights: Dict[str, float], target_category: str) -> Dict[str, float]:
    """
    Adjusts weights based on the SPECIFIC option selected.
    """
    if target_category not in current_weights:
        return current_weights
        
    weights = current_weights.copy()
    
    # 1. Increase Target
    old_val = weights[target_category]
    new_val = min(old_val + WEIGHT_BOOST, MAX_WEIGHT)
    
    if new_val == old_val:
        return weights 

    # 2. Shrink Others
    remaining_pie = 100.0 - new_val
    current_others_sum = sum(v for k, v in weights.items() if k != target_category)
    scale_factor = remaining_pie / current_others_sum if current_others_sum > 0 else 0

    weights[target_category] = new_val
    for cat in weights:
        if cat != target_category:
            weights[cat] = max(weights[cat] * scale_factor, MIN_WEIGHT)

    return normalize_weights(weights)

# --- GENERATION LOGIC ---

def generate_master_question_list():
    all_questions = []
    
    # 1. Identity Questions (Dual Targets)
    for i, item in enumerate(IDENTITY_QUESTIONS):
        all_questions.append({
            "id": f"q_id_{i}",
            "category_id": "identity", 
            
            # THE NEW LOGIC: Targets split by option
            "option_1": item["q"][0],
            "option_1_target_id": item["targets"][0],
            
            "option_2": item["q"][1],
            "option_2_target_id": item["targets"][1],

            "is_identity": True,
            "question_text": f"{item['q'][0]} vs {item['q'][1]}"
        })
            
    # 2. Topic Questions (Targets are Null)
    count = 0
    for cat_id, data in TOPIC_CATEGORIES.items():
        for q_pair in data["questions"]:
            all_questions.append({
                "id": f"q_top_{count}",
                "category_id": cat_id,
                
                "option_1": q_pair[0],
                "option_1_target_id": None, # Regular qs don't change weights
                
                "option_2": q_pair[1],
                "option_2_target_id": None, 

                "is_identity": False,
                "question_text": f"{q_pair[0]} vs {q_pair[1]}"
            })
            count += 1
            
    return all_questions

def create_hot_takes_pool(master_questions):
    hot_takes = []
    for q in master_questions:
        opt1_pct = random.randint(30, 70)
        hot_takes.append({
            **q,
            "timestamp": get_date(days_offset=random.randint(-10, 0)),
            "stats": {
                "option_1_percent": opt1_pct,
                "option_2_percent": 100 - opt1_pct
            }
        })
    return hot_takes

def generate_events():
    events = []
    available_event_questions = EVENT_QUESTIONS.copy()  # Make a copy to modify
    
    for i in range(NUM_EVENTS):
        # Use event-specific questions, unique per event
        if available_event_questions:
            event_q = available_event_questions.pop(random.randrange(len(available_event_questions)))
        else:
            # Fallback if we run out (shouldn't happen with 25 questions for 20 events)
            event_q = random.choice(EVENT_QUESTIONS)
            
        events.append({
            "id": f"evt_{i}",
            "title": f"{random.choice(['Epic', 'Chill', 'Late Night'])} {random.choice(EVENT_TYPES)}",
            "location": random.choice(['Barus & Holley', 'CIT Building', 'Main Green', 'Joslin']),
            "host": random.choice(NAMES),
            "total_spots": random.randint(10, 100),
            "cost_per_person": random.choice([0, 10, 20, 30, 50]),
            "rsvp_deadline": get_date(days_offset=random.randint(0, 7)),
            "spots_taken": random.randint(0, 10),
            "date": get_date(days_offset=random.randint(1, 14)),
            "event_picture": f"https://picsum.photos/seed/{i}/400/200",
            "attendees": [],
            "event_hot_take_question": event_q[0] + " vs " + event_q[1],
            "event_hot_take_id": f"eht_{i}",
            "event_hot_take_option_1": event_q[0],
            "event_hot_take_option_2": event_q[1]
        })
    return events

def generate_users(hot_takes, events):
    users = []
    
    identity_takes = [ht for ht in hot_takes if ht["is_identity"]]
    topic_takes = [ht for ht in hot_takes if not ht["is_identity"]]
    
    for i in range(NUM_USERS):
        user_name = NAMES[i] if i < len(NAMES) else f"User_{i}"
        user_weights = get_initial_weights()
        user_answers = []
        answered_ids = set()

        num_questions = 5 if i == 0 else random.randint(15, 25)
        
        for _ in range(num_questions):
            # 1. DECIDE: Identity or Regular?
            if random.random() < IDENTITY_CATEGORY_CHANCE:
                # -- IDENTITY QUESTION --
                pool = [q for q in identity_takes if q["id"] not in answered_ids]
                if not pool: continue
                
                selected_q = random.choice(pool)
                
                # USER MAKES A CHOICE
                # We simulate a choice here. 
                # (In a real app, the user clicking triggers the update)
                choice_index = random.choice([1, 2])
                
                if choice_index == 1:
                    selected_opt = selected_q["option_1"]
                    target_to_boost = selected_q["option_1_target_id"]
                else:
                    selected_opt = selected_q["option_2"]
                    target_to_boost = selected_q["option_2_target_id"]

                # UPDATE WEIGHTS BASED ON CHOICE
                user_weights = update_category_weights(user_weights, target_to_boost)
                
                user_answers.append({
                    "question_id": selected_q["id"],
                    "type": "identity",
                    "question_text": selected_q["question_text"],
                    "selected_option": selected_opt,
                    "boosted_category": target_to_boost # Debug info
                })
                answered_ids.add(selected_q["id"])
                
            else:
                # -- REGULAR QUESTION --
                cats = list(user_weights.keys())
                probs = list(user_weights.values())
                chosen_cat = random.choices(cats, weights=probs, k=1)[0]
                
                pool = [q for q in topic_takes if q["category_id"] == chosen_cat and q["id"] not in answered_ids]
                if not pool:
                    pool = [q for q in topic_takes if q["id"] not in answered_ids]
                
                if pool:
                    selected_q = random.choice(pool)
                    user_answers.append({
                        "question_id": selected_q["id"],
                        "type": "regular",
                        "question_text": selected_q["question_text"],
                        "selected_option": random.choice([selected_q["option_1"], selected_q["option_2"]])
                    })
                    answered_ids.add(selected_q["id"])

        user_events = []
        for evt in events:
            if random.random() > 0.8: 
                user_events.append(evt)
                evt["attendees"].append(f"u_{i}")

        # Generate mutuals list
        num_mutuals = 9 if i == 0 else random.randint(0, 10)
        mutuals_list = []
        for _ in range(num_mutuals):
            j = random.randint(0, NUM_USERS - 1)
            while j == i or f"u_{j}" in mutuals_list:
                j = random.randint(0, NUM_USERS - 1)
            mutuals_list.append(f"u_{j}")

        users.append({
            "id": f"u_{i}",
            "name": user_name,
            "bio": random.choice(BIOS),
            "profile_picture": f"https://robohash.org/{user_name}.png",
            "preferences": user_weights,
            "hot_take_answers": user_answers,
            "events_gone_to": user_events,
            "mutuals": mutuals_list,
            "joined": get_date(days_offset=random.randint(-365, 0))
        })
        
    return users

# --- MAIN EXECUTION ---

def main():
    print("Generating schema...")
    master_questions = generate_master_question_list()
    
    # --- VERIFICATION STEP ---
    identity_qs = [q for q in master_questions if q["is_identity"]]
    print(f"Total Identity Questions: {len(identity_qs)}")
    
    for q in identity_qs:
        # Verify both targets exist
        if q["option_1_target_id"] is None or q["option_2_target_id"] is None:
            print(f"❌ ERROR: Identity Question {q['id']} is missing a target")
    print("Verification complete. All Identity questions have dual targets.")
    # -------------------------

    all_hot_takes = create_hot_takes_pool(master_questions)
    events = generate_events()
    
    print(f"Simulating Users...")
    users = generate_users(all_hot_takes, events)
    
    final_db = {
        "config": {
            "identity_chance": IDENTITY_CATEGORY_CHANCE,
            "weight_boost": WEIGHT_BOOST
        },
        "users": users,
        "hot_takes": all_hot_takes,
        "events": events,
        "current_user_id": "u_0"
    }
    
    with open("assets/mock_data.json", "w") as f:
        json.dump(final_db, f, indent=2)
        
    print("SUCCESS: JSON created.")
    
    # DEBUG: Show impact
    u = users[0]
    print(f"\nUser: {u['name']}")
    print(f"Final Weights: {json.dumps(u['preferences'], indent=2)}")
    print("Sample Identity Answers:")
    for a in u['hot_take_answers']:
        if a['type'] == 'identity':
            print(f" - Q: {a['question_text']} | Chose: {a['selected_option']} -> Boosted: {a['boosted_category']}")

if __name__ == "__main__":
    main()