import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { saveStory, getStory } from '../utils/db'; // Import IndexDB functions

const Adventure = () => {
  const [sessionId] = useState(uuidv4()); // Unique ID for each story
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<string | null>(null);
  const [additionalInput, setAdditionalInput] = useState('');
  const [responseLength, setResponseLength] = useState<'short' | 'long' | 'none'>('short');

  // Load saved story and state data from IndexedDB when component mounts
  useEffect(() => {
    const loadStory = async () => {
      const savedStory = await getStory(sessionId);
      if (savedStory) {
        setOutput(savedStory.content);
        setInput(savedStory.input || '');
        setAdditionalInput(savedStory.additionalInput || '');
        setResponseLength(savedStory.responseLength || 'short');
      }
    };
    loadStory();
  }, [sessionId]);

  const handleGenerate = async () => {
    if (!input.trim()) return;

    try {
      const response = await fetch('http://localhost:3000/api/adventure/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, prompt: input, length: responseLength }),
      });

      const data = await response.json();
      if (response.ok) {
        setOutput(data.response);
        setInput('');
        await saveStory(sessionId, { // Save the full state to IndexedDB
          content: data.response,
          input: '',
          additionalInput,
          responseLength,
        });
      } else {
        setOutput('Error: ' + data.error);
      }
    } catch (error) {
      setOutput('Error generating response.');
    }
  };

  const handleContinueStory = async () => {
    if (!additionalInput.trim()) return;

    try {
      const response = await fetch('http://localhost:3000/api/adventure/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, prompt: additionalInput, length: responseLength }),
      });

      const data = await response.json();
      if (response.ok) {
        setOutput((prev) => (prev ? prev + '\n\n' + data.response : data.response));
        setAdditionalInput('');
        await saveStory(sessionId, { // Save the full state to IndexedDB
          content: data.response,
          input,
          additionalInput: '',
          responseLength,
        });
      } else {
        setOutput('Error: ' + data.error);
      }
    } catch (error) {
      setOutput('Error generating response.');
    }
  };

  return (
    <div className="space-y-4 p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold">Adventure</h2>

      <label className="block text-gray-700">Response Length:</label>
      <select
        className="p-2 border border-gray-300 rounded"
        value={responseLength}
        onChange={(e) => setResponseLength(e.target.value as 'short' | 'long' | 'none')}
      >
        <option value="short">Short (1 Paragraph)</option>
        <option value="long">Long (2+ Paragraphs)</option>
        <option value="none">None (Acknowledge Only)</option>
      </select>

      <textarea
        className="w-full p-2 border border-gray-300 rounded"
        rows={4}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Write a paragraph..."
      ></textarea>
      <button className="bg-blue-500 text-white px-4 py-2" onClick={handleGenerate}>
        Generate
      </button>

      {output && (
        <div className="mt-4 space-y-2">
          <div
            className="p-4 border border-gray-300 rounded whitespace-pre-line overflow-auto"
            style={{ maxHeight: '200px', wordWrap: 'break-word' }}
          >
            {output}
          </div>

          <textarea
            className="w-full p-2 border border-gray-300 rounded"
            rows={2}
            value={additionalInput}
            onChange={(e) => setAdditionalInput(e.target.value)}
            placeholder="Additional input..."
          ></textarea>
          <button className="bg-green-500 text-white px-4 py-2" onClick={handleContinueStory}>
            Submit
          </button>
        </div>
      )}
    </div>
  );
};

export default Adventure;
