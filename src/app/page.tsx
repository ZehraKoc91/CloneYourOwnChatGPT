"use client";

import { useState } from 'react';

export default function Home() {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const askTheAI = async (userInput: string) => {
    if (userInput.trim()) {
      const userMessage = { sender: 'User', text: userInput };
      setMessages((prevMessages) => [...prevMessages, userMessage]);

      setIsLoading(true);
      try {
        const response = await fetch('/api/openai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ messages: [...messages, userMessage] })
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }

        const aiMessage = { sender: 'Assistant', text: data.response };
        setMessages((prevMessages) => [...prevMessages, aiMessage]);
      } catch (error) {
        console.error('Error fetching response from AI:', error);
        const errorMessage = { sender: 'Assistant', text: 'Error fetching response from AI.' };
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmit = () => {
    askTheAI(input);
    setInput('');
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6">
        <div className="mb-4 space-y-2">
          {messages.map((message, index) => (
            <div key={index} className={`p-2 rounded ${message.sender === 'User' ? 'bg-blue-100' : 'bg-green-100'}`}>
              <strong>{message.sender}:</strong> {message.text}
            </div>
          ))}
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full h-32 p-2 mb-4 border rounded resize-none"
          placeholder="Type your message..."
        ></textarea>
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full px-4 py-2 font-semibold text-white bg-blue-500 rounded hover:bg-blue-700 disabled:bg-blue-300"
        >
          {isLoading ? 'Loading...' : 'Ask the AI'}
        </button>
      </div>
    </div>
  );
}
