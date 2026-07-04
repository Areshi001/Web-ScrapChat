"use client"

import Header from '@/components/Header';
import InputBar from '@/components/InputBar';
import MessageArea from '@/components/MessageArea';
import React, { useState } from 'react';

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
  const [tokenUsage, setTokenUsage] = useState({ prompt: 0, completion: 0 });

  const TOKEN_LIMIT = 15000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentMessage.trim()) {
      const totalUsed = tokenUsage.prompt + tokenUsage.completion;
      if (totalUsed >= TOKEN_LIMIT) {
        setMessages(prev => [
          ...prev,
          {
            id: prev.length > 0 ? Math.max(...prev.map(msg => msg.id)) + 1 : 1,
            content: "⚠️ **Token usage limit reached (15,000 max).** Please host your own container or reset the session to continue.",
            isUser: false,
            type: 'message'
          }
        ]);
        return;
      }

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

        // Create URL with checkpoint ID and optional user credentials if they exist
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const params = new URLSearchParams();
        if (checkpointId) params.append("checkpoint_id", checkpointId);
        
        const localOrKey = typeof window !== 'undefined' ? localStorage.getItem("scrapchat_openrouter_key") : null;
        const localModel = typeof window !== 'undefined' ? localStorage.getItem("scrapchat_model_name") : null;
        const localTavKey = typeof window !== 'undefined' ? localStorage.getItem("scrapchat_tavily_key") : null;
        
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
            else if (data.type === 'usage') {
              setTokenUsage(prev => ({
                prompt: prev.prompt + (data.prompt_tokens || 0),
                completion: prev.completion + (data.completion_tokens || 0)
              }));
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
    <div className="relative flex items-center justify-center min-h-screen py-6 px-4 bg-gradient-to-tr from-[#08070e] via-[#0b0a14] to-[#141226]">
      {/* Ambient glow backgrounds */}
      <div className="absolute top-[15%] left-[25%] w-[250px] h-[250px] bg-purple-600/15 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[15%] right-[25%] w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[110px] pointer-events-none"></div>

      {/* Main container */}
      <div className="w-full max-w-5xl bg-[#121124]/40 backdrop-blur-xl flex flex-col rounded-2xl shadow-2xl border border-white/[0.07] overflow-hidden h-[92vh] transition-all duration-300">
        <Header tokenUsage={tokenUsage} tokenLimit={TOKEN_LIMIT} />
        <MessageArea messages={messages} />
        <InputBar currentMessage={currentMessage} setCurrentMessage={setCurrentMessage} onSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default Home;