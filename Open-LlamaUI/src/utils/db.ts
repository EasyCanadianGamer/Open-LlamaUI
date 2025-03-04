import { openDB } from 'idb';

const DB_NAME = 'AdventureDB';
const STORE_NAME = 'stories';

// Initialize IndexDB
const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
};

// Save a new story with full session data
export const saveStory = async (
  sessionId: string,
  { content, input, additionalInput, responseLength }: { content: string; input: string; additionalInput: string; responseLength: string }
) => {
  const db = await initDB();
  return db.put(STORE_NAME, { id: sessionId, content, input, additionalInput, responseLength });
};

// Get a saved story and its associated state
export const getStory = async (sessionId: string) => {
  const db = await initDB();
  return db.get(STORE_NAME, sessionId);
};

// Get all saved stories
export const getAllStories = async () => {
  const db = await initDB();
  return db.getAll(STORE_NAME);
};

// Delete a story
export const deleteStory = async (sessionId: string) => {
  const db = await initDB();
  return db.delete(STORE_NAME, sessionId);
};


