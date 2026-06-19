import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: SUPABASE_URL or SUPABASE_KEY is missing in environment variables.")
    exit(1)

sb: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

GRAPH_MAPPING = {
    "anger": [(2,56),(2,62),(2,63),(3,37),(16,21)],
    "depression": [(2,3),(2,14),(18,35)],
    "fear": [(2,20),(2,23),(2,24),(18,30)],
    "grief": [(2,11),(2,13),(2,19),(15,7)],
    "confusion": [(3,2),(3,35),(18,61),(18,66)],
    "anxiety": [(6,5),(6,26),(12,15),(18,45)],
    "detachment": [(2,47),(2,48),(3,19),(5,12)],
}

def tag_verses():
    print("Starting GraphGita topology tagging...")
    for emotion, verse_pairs in GRAPH_MAPPING.items():
        for ch, v in verse_pairs:
            # Fetch existing tags
            res = sb.table("shlokas").select("thematic_tags").eq("chapter_number", ch).eq("verse_number", v).execute()
            if res.data:
                existing_tags = res.data[0].get("thematic_tags") or []
                if emotion not in existing_tags:
                    new_tags = existing_tags + [emotion]
                    sb.table("shlokas").update({"thematic_tags": new_tags}).eq("chapter_number", ch).eq("verse_number", v).execute()
                    print(f"Tagged Chapter {ch} Verse {v} with '{emotion}'")
    print("Graph tagging complete.")

if __name__ == "__main__":
    tag_verses()
