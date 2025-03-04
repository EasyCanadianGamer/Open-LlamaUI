import React, { useState, useEffect } from 'react';
import ChatUI from '../components/Chat';
import { getCharacters, exportCharactersToJSON, deleteCharacter } from '../utils/chatdb'; // Import the necessary functions

const Home = () => {
  const [characterData, setCharacterData] = useState<string>('');
  const [characters, setCharacters] = useState<any[]>([]);

  // Fetch characters from IndexedDB on component mount
  useEffect(() => {
    const fetchCharacters = async () => {
      const chars = await getCharacters();
      setCharacters(chars);
    };
    fetchCharacters();
  }, []);
  

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = () => {
        const fileContent = reader.result as string;
        setCharacterData(fileContent); // Store the content of the file
      };
      reader.readAsText(file);
    } else {
      alert('Please upload a valid JSON file');
    }
  };

  const handleExport = async () => {
    try {
      await exportCharactersToJSON(); // Export all characters to a JSON file
    } catch (error) {
      console.error('Error exporting characters:', error);
      alert('Failed to export characters. Please try again.');
    }
  };

  const deleteCharacter = (id: number) => {
    setCharacters((prev) => prev.filter((char) => char.id !== id));
  };


  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Home</h2>
      <div>
        <input
          type="file"
          accept=".json"
          className="hidden"
          id="import-file"
          onChange={handleImport}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 mr-2"
          onClick={() => document.getElementById('import-file')?.click()}
        >
          Import
        </button>
        <button
          className="bg-green-500 text-white px-4 py-2"
          onClick={handleExport}
        >
          Export
        </button>
      </div>
      
      {/* Character List */}
      <div className="mt-4">
        <h3 className="text-xl font-semibold">Character List</h3>
        <ul>
          {characters.map((char) => (
            <li key={char.id} className="flex items-center justify-between space-x-4">
              <span>{char.name}</span>
            </li>
          ))}
        </ul>
      </div>

      <ChatUI characterData={characterData} setCharacters={setCharacters} />
    </div>
  );
};

export default Home;