import { openDB } from 'idb';

const DB_NAME = 'PlaygroundDB';
const STORE_NAME = 'playground_data';

// Initialize IndexedDB
const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    },
  });
};

// Save a prompt and response
export const savePlaygroundData = async (
  systemPrompt: string,
  userPrompt: string,
  responses: string[]
) => {
  const db = await initDB();
  return db.put(STORE_NAME, { systemPrompt, userPrompt, responses });
};

// Get saved playground data
export const getPlaygroundData = async () => {
  const db = await initDB();
  return db.getAll(STORE_NAME);
};

// Delete all saved playground data
export const deletePlaygroundData = async () => {
  const db = await initDB();
  return db.clear(STORE_NAME);
};
