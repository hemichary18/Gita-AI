const https = require('https');
const fs = require('fs');
const path = require('path');

const fetchJson = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Node.js' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
         return fetchJson(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
         reject(new Error(`Status: ${res.statusCode}`));
         return;
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
         try { resolve(JSON.parse(data)); } catch (e) { reject(new Error("Invalid JSON")); }
      });
    }).on('error', err => reject(err));
  });
};

async function run() {
  try {
    console.log("Fetching verses...");
    const verses = await fetchJson('https://raw.githubusercontent.com/gita/gita/main/data/verse.json');
    console.log(`Got ${verses.length} verses.`);
    
    console.log("Fetching translations...");
    const translationsData = await fetchJson('https://raw.githubusercontent.com/gita/gita/main/data/translation.json');
    console.log(`Got ${translationsData.length} translations.`);

    // Merge them. Find the english translation for each verse.
    // In gita/gita repo, translations have: verse_id, language_id (probably 1 for English), description
    const englishTranslations = translationsData.filter(t => t.language_id === 1 || t.lang === 'english' || t.language_id === 2);
    
    const merged = verses.map(v => {
      // Find matching translation
      const trans = translationsData.find(t => t.verse_id === v.id && (t.language_id === 1 || t.lang === 'en'));
      return {
        chapter_id: v.chapter_id || v.chapter_number,
        verse_number: v.verse_number,
        sanskrit: v.text,
        transliteration: v.transliteration,
        translation: trans ? trans.description : (v.word_meanings || 'Translation not found')
      };
    });

    const outPath = path.join(__dirname, 'frontend', 'src', 'data', 'bhagavad_gita.json');
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(merged, null, 2));
    console.log("Saved merged records: " + merged.length);
  } catch(e) {
    console.log(e);
  }
}

run();
