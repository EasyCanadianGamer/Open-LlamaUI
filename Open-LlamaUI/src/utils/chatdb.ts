import { openDB } from 'idb';

// Define the IndexedDB setup
const DB_NAME = 'CharacterDB';
const STORE_NAME = 'characters';

// Initialize the IndexedDB
const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' }); // The ID is assumed to be part of the character data
      }
    },
  });
};

// Save character data to IndexedDB
const saveCharacter = async (character: any) => {
  const db = await initDB();
  return db.put(STORE_NAME, character); // Uses 'put' to either add or update the character
};

// Get all saved characters from IndexedDB
const getCharacters = async () => {
  const db = await initDB();
  return db.getAll(STORE_NAME); // Retrieves all characters from the store
};

// Delete a character by ID from IndexedDB
const deleteCharacter = async (id: string) => {
  const db = await initDB();
  return db.delete(STORE_NAME, id); // Deletes the character with the specified ID
};

// Export all characters to a JSON file
const exportCharactersToJSON = async () => {
  const characters = await getCharacters();
  const jsonString = JSON.stringify(characters, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'characters.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Import characters from JSON string (like the provided `character.json`)
const importCharacterData = async (characterData: string) => {
  try {
    const parsedData = JSON.parse(characterData);
    
    if (parsedData && parsedData.spec_version === '2.0' && parsedData.spec === 'chara_card_v2') {
      const character = {
        id: parsedData.create_date, // Using creation date as the ID for uniqueness
        name: parsedData.name,
        description: parsedData.description,
        personality: parsedData.personality,
        scenario: parsedData.scenario,
        first_mes: parsedData.first_mes,
        mes_example: parsedData.mes_example,
        creatorcomment: parsedData.creatorcomment,
        avatar: parsedData.avatar,
        chat: parsedData.chat,
        talkativeness: parsedData.talkativeness,
        fav: parsedData.fav,
        tags: parsedData.tags,
        spec: parsedData.spec,
        spec_version: parsedData.spec_version,
        data: parsedData.data,
        creator_notes: parsedData.creator_notes,
        system_prompt: parsedData.system_prompt,
        post_history_instructions: parsedData.post_history_instructions,
        creator: parsedData.creator,
        character_version: parsedData.character_version,
        alternate_greetings: parsedData.alternate_greetings,
        extensions: parsedData.extensions,
        create_date: parsedData.create_date,
      };

      await saveCharacter(character);
      console.log('Character imported and saved to IndexedDB:', character);
    } else {
      console.error('Invalid character data structure or version mismatch.');
    }
  } catch (error) {
    console.error('Error importing character data:', error);
  }
};

// Exported functions
export { saveCharacter, getCharacters, deleteCharacter, exportCharactersToJSON, importCharacterData };