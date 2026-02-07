/**
 * Chat Box Component
 * AI-powered conversation interface using Gemini
 */

import { useState, useRef, useEffect } from 'react';
import { Send, RotateCcw, Sparkles } from 'lucide-react';
import { chatApi } from '../services/api';
import { SUGGESTED_MESSAGES } from '../utils/constants';

function ChatBox({ userId, onMealPlanUpdate, onSetupClick }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle missing userId (Guest mode)
  if (!userId) {
    return (
      <div className="card h-full flex flex-col justify-center items-center text-center p-6">
        <Sparkles className="w-12 h-12 text-gray-300 mb-4" />
        <h3 className="text-gray-600 font-semibold mb-2">Assistant Unavailable</h3>
        <p className="text-gray-500 text-sm mb-6">
          Please complete your profile setup to start chatting with your personal AI diet assistant.
        </p>
        <button 
          onClick={onSetupClick}
          className="bg-green-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-green-700 transition-colors shadow-sm"
        >
          Get Started
        </button>
      </div>
    );
  }

  /**
   * Send message to AI
   */
  const sendMessage = async (messageText = input) => {
    if (!messageText.trim() || loading) return;

    const userMessage = messageText.trim();
    setInput('');
    setShowSuggestions(false);

    // Add user message to chat
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: userMessage },
    ]);

    setLoading(true);

    try {
      const response = await chatApi.sendMessage(userId, userMessage);

      // Add AI response to chat
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.message,
          recipes: response.recipes || null,
          type: response.type,
        },
      ]);

      // If meal plan was updated, notify parent
      if (response.type === 'meal_plan' && response.meal_plan) {
        onMealPlanUpdate?.(response.meal_plan);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || 'Sorry, something went wrong. Please try again later.';
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: errorMessage,
          isError: true,
        },
      ]);
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  /**
   * Handle suggested message click
   */
  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  /**
   * Reset conversation
   */
  const handleReset = async () => {
    try {
      await chatApi.resetChat(userId);
      setMessages([]);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Reset error:', error);
    }
  };

  /**
   * Handle key press
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="card animate-slide-up">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          AI Assistant Chat
        </h2>
        {messages.length > 0 && (
          <button
            onClick={handleReset}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            title="Reset conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages Container */}
      <div className="h-64 overflow-y-auto mb-4 space-y-3 pr-2">
        {/* Welcome message */}
        {messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm mb-4">
              👋 Hi! I am your AI diet assistant.
              <br />
              Ask me anything about your diet!
            </p>
          </div>
        )}

        {/* Message list */}
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="chat-bubble-assistant">
            <div className="flex items-center gap-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm text-gray-500">Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Messages */}
      {showSuggestions && messages.length === 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-2">Try these questions:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_MESSAGES.slice(0, 3).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-full hover:bg-green-100 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          disabled={loading}
          className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none disabled:bg-gray-100"
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          className="bg-green-600 text-white px-4 rounded-xl hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/**
 * Single Chat Message
 */
function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`animate-fade-in ${isUser ? 'chat-bubble-user' : 'chat-bubble-assistant'}`}>
      {/* Message content */}
      <div className={`text-sm whitespace-pre-wrap ${message.isError ? 'text-red-600' : ''}`}>
        {message.content}
      </div>

      {/* Recipe results if any */}
      {message.recipes && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-1">Recommended recipes:</p>
          <div className="flex flex-wrap gap-1">
            {(Array.isArray(message.recipes) ? message.recipes : []).slice(0, 5).map((recipe, i) => (
              <span
                key={i}
                className="text-xs bg-white px-2 py-1 rounded-full border"
              >
                {recipe.name || recipe}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatBox;