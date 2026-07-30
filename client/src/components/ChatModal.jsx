import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

// A simple markdown formatter to render **bold** and bullet points
const formatAIResponse = (text) => {
  return text.split('\n').map((line, i) => {
    if (line.startsWith('### ')) {
      return <h4 key={i} className="text-[#14F195] font-bold mt-3 mb-1 text-sm uppercase">{line.replace('### ', '')}</h4>;
    }
    if (line.startsWith('- ') || line.startsWith('* ')) {
      return <li key={i} className="ml-4 list-disc text-gray-300">{formatBold(line.slice(2))}</li>;
    }
    if (line.match(/^\d+\.\s/)) {
      return <li key={i} className="ml-4 list-decimal text-gray-300">{formatBold(line.replace(/^\d+\.\s/, ''))}</li>;
    }
    return <p key={i} className="mb-2">{formatBold(line)}</p>;
  });
};

// Helper to format **text** into <strong>
const formatBold = (text) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

export default function ChatModal({ item, initialPrompt, onClose }) {
  const [messages, setMessages] = useState([]);
  // If initialPrompt exists, put it in the input box so the user can finish typing
  const [input, setInput] = useState(initialPrompt || '');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
const res = await axios.post('https://specpedia-api.onrender.com/api/ai/chat', {        message: currentInput,
        context: item || null
      });
      setMessages(prev => [...prev, { role: 'ai', content: res.data.reply }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, the AI service is currently offline." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="bg-[#0a0a0a] border border-gray-800 w-full max-w-md h-[600px] flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-900 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#14F195] rounded-full animate-pulse"></div>
            <h3 className="font-mono-tech text-sm font-bold uppercase tracking-widest text-white">
              {item ? `AI: ${item.name}` : 'SpecPedia AI Search'}
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-[#14F195] text-2xl leading-none">×</button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.length === 0 && (
            <div className="text-center mt-20">
              <p className="text-gray-600 text-sm font-mono-tech uppercase tracking-widest mb-2">// Initialize AI</p>
              <p className="text-gray-500 text-sm">
                {item ? `Ask me anything about the ${item.name}.` : 'Ask me to find products, compare specs, or explain features.'}
              </p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] p-3 text-sm ${msg.role === 'user' ? 'bg-[#14F195] text-black font-medium' : 'bg-[#111111] border border-gray-800 text-gray-300'}`}>
                {msg.role === 'ai' ? formatAIResponse(msg.content) : msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#111111] border border-gray-800 p-4 rounded-sm flex gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#14F195] rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-[#14F195] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                <span className="w-1.5 h-1.5 bg-[#14F195] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Input */}
        <div className="p-5 border-t border-gray-900 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Type your question..."
            className="flex-1 bg-[#111111] border border-gray-800 px-4 py-3 text-sm outline-none focus:border-[#14F195] transition-colors text-white font-mono-tech"
          />
          <button 
            onClick={sendMessage} 
            className="bg-[#14F195] text-black px-6 py-3 font-bold text-xs uppercase tracking-wider hover:bg-white transition-colors"
          >
            Send
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}