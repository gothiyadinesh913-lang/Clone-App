
import React, { useState, useRef, useEffect } from 'react';
import Header from '../components/Header';
import { Send, Bot } from 'lucide-react';
import { getHelpResponse } from '../services/geminiService';

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

const Help: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'bot', text: "Hello! I'm the support assistant for App Cloner. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const botResponse = await getHelpResponse(input);
      setMessages(prev => [...prev, { text: botResponse, sender: 'bot' }]);
    } catch (error) {
      console.error('Error fetching help response:', error);
      setMessages(prev => [...prev, { text: 'Sorry, I am having trouble connecting. Please try again later.', sender: 'bot' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-phone-bg-light dark:bg-phone-bg-dark">
      <Header title="Help & Support" subtitle="Ask our AI assistant" />
      <div className="flex-grow p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.sender === 'bot' && <div className="flex-shrink-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white"><Bot size={20} /></div>}
            <div className={`max-w-[75%] px-4 py-2 rounded-2xl ${msg.sender === 'user' ? 'bg-primary-500 text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none'}`}>
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-end gap-2 justify-start">
             <div className="flex-shrink-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white"><Bot size={20} /></div>
            <div className="max-w-[75%] px-4 py-2 rounded-2xl bg-gray-200 dark:bg-gray-700">
              <div className="flex items-center justify-center space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-2 border-t border-gray-200 dark:border-gray-700 bg-app-bg-light dark:bg-app-bg-dark">
        <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full p-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-grow bg-transparent px-3 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || input.trim() === ''}
            className="w-10 h-10 flex items-center justify-center bg-primary-500 text-white rounded-full transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Help;
