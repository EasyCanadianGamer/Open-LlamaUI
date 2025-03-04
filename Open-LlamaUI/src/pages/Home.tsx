import React from 'react';
import ChatUI from '../components/Chat';

const Home = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Home</h2>
      <div>
        <button className="bg-blue-500 text-white px-4 py-2 mr-2">Import</button>
        <button className="bg-green-500 text-white px-4 py-2">Export</button>
      </div>
      <ChatUI />
    </div>
  );
};

export default Home;
