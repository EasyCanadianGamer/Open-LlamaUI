import React from "react";
import { RxChatBubble } from "react-icons/rx";
import { LuSwords } from "react-icons/lu";
import { FaBookOpen } from "react-icons/fa";
import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="flex flex-col items-center w-32 h-screen py-8 overflow-y-auto bg-white border-r rtl:border-l rtl:border-r-0 shadow-lg">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-700">Open-LlamaUI!</h1>
      </header>

      <div className="flex flex-col gap-6 justify-center items-center">
        <Link to="/" className="flex justify-center items-center p-3 rounded-lg hover:bg-gray-100 transition-colors">
          <RxChatBubble size={40} className="text-gray-600" />
        </Link>
        <Link to="/adventure" className="flex justify-center items-center p-3 rounded-lg hover:bg-gray-100 transition-colors">
          <LuSwords size={40} className="text-gray-600" />
        </Link>
        <Link to="/playground" className="flex justify-center items-center p-3 rounded-lg hover:bg-gray-100 transition-colors">
          <FaBookOpen size={40} className="text-gray-600" />
        </Link>
      </div>
    </aside>
  );
}

export default Sidebar;
