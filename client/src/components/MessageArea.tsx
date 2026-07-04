import React from 'react';

// Custom Markdown Renderer for Premium Reply Style
const Markdown = ({ text, isDarkMode }: { text: string; isDarkMode: boolean }) => {
    if (!text) return null;
    
    const lines = text.split('\n');
    let inList = false;
    const listItems: string[] = [];
    const renderedElements: React.ReactNode[] = [];

    const parseInline = (lineText: string) => {
        const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`|\[.*?\]\(.*?\))/g;
        const parts = lineText.split(regex);
        
        return parts.map((part, idx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={idx} className={`font-bold tracking-wide transition-colors duration-300 ${isDarkMode ? "text-white" : "text-purple-950"}`}>{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('*') && part.endsWith('*')) {
                return <em key={idx} className={`italic transition-colors duration-300 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>{part.slice(1, -1)}</em>;
            }
            if (part.startsWith('`') && part.endsWith('`')) {
                return <code key={idx} className={`px-1.5 py-0.5 rounded font-mono text-xs border transition-colors duration-300 ${isDarkMode ? "bg-black/40 text-rose-400 border-white/5" : "bg-black/5 text-rose-600 border-black/5"}`}>{part.slice(1, -1)}</code>;
            }
            if (part.startsWith('[') && part.includes('](')) {
                const match = part.match(/\[(.*?)\]\((.*?)\)/);
                if (match) {
                    return (
                        <a key={idx} href={match[2]} target="_blank" rel="noopener noreferrer" className={`underline font-medium transition-colors ${isDarkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-800"}`}>
                            {match[1]}
                        </a>
                    );
                }
            }
            return part;
        });
    };

    const flushList = (keyPrefix: number) => {
        if (listItems.length > 0) {
            renderedElements.push(
                <ul key={`ul-${keyPrefix}`} className={`list-disc pl-5 mb-4 space-y-1.5 transition-colors duration-300 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                    {listItems.map((item, idx) => (
                        <li key={idx}>{parseInline(item)}</li>
                    ))}
                </ul>
            );
            listItems.length = 0;
            inList = false;
        }
    };

    lines.forEach((line, index) => {
        const trimmed = line.trim();
        
        if (trimmed.startsWith('# ')) {
            flushList(index);
            renderedElements.push(<h1 key={index} className={`text-xl font-extrabold mt-5 mb-2.5 pb-1 border-b transition-colors duration-300 ${isDarkMode ? "text-white border-white/10" : "text-purple-950 border-black/10"}`}>{parseInline(trimmed.substring(2))}</h1>);
        } else if (trimmed.startsWith('## ')) {
            flushList(index);
            renderedElements.push(<h2 key={index} className={`text-lg font-bold mt-5 mb-2.5 transition-colors duration-300 ${isDarkMode ? "text-white" : "text-purple-950"}`}>{parseInline(trimmed.substring(3))}</h2>);
        } else if (trimmed.startsWith('### ')) {
            flushList(index);
            renderedElements.push(<h3 key={index} className={`text-md font-semibold mt-4 mb-2 transition-colors duration-300 ${isDarkMode ? "text-gray-100" : "text-purple-900"}`}>{parseInline(trimmed.substring(4))}</h3>);
        } else if (trimmed.startsWith('#### ')) {
            flushList(index);
            renderedElements.push(<h4 key={index} className={`text-sm font-semibold mt-3 mb-2 transition-colors duration-300 ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>{parseInline(trimmed.substring(5))}</h4>);
        } else if (trimmed === '---' || trimmed === '***') {
            flushList(index);
            renderedElements.push(<hr key={index} className={`my-4 border-t transition-colors duration-300 ${isDarkMode ? "border-white/10" : "border-black/10"}`} />);
        } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            inList = true;
            listItems.push(trimmed.substring(2));
        } else if (trimmed === '') {
            flushList(index);
        } else {
            flushList(index);
            renderedElements.push(<p key={index} className={`mb-3.5 leading-relaxed text-base transition-colors duration-300 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{parseInline(line)}</p>);
        }
    });

    flushList(lines.length);
    return <div className="space-y-1">{renderedElements}</div>;
};

const PremiumTypingAnimation = () => {
    return (
        <div className="flex items-center py-2">
            <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}></div>
                <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}></div>
                <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}></div>
            </div>
        </div>
    );
};

const ImageGallery = ({ images, isDarkMode }: { images?: string[]; isDarkMode: boolean }) => {
    if (!images || images.length === 0) return null;
    return (
        <div className="mb-5 mt-3 ml-2 select-none">
            <div className={`text-[10px] font-semibold tracking-wider mb-2.5 flex items-center gap-1.5 uppercase transition-colors duration-300 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                <svg className="w-3.5 h-3.5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                RELEVANT IMAGES
            </div>
            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-purple-500/20 max-w-full">
                {images.map((src, index) => (
                    <a key={index} href={src} target="_blank" rel="noopener noreferrer" className={`flex-none relative w-32 h-24 border rounded-xl overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-[1.03] ${isDarkMode ? "bg-white/5 border-white/10 hover:border-purple-500/30" : "bg-black/5 border-black/10 hover:border-purple-500/40"}`}>
                        <img 
                            src={src} 
                            alt={`Scraped visual ${index + 1}`} 
                            className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity duration-300"
                            onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                            }}
                        />
                    </a>
                ))}
            </div>
        </div>
    );
};

