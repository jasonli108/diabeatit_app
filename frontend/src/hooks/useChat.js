/**
 * useChat Hook
 * Custom hook for managing chat state and interactions
 */

import { useState, useCallback } from 'react';
import { chatApi } from '../services/api';

/**
 * Chat message type
 * @typedef {Object} ChatMessage
 * @property {'user' | 'assistant'} role - Message sender
 * @property {string} content - Message content
 * @property {Array} [recipes] - Recipe results if any
 * @property {string} [type] - Response type
 * @property {boolean} [isError] - Whether this is an error message
 */

/**
 * useChat hook for managing chat functionality
 * @param {string} userId - User ID for API calls
 * @returns {Object} Chat state and methods
 */
function useChat(userId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Send a message to the AI
   * @param {string} messageText - Message to send
   * @returns {Promise<Object>} AI response
   */
  const sendMessage = useCallback(async (messageText) => {
    if (!messageText.trim() || !userId) return null;

    const userMessage = messageText.trim();
    setError(null);

    // Add user message to chat
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: userMessage },
    ]);

    setLoading(true);

    try {
      const response = await chatApi.sendMessage(userId, userMessage);

      // Add AI response to chat
      const aiMessage = {
        role: 'assistant',
        content: response.message,
        recipes: response.recipes || null,
        type: response.type,
      };

      setMessages((prev) => [...prev, aiMessage]);

      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'An error occurred, please try again later';
      setError(errorMessage);

      // Add error message to chat
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: errorMessage,
          isError: true,
        },
      ]);

      return null;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /**
   * Reset the conversation
   */
  const resetChat = useCallback(async () => {
    if (!userId) return;

    try {
      await chatApi.resetChat(userId);
      setMessages([]);
      setError(null);
    } catch (err) {
      console.error('Reset chat error:', err);
    }
  }, [userId]);

  /**
   * Add a message manually (for system messages)
   * @param {ChatMessage} message - Message to add
   */
  const addMessage = useCallback((message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    messages,
    loading,
    error,
    sendMessage,
    resetChat,
    addMessage,
    clearError,
  };
}

export default useChat;