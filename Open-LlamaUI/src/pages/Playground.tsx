import React, { useState } from 'react';

const Playground = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<string | null>(null);

  const handleSend = () => {
    // Simulate AI Response
    setResponse(`Response to: ${prompt}`);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Playground</h2>
      <textarea
        className="w-full p-2 border border-gray-300 rounded"
        rows={4}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt..."
      ></textarea>
      <button className="bg-blue-500 text-white px-4 py-2" onClick={handleSend}>
        Send
      </button>
      {response && <div className="mt-4 p-4 border border-gray-300 rounded">{response}</div>}
    </div>
  );
};

export default Playground;
