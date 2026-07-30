import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatModal from './ChatModal';

export default function ProductModal({ item, onClose }) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 30, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="bg-[#0a0a0a] border border-gray-800 max-w-2xl w-full p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-[#14F195] text-2xl">×</button>
        
        <span className="text-xs font-bold text-[#14F195] uppercase tracking-widest mb-2 block">SpecPedia Database</span>
        <h2 className="text-4xl font-extrabold uppercase tracking-tight mb-3">{item.name}</h2>
        <p className="text-gray-400 mb-8">{item.description}</p>
        
        <div className="text-3xl font-bold text-white font-mono mb-10 border-t border-b border-gray-800 py-4">
          ₹{item.price.toLocaleString('en-IN')}
        </div>

        <div className="grid grid-cols-2 gap-0 mb-8 border border-gray-800">
          {Object.entries(item.specs).map(([key, value]) => (
            <div key={key} className="p-4 border-r border-b border-gray-800">
              <div className="text-xs text-gray-500 font-mono mb-1 uppercase">{key}</div>
              <div className="text-white font-bold uppercase">{value}</div>
            </div>
          ))}
        </div>

        <button 
          onClick={() => setIsChatOpen(true)}
          className="w-full py-4 bg-[#14F195] text-black font-extrabold uppercase tracking-wider text-sm hover:bg-white transition-colors flex items-center justify-center gap-2"
        >
          <span>⚡</span> Ask AI About This Product
        </button>
      </motion.div>

      <AnimatePresence>
        {isChatOpen && <ChatModal item={item} onClose={() => setIsChatOpen(false)} />}
      </AnimatePresence>
    </motion.div>
  );
}