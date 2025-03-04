import React, { useState } from 'react';

const Adventure = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<string | null>(null);
  const [additionalInput, setAdditionalInput] = useState('');

  const handleGenerate = () => {
    // Simulate AI Response
    setOutput('Generated response...');
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Adventure</h2>
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
          <div className="p-4 border border-gray-300 rounded">{output}</div>
          <textarea
            className="w-full p-2 border border-gray-300 rounded"
            rows={2}
            value={additionalInput}
            onChange={(e) => setAdditionalInput(e.target.value)}
            placeholder="Additional input..."
          ></textarea>
        </div>
      )}
    </div>
  );
};

export default Adventure;