const SearchStages = ({ searchInfo, isDarkMode }: { searchInfo: any; isDarkMode: boolean }) => {
    if (!searchInfo || !searchInfo.stages || searchInfo.stages.length === 0) return null;

    return (
        <div className={`mb-5 mt-3 relative pl-6 border-l-2 ml-2 transition-colors duration-300 ${isDarkMode ? "border-purple-500/30" : "border-purple-500/20"}`}>
            <div className="flex flex-col space-y-4 text-xs">
                {/* Searching Stage */}
                {searchInfo.stages.includes('searching') && (
                    <div className="relative">
                        <div className={`absolute -left-[31px] top-1 w-3 h-3 bg-purple-500 rounded-full border-2 shadow-[0_0_8px_rgba(168,85,247,0.5)] transition-colors duration-300 ${isDarkMode ? "border-[#0b0a14]" : "border-[#f9fafb]"}`}></div>
                        <div className="flex flex-col">
                            <span className={`font-semibold flex items-center gap-1.5 transition-colors duration-300 ${isDarkMode ? "text-gray-300" : "text-gray-800"}`}>
                                <svg className="w-3.5 h-3.5 text-purple-500 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Searching the Web
                            </span>
                            <div className="flex flex-wrap gap-2 mt-2">
                                <div className={`text-[11px] px-3 py-1 rounded-lg border inline-flex items-center transition-colors duration-300 ${
                                    isDarkMode 
                                        ? "bg-white/5 text-purple-300 border-purple-500/20" 
                                        : "bg-purple-50 text-purple-700 border-purple-200"
                                }`}>
                                    <svg className="w-3.5 h-3.5 mr-1 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                    </svg>
                                    {searchInfo.query}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reading Stage */}
                {searchInfo.stages.includes('reading') && (
                    <div className="relative">
                        <div className={`absolute -left-[31px] top-1 w-3 h-3 bg-blue-500 rounded-full border-2 shadow-[0_0_8px_rgba(59,130,246,0.5)] transition-colors duration-300 ${isDarkMode ? "border-[#0b0a14]" : "border-[#f9fafb]"}`}></div>
                        <div className="flex flex-col">
                            <span className={`font-semibold flex items-center gap-1.5 transition-colors duration-300 ${isDarkMode ? "text-gray-300" : "text-gray-800"}`}>
                                <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                                </svg>
                                Analyzing Resources
                            </span>
                            {searchInfo.urls && searchInfo.urls.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {Array.isArray(searchInfo.urls) ? (
                                        searchInfo.urls.map((url, index) => {
                                            const hostname = typeof url === 'string' ? new URL(url).hostname.replace('www.', '') : 'source';
                                            return (
                                                <a key={index} href={url} target="_blank" rel="noopener noreferrer" className={`text-[10px] px-2.5 py-1 rounded border max-w-[170px] truncate transition-all duration-200 ${
                                                    isDarkMode 
                                                        ? "bg-white/5 text-blue-300 border-blue-500/20 hover:bg-white/10 hover:text-blue-200" 
                                                        : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800"
                                                }`}>
                                                    🔗 {hostname}
                                                </a>
                                            )
                                        })
                                    ) : (
                                        <div className={`text-[10px] px-2.5 py-1 rounded border max-w-[170px] truncate transition-colors duration-300 ${
                                            isDarkMode 
                                                ? "bg-white/5 text-blue-300 border-blue-500/20" 
                                                : "bg-blue-50 text-blue-700 border-blue-200"
                                        }`}>
                                            🔗 {typeof searchInfo.urls === 'string' ? searchInfo.urls.substring(0, 30) : 'source'}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Writing Stage */}
                {searchInfo.stages.includes('writing') && (
                    <div className="relative">
                        <div className={`absolute -left-[31px] top-1 w-3 h-3 bg-emerald-500 rounded-full border-2 shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-colors duration-300 ${isDarkMode ? "border-[#0b0a14]" : "border-[#f9fafb]"}`}></div>
                        <span className={`font-semibold flex items-center gap-1.5 transition-colors duration-300 ${isDarkMode ? "text-gray-300" : "text-gray-800"}`}>
                            <svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                            </svg>
                            Synthesizing Answer
                        </span>
                    </div>
                )}

                {/* Error Message */}
                {searchInfo.stages.includes('error') && (
                    <div className="relative">
                        <div className={`absolute -left-[31px] top-1 w-3 h-3 bg-rose-500 rounded-full border-2 shadow-[0_0_8px_rgba(244,63,94,0.5)] transition-colors duration-300 ${isDarkMode ? "border-[#0b0a14]" : "border-[#f9fafb]"}`}></div>
                        <span className="font-semibold text-rose-500">Search Error</span>
                        <div className="text-[11px] text-rose-600/90 mt-1.5 pl-1">
                            {searchInfo.error || "An error occurred during search."}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const MessageArea = ({ messages, isDarkMode }: { messages: any[]; isDarkMode: boolean }) => {
    return (
        <div className={`flex-grow overflow-y-auto border-b transition-colors duration-300`} style={{ minHeight: 0, backgroundColor: isDarkMode ? "#0b0a14" : "#f9fafb", borderColor: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
            <div className="max-w-4xl mx-auto px-8 py-10 space-y-8">
                {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} w-full`}>
                        <div className="flex flex-col max-w-[85%] sm:max-w-[78%] space-y-1.5">
                            {/* Search Status Display - Above response */}
                            {!message.isUser && message.searchInfo && (
                                <>
                                    <SearchStages searchInfo={message.searchInfo} isDarkMode={isDarkMode} />
                                    <ImageGallery images={message.searchInfo.images} isDarkMode={isDarkMode} />
                                </>
                            )}

                            {/* Message Content Bubble */}
                            <div
                                className={`rounded-2xl py-4.5 px-6.5 shadow-lg border transition-all duration-300 ${
                                    message.isUser
                                        ? 'bg-gradient-to-br from-purple-600 to-indigo-700 text-white border-purple-500/20 rounded-tr-none'
                                        : isDarkMode 
                                            ? 'bg-[#121124] text-gray-100 border-white/5 rounded-tl-none'
                                            : 'bg-white text-gray-800 border-black/[0.08] rounded-tl-none shadow-sm'
                                    }`}
                            >
                                {message.isLoading ? (
                                    <PremiumTypingAnimation />
                                ) : message.isUser ? (
                                    <span className="text-base leading-relaxed break-words">{message.content}</span>
                                ) : (
                                    message.content ? (
                                        <Markdown text={message.content} isDarkMode={isDarkMode} />
                                    ) : (
                                        <span className="text-gray-500 text-xs italic">Waiting for response...</span>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MessageArea;