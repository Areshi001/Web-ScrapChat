"use client"

import Header from '@/components/Header';
import InputBar from '@/components/InputBar';
import MessageArea from '@/components/MessageArea';
import React, { useState, useEffect } from 'react';

interface SearchInfo {
  stages: string[];
  query: string;
  urls: string[];
  images?: string[];
}

interface Message {
  id: number;
  content: string;
  isUser: boolean;
  type: string;
  isLoading?: boolean;
  searchInfo?: SearchInfo;
}

const Home = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: 'Hi there, how can I help you?',
      isUser: false,
      type: 'message'
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [checkpointId, setCheckpointId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Modal Visibility States
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Active Key States
  const [orKey, setOrKey] = useState("");
  const [tavKey, setTavKey] = useState("");
  const [modelName, setModelName] = useState("deepseek/deepseek-v4-flash");

  // Input bindings for modals
  const [modalOrKey, setModalOrKey] = useState("");
  const [modalTavKey, setModalTavKey] = useState("");
  const [modalModelName, setModalModelName] = useState("deepseek/deepseek-v4-flash");

  useEffect(() => {
    // Theme setup
    const savedTheme = localStorage.getItem("scrapchat_theme");
    if (savedTheme === "light") {
      setIsDarkMode(false);
    }

    // Credentials setup
    const storedOrKey = localStorage.getItem("scrapchat_openrouter_key");
    const storedTavKey = localStorage.getItem("scrapchat_tavily_key");
    const storedModel = localStorage.getItem("scrapchat_model_name") || "deepseek/deepseek-v4-flash";

    if (storedOrKey) setOrKey(storedOrKey);
    if (storedTavKey) setTavKey(storedTavKey);
    if (storedModel) setModelName(storedModel);

    // Prompt for onboarding if credentials are not configured yet
    if (!storedOrKey || !storedTavKey) {
      setModalOrKey(storedOrKey || "");
      setModalTavKey(storedTavKey || "");
      setModalModelName(storedModel);
      setShowOnboarding(true);
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newVal = !prev;
      localStorage.setItem("scrapchat_theme", newVal ? "dark" : "light");
      return newVal;
    });
  };

  const openSettings = () => {
    setModalOrKey(localStorage.getItem("scrapchat_openrouter_key") || "");
    setModalTavKey(localStorage.getItem("scrapchat_tavily_key") || "");
    setModalModelName(localStorage.getItem("scrapchat_model_name") || "deepseek/deepseek-v4-flash");
    setShowSettings(true);
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("scrapchat_openrouter_key", modalOrKey);
    localStorage.setItem("scrapchat_tavily_key", modalTavKey);
    localStorage.setItem("scrapchat_model_name", modalModelName);

    setOrKey(modalOrKey);
    setTavKey(modalTavKey);
    setModelName(modalModelName);

    setShowOnboarding(false);
    setShowSettings(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentMessage.trim()) {
      // First add the user message to the chat
      const newMessageId = messages.length > 0 ? Math.max(...messages.map(msg => msg.id)) + 1 : 1;

      setMessages(prev => [
        ...prev,
        {
          id: newMessageId,
          content: currentMessage,
          isUser: true,
          type: 'message'
        }
      ]);

      const userInput = currentMessage;
      setCurrentMessage(""); // Clear input field immediately

      try {
        // Create AI response placeholder
        const aiResponseId = newMessageId + 1;
        setMessages(prev => [
          ...prev,
          {
            id: aiResponseId,
            content: "",
            isUser: false,
            type: 'message',
            isLoading: true,
            searchInfo: {
              stages: [],
              query: "",
              urls: [],
              images: []
            }
          }
        ]);

        const apiBase = '/api';
        const params = new URLSearchParams();
        if (checkpointId) params.append("checkpoint_id", checkpointId);
        
        // Retrieve credentials and append them to requests
        const localOrKey = typeof window !== 'undefined' ? localStorage.getItem("scrapchat_openrouter_key") : orKey;
        const localModel = typeof window !== 'undefined' ? localStorage.getItem("scrapchat_model_name") : modelName;
        const localTavKey = typeof window !== 'undefined' ? localStorage.getItem("scrapchat_tavily_key") : tavKey;
        
        if (localOrKey) params.append("openrouter_key", localOrKey);
        if (localModel) params.append("model_name", localModel);
        if (localTavKey) params.append("tavily_key", localTavKey);
        
        const queryString = params.toString();
        const url = `${apiBase}/chat_stream/${encodeURIComponent(userInput)}${queryString ? `?${queryString}` : ""}`;

        // Connect to SSE endpoint using EventSource
        const eventSource = new EventSource(url);
        let streamedContent = "";
        let searchData: SearchInfo | null = null;
        let hasReceivedContent = false;

        // Process incoming messages
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === 'checkpoint') {
              // Store the checkpoint ID for future requests
              setCheckpointId(data.checkpoint_id);
            }
            else if (data.type === 'content') {
              streamedContent += data.content;
              hasReceivedContent = true;

              // Update message with accumulated content
              setMessages(prev =>
                prev.map(msg =>
                  msg.id === aiResponseId
                    ? { ...msg, content: streamedContent, isLoading: false }
                    : msg
                )
              );
            }
            else if (data.type === 'search_start') {
              // Create search info with 'searching' stage
              const newSearchInfo: SearchInfo = {
                stages: ['searching'],
                query: data.query,
                urls: [],
                images: []
              };
              searchData = newSearchInfo;

              // Update the AI message with search info
              setMessages(prev =>
                prev.map(msg =>
                  msg.id === aiResponseId
                    ? { ...msg, content: streamedContent, searchInfo: newSearchInfo, isLoading: false }
                    : msg
                )
              );
            }
            else if (data.type === 'search_results') {
              try {
                // Parse URLs from search results
                const urls = typeof data.urls === 'string' ? JSON.parse(data.urls) : data.urls;

                // Update search info to add 'reading' stage (don't replace 'searching')
                const newSearchInfo: SearchInfo = {
                  stages: searchData ? [...searchData.stages, 'reading'] : ['reading'],
                  query: searchData?.query || "",
                  urls: urls,
                  images: searchData?.images || []
                };
                searchData = newSearchInfo;

                // Update the AI message with search info
                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === aiResponseId
                      ? { ...msg, content: streamedContent, searchInfo: newSearchInfo, isLoading: false }
                      : msg
                  )
                );
              } catch (err) {
                console.error("Error parsing search results:", err);
              }
            }
            else if (data.type === 'search_images') {
              try {
                const images = typeof data.images === 'string' ? JSON.parse(data.images) : data.images;
                const newSearchInfo: SearchInfo = {
                  stages: searchData ? searchData.stages : [],
                  query: searchData?.query || "",
                  urls: searchData?.urls || [],
                  images: images
                };
                searchData = newSearchInfo;

                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === aiResponseId
                      ? { ...msg, searchInfo: newSearchInfo, isLoading: false }
                      : msg
                  )
                );
              } catch (err) {
                console.error("Error parsing search images:", err);
              }
            }
            else if (data.type === 'search_error') {
              // Handle search error
              const newSearchInfo: SearchInfo = {
                stages: searchData ? [...searchData.stages, 'error'] : ['error'],
                query: searchData?.query || "",
                error: data.error,
                urls: [],
                images: searchData?.images || []
              } as any;
              searchData = newSearchInfo;

              setMessages(prev =>
                prev.map(msg =>
                  msg.id === aiResponseId
                    ? { ...msg, content: streamedContent, searchInfo: newSearchInfo, isLoading: false }
                    : msg
                )
              );
            }
            else if (data.type === 'end') {
              // When stream ends, add 'writing' stage if we had search info
              if (searchData) {
                const finalSearchInfo = {
                  ...searchData,
                  stages: [...searchData.stages, 'writing']
                };

                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === aiResponseId
                      ? { ...msg, searchInfo: finalSearchInfo, isLoading: false }
                      : msg
                  )
                );
              }

              eventSource.close();
            }
          } catch (error) {
            console.error("Error parsing event data:", error, event.data);
          }
        };

        // Handle errors
        eventSource.onerror = (error) => {
          console.error("EventSource error:", error);
          eventSource.close();

          // Only update with error if we don't have content yet
          if (!streamedContent) {
            setMessages(prev =>
              prev.map(msg =>
                msg.id === aiResponseId
                  ? { ...msg, content: "Sorry, there was an error processing your request.", isLoading: false }
                  : msg
              )
            );
          }
        };

        // Listen for end event
        eventSource.addEventListener('end', () => {
          eventSource.close();
        });
      } catch (error) {
        console.error("Error setting up EventSource:", error);
        setMessages(prev => [
          ...prev,
          {
            id: newMessageId + 1,
            content: "Sorry, there was an error connecting to the server.",
            isUser: false,
            type: 'message',
            isLoading: false
          }
        ]);
      }
    }
  };

  return (
    <div className={`relative flex items-center justify-center min-h-screen py-8 px-6 transition-colors duration-300 ${isDarkMode ? 'bg-gradient-to-tr from-[#08070e] via-[#0b0a14] to-[#141226]' : 'bg-gradient-to-tr from-[#f3f4f6] via-[#f9fafb] to-[#e5e7eb]'}`}>
      {/* Ambient glow backgrounds */}
      {isDarkMode ? (
        <>
          <div className="absolute top-[15%] left-[25%] w-[250px] h-[250px] bg-purple-600/15 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-[15%] right-[25%] w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[110px] pointer-events-none"></div>
        </>
      ) : (
        <>
          <div className="absolute top-[15%] left-[25%] w-[250px] h-[250px] bg-purple-200/40 rounded-full blur-[80px] pointer-events-none"></div>
          <div className="absolute bottom-[15%] right-[25%] w-[300px] h-[300px] bg-blue-200/30 rounded-full blur-[90px] pointer-events-none"></div>
        </>
      )}

      {/* Main container */}
      <div className={`w-full max-w-5xl backdrop-blur-xl flex flex-col rounded-2xl shadow-2xl border transition-all duration-300 h-[92vh] ${isDarkMode ? 'bg-[#121124]/40 border-white/[0.07]' : 'bg-white/80 border-black/[0.06] shadow-xl'}`}>
        <Header isDarkMode={isDarkMode} onToggleTheme={toggleTheme} onOpenSettings={openSettings} />
        <MessageArea messages={messages} isDarkMode={isDarkMode} />
        <InputBar currentMessage={currentMessage} setCurrentMessage={setCurrentMessage} onSubmit={handleSubmit} isDarkMode={isDarkMode} />
      </div>

      {/* Onboarding & Settings Modals */}
      {(showOnboarding || showSettings) && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
          <div className={`w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden transition-all duration-300 ${
            isDarkMode ? "bg-[#121124] border-white/10 text-white" : "bg-white border-black/10 text-gray-800"
          }`}>
            <div className="flex flex-col md:flex-row min-h-[400px]">
              {/* Left Column: Form */}
              <div className="flex-1 p-8 border-b md:border-b-0 md:border-r border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold">API Configurations</h3>
                  {showSettings && (
                    <button 
                      onClick={() => setShowSettings(false)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isDarkMode ? "hover:bg-white/5 text-gray-400 hover:text-white" : "hover:bg-black/5 text-gray-600 hover:text-black"
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                
                <form onSubmit={handleSaveCredentials} className="space-y-4 text-sm">
                  <div>
                    <label className="block font-semibold mb-1 text-xs">OpenRouter API Key</label>
                    <input 
                      type="password" 
                      required
                      value={modalOrKey}
                      onChange={(e) => setModalOrKey(e.target.value)}
                      placeholder="sk-or-v1-..."
                      className={`w-full border rounded-xl p-3 text-sm focus:outline-none focus:border-purple-500 transition-colors ${
                        isDarkMode ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-black/10 text-gray-900"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-xs">OpenRouter Model Name</label>
                    <input 
                      type="text" 
                      required
                      value={modalModelName}
                      onChange={(e) => setModalModelName(e.target.value)}
                      placeholder="deepseek/deepseek-v4-flash"
                      className={`w-full border rounded-xl p-3 text-sm focus:outline-none focus:border-purple-500 transition-colors ${
                        isDarkMode ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-black/10 text-gray-900"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-xs">Tavily Search API Key</label>
                    <input 
                      type="password" 
                      required
                      value={modalTavKey}
                      onChange={(e) => setModalTavKey(e.target.value)}
                      placeholder="tvly-..."
                      className={`w-full border rounded-xl p-3 text-sm focus:outline-none focus:border-purple-500 transition-colors ${
                        isDarkMode ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-black/10 text-gray-900"
                      }`}
                    />
                  </div>

                  <div className="pt-4 flex justify-end gap-3">
                    {showSettings && (
                      <button 
                        type="button"
                        onClick={() => setShowSettings(false)}
                        className={`px-5 py-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                          isDarkMode ? "bg-white/5 hover:bg-white/10 border-white/10" : "bg-gray-100 hover:bg-gray-200 border-black/10"
                        }`}
                      >
                        Cancel
                      </button>
                    )}
                    <button 
                      type="submit"
                      className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition-colors cursor-pointer"
                    >
                      Connect & Launch
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Column: Key Links and Info */}
              <div className={`w-full md:w-[240px] p-8 flex flex-col justify-between text-xs ${
                isDarkMode ? "bg-white/5" : "bg-gray-50"
              }`}>
                <div>
                  <h4 className="font-bold text-sm mb-3">Obtain API Keys</h4>
                  <p className={`mb-5 leading-relaxed ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                    To interact with the chat assistant and trigger live web scraping, you must supply your own service keys:
                  </p>
                  
                  <div className="space-y-4">
                    <a 
                      href="https://openrouter.ai/keys" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center justify-between p-3 rounded-xl border hover:border-purple-500/50 bg-purple-500/5 text-purple-500 hover:bg-purple-500/10 transition-all font-semibold"
                    >
                      <span>OpenRouter Keys</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                    
                    <a 
                      href="https://tavily.com" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center justify-between p-3 rounded-xl border hover:border-blue-500/50 bg-blue-500/5 text-blue-500 hover:bg-blue-500/10 transition-all font-semibold"
                    >
                      <span>Tavily Search API</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>

                <div className={`mt-6 leading-relaxed border-t pt-4 ${
                  isDarkMode ? "border-white/10 text-gray-500" : "border-black/10 text-gray-500"
                }`}>
                  Keys are stored exclusively in your local web browser (`localStorage`) and never uploaded to any remote storage.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;