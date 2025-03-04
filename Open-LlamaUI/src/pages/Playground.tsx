import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { savePlaygroundData, getPlaygroundData } from '../utils/pgdb'; // Import IndexedDB functions

const Playground = () => {
  const [prompt, setPrompt] = useState('');
  const [responses, setResponses] = useState<string[]>([]); // Store all responses in an array
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful assistant.');
  const [isLoading, setIsLoading] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Load saved data from IndexedDB when component mounts
  useEffect(() => {
    const loadData = async () => {
      const savedData = await getPlaygroundData();
      if (savedData.length > 0) {
        const latestData = savedData[savedData.length - 1]; // Get the most recent data
        setSystemPrompt(latestData.systemPrompt);
        setPrompt(latestData.userPrompt);
        setResponses(latestData.responses);
      }
    };
    loadData();
  }, []);

  const handleSend = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    try {
      const res = await axios.post(`${backendUrl}/api/playground`, {
        prompt,
        systemPrompt,
      }, {
        headers: { 'Content-Type': 'application/json' },
      });

      const newResponse = res.data.response;
      // Add the new response to the existing responses array
      const updatedResponses = [...responses, newResponse];
      setResponses(updatedResponses);

      // Save the data to IndexedDB
      await savePlaygroundData(systemPrompt, prompt, updatedResponses);
    } catch (error) {
      let errorMessage = 'An unknown error occurred';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.error || error.message || 'An error occurred';
      } else if (error instanceof Error) {
        errorMessage = error.message || 'An error occurred';
      }
      // Add the error message to the responses array
      const updatedResponses = [...responses, errorMessage];
      setResponses(updatedResponses);

      // Save the error data to IndexedDB
      await savePlaygroundData(systemPrompt, prompt, updatedResponses);
    } finally {
      setIsLoading(false);
      setPrompt(''); // Clear the input after sending
    }
  };

  return (
    <div className="space-y-4 p-4 max-w-200 mx-auto">
      <h2 className="text-2xl font-bold text-gray-800">AI Playground</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column - User Input */}
        <div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              System Prompt
            </label>
            <textarea
              className="w-full p-2 border rounded-lg h-24 focus:ring-2 focus:ring-blue-500"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Enter system instructions..."
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              User Prompt
            </label>
            <textarea
              className="w-full p-2 border rounded-lg h-32 focus:ring-2 focus:ring-blue-500"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your message..."
            />
          </div>

          <button
            onClick={handleSend}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
          >
            {isLoading ? 'Generating...' : 'Send'}
          </button>
        </div>

        {/* Right Column - AI Responses */}
        <div>
  <div className="p-8 bg-white rounded-lg drop-shadow-lg border border-gray-200 max-h-150 max-w-full overflow-y-auto">
    {responses.map((response, index) => (
      <div key={index} className="p-4 bg-gray-50 rounded-lg mt-4 whitespace-pre-wrap">
        <h3 className="font-medium text-gray-800 mb-2">Response {index + 1}:</h3>
        {response}
      </div>
    ))}
  </div>
</div>

      </div>
    </div>
  );
};

export default Playground;
