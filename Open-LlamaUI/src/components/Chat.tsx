import React, { useState } from 'react';

interface ChatMessage {
  id: number;
  text: string;
  isAI: boolean;
}

const ChatUI = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');

  const handleSendMessage = () => {
    if (input.trim() === '') return;

    // Add user message
    const newMessage: ChatMessage = { id: Date.now(), text: input, isAI: false };
    setMessages([...messages, newMessage]);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: Date.now() + 1,
        text: `AI response to: ${input}`,
        isAI: true,
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);

    setInput('');
  };

  const handleRegenerate = (id: number) => {
    const messageToRegenerate = messages.find((msg) => msg.id === id);
    if (messageToRegenerate) {
      const regeneratedMessage: ChatMessage = {
        id: Date.now(),
        text: `Regenerated response for: ${messageToRegenerate.text}`,
        isAI: true,
      };
      setMessages((prev) => [...prev, regeneratedMessage]);
    }
  };

  const handleDelete = (id: number) => {
    setMessages(messages.filter((msg) => msg.id !== id));
  };

  return (
    <div className="flex flex-col h-full border border-gray-300 rounded p-4">
      <div className="flex-grow overflow-y-auto space-y-4">
        {messages.map((msg) => (
        <div
        key={msg.id}
        className={`p-3 rounded ${
          msg.isAI ? 'bg-blue-100 text-gray-800' : 'bg-gray-100 text-gray-900'
        } relative group`}
      >
        <p>{msg.text}</p>
        {msg.isAI && (
          <div className="absolute top-1/2 -translate-y-1/2 right-0 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              className="bg-gray-200 p-2 rounded hover:bg-gray-300"
              onClick={() => handleRegenerate(msg.id)}
            >
              Regenerate
            </button>
            <button
              className="bg-red-200 p-2 rounded hover:bg-red-300"
              onClick={() => handleDelete(msg.id)}
            >
              Delete
            </button>
          </div>
        )}
      </div>
      
        ))}
      </div>
      <div className="mt-4 flex items-center space-x-2">
        <input
          type="text"
          className="flex-grow p-2 border border-gray-300 rounded"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={handleSendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatUI;
