import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getCharacters, importCharacterData, deleteCharacter } from '../utils/chatdb'; // Import IndexedDB functions

interface ChatMessage {
  id: number;
  text: string;
  isAI: boolean;
}

interface Character {
  id: string; // Change `id` type to `string` to match IndexedDB
  name: string;
  description?: string;
  personality?: string;
  scenario?: string;
  first_mes?: string;
  mes_example?: string;
  creatorcomment?: string;
  avatar?: string;
  chat?: string;
  talkativeness?: string;
  fav?: boolean;
  tags?: string[];
  spec?: string;
  spec_version?: string;
  data?: any;
}

interface ChatUIProps {
  characterData: string;
  setCharacters: React.Dispatch<React.SetStateAction<Character[]>>;
}

const ChatUI: React.FC<ChatUIProps> = ({ characterData, setCharacters }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null); // Change type to `string`
  const [characters, setCharactersState] = useState<Character[]>([]);

  // Fetch all characters from IndexedDB when component mounts
  useEffect(() => {
    const fetchCharacters = async () => {
      const savedCharacters = await getCharacters();
      setCharactersState(savedCharacters);
      setCharacters(savedCharacters); // Sync with parent state
    };
    fetchCharacters();
  }, [setCharacters]);

  // Import character data and save it to IndexedDB
  useEffect(() => {
    if (characterData) {
      importCharacterData(characterData).then(() => {
        // After import, refresh characters list
        const fetchCharacters = async () => {
          const savedCharacters = await getCharacters();
          setCharactersState(savedCharacters);
          setCharacters(savedCharacters);
        };
        fetchCharacters();
      });
    }
  }, [characterData, setCharacters]);


  const handleSendMessage = async () => {
    if (input.trim() === '' || !selectedCharacter) return;
  
    const character = characters.find((char) => char.id === selectedCharacter);
    if (!character) {
      console.error('Selected character not found');
      return;
    }
  
    const newMessage: ChatMessage = { id: Date.now(), text: input, isAI: false };
    setMessages([...messages, newMessage]);
  
    try {
      const response = await axios.post('http://localhost:3000/api/chat', {
        message: input,
        character: {
          name: character.name,
          personality: character.personality || "",
          scenario: character.scenario || "",
          first_mes: character.first_mes || "",
          mes_example: character.mes_example || "",
          creator_comment: character.creatorcomment || "",
          talkativeness: character.talkativeness || 0.5,
        },
      });
  
      console.log("AI Response:", response.data); // Debugging log
  
      // Ensure only the AI text response is added to the chat
      const aiMessage: ChatMessage = {
        id: Date.now() + 1,
        text: response.data.text || "No response",
        isAI: true,
      };
  
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error fetching AI response:', error);
    }
  
    setInput('');
  };
  
  

  const handleDelete = (id: number) => {
    setMessages(messages.filter((msg) => msg.id !== id));
  };

  // Handle deleting a character from IndexedDB and local state
  const handleDeleteCharacter = async (id: string) => { // Change parameter type to `string`
    try {
      await deleteCharacter(id); // Delete from IndexedDB
      setCharactersState((prev) => prev.filter((char) => char.id !== id)); // Update local state
      setCharacters((prev) => prev.filter((char) => char.id !== id)); // Sync with parent state
    } catch (error) {
      console.error('Error deleting character:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <h3 className="text-2xl font-semibold mb-2">Select a Character</h3>
        <select
          onChange={(e) => setSelectedCharacter(e.target.value)} // Use `e.target.value` directly (it's a string)
          value={selectedCharacter || ''}
          className="w-full p-2 border rounded-md"
        >
          <option value="">Select Character</option>
          {characters.map((character) => (
            <option key={character.id} value={character.id}>
              {character.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Chat</h2>
        <div className="space-y-4 max-h-80 overflow-y-auto p-4 bg-gray-50 rounded-lg">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-4 rounded-lg ${msg.isAI ? 'bg-blue-100' : 'bg-gray-200'}`}
            >
              <p className="text-lg">{msg.text}</p>
              {!msg.isAI && (
                <button
                  onClick={() => handleDelete(msg.id)}
                  className="mt-2 text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex mt-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="w-full p-3 border rounded-l-md"
          />
          <button
            onClick={handleSendMessage}
            className="p-3 bg-blue-500 text-white rounded-r-md hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-4">Saved Characters</h3>
        <ul className="space-y-3">
          {characters.map((character) => (
            <li key={character.id} className="flex justify-between items-center">
              <span className="text-lg">{character.name}</span>
              <button
                onClick={() => handleDeleteCharacter(character.id)} // Pass `character.id` (string)
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ChatUI;