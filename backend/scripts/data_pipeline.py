import json
import os
import glob
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
MODEL_NAME = "BAAI/bge-m3"

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: SUPABASE_URL or SUPABASE_KEY is missing in environment variables.")
    exit(1)

sb: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
print(f"Loading embedding model {MODEL_NAME}...")
model = SentenceTransformer(MODEL_NAME)

def extract_translation(data):
    """Extracts an English translation, prioritizing Sivananda (public domain)."""
    if "siva" in data and "et" in data["siva"]:
        return data["siva"]["et"], "Swami Sivananda"
    if "gambir" in data and "et" in data["gambir"]:
        return data["gambir"]["et"], "Swami Gambirananda"
    if "purohit" in data and "et" in data["purohit"]:
        return data["purohit"]["et"], "Shri Purohit Swami"
    if "prabhu" in data and "et" in data["prabhu"]:
        return data["prabhu"]["et"], "A.C. Bhaktivedanta Swami Prabhupada"
    
    # Fallback to any english translation
    for key, val in data.items():
        if isinstance(val, dict) and "et" in val:
            return val["et"], val.get("author", "Unknown")
    return "", "Unknown"

def run():
    print("Reading verses from local JSON dataset...")
    slok_dir = os.path.join(os.path.dirname(__file__), "..", "data", "bhagavad-gita-data", "slok")
    
    if not os.path.exists(slok_dir):
        print(f"Directory not found: {slok_dir}")
        return

    json_files = glob.glob(os.path.join(slok_dir, "*.json"))
    print(f"Found {len(json_files)} sloka files.")

    shlokas_records = []
    translations_records = []

    for idx, file_path in enumerate(json_files):
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        chapter = data.get("chapter")
        verse = data.get("verse")
        sanskrit = data.get("slok", "")
        transliteration = data.get("transliteration", "")
        
        # We need an English translation for embedding context
        translation_text, author = extract_translation(data)
        
        content_to_embed = f"Chapter {chapter} Verse {verse}: {translation_text}"
        emb = model.encode(content_to_embed).tolist()
        
        # We'll use chapter and verse to generate a deterministic UUID for simplicity or let Supabase generate it
        shloka_record = {
            "chapter_number": chapter, 
            "verse_number": verse,
            "sanskrit_text": sanskrit, 
            "transliteration": transliteration,
            "embedding": emb,
            "thematic_tags": []
        }
        shlokas_records.append((shloka_record, translation_text, author))
        
        if (idx + 1) % 50 == 0:
            print(f"Processed {idx + 1}/{len(json_files)} verses...")

    print(f"Upserting {len(shlokas_records)} shlokas to Supabase...")
    
    # Supabase allows upserting lists. However, since we need the shloka_id for the translations table,
    # we should upsert and return the inserted IDs.
    
    # Batch process to avoid payload size issues
    batch_size = 100
    for i in range(0, len(shlokas_records), batch_size):
        batch = shlokas_records[i:i+batch_size]
        shloka_data_batch = [item[0] for item in batch]
        
        # Using returning=True (default) gets us the inserted rows
        res = sb.table("shlokas").upsert(shloka_data_batch).execute()
        
        # Now prepare translations to insert
        trans_batch = []
        for inserted_row, original_item in zip(res.data, batch):
            _, trans_text, trans_author = original_item
            trans_batch.append({
                "shloka_id": inserted_row["id"],
                "language": "en",
                "author_name": trans_author,
                "description": trans_text,
                "source": "bhagavad-gita-data (GitHub)",
                "license": "MIT / Public Domain"
            })
            
        if trans_batch:
            sb.table("translations").upsert(trans_batch).execute()
            
        print(f"Uploaded batch {i // batch_size + 1}")

    print("Successfully loaded all shlokas and translations into Supabase.")

if __name__ == "__main__":
    run()
