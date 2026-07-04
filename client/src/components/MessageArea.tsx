import React from 'react';

// Custom Markdown Renderer for Premium Reply Style
const Markdown = ({ text }: { text: string }) => {
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
                return <strong key={idx} className="font-bold text-white tracking-wide">{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('*') && part.endsWith('*')) {
                return <em key={idx} className="italic text-gray-300">{part.slice(1, -1)}</em>;
            }
            if (part.startsWith('`') && part.endsWith('`')) {
                return <code key={idx} className="bg-black/40 text-rose-400 px-1.5 py-0.5 rounded font-mono text-xs border border-white/5">{part.slice(1, -1)}</code>;
            }
            if (part.startsWith('[') && part.includes('](')) {
                const match = part.match(/\[(.*?)\]\((.*?)\)/);
                if (match) {
                    return (
                        <a key={idx} href={match[2]} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline font-medium transition-colors">
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
                <ul key={`ul-${keyPrefix}`} className="list-disc pl-5 mb-3 space-y-1 text-gray-300">
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
            renderedElements.push(<h1 key={index} className="text-xl font-extrabold mt-4 mb-2 text-white border-b border-white/10 pb-1">{parseInline(trimmed.substring(2))}</h1>);
        } else if (trimmed.startsWith('## ')) {
            flushList(index);
            renderedElements.push(<h2 key={index} className="text-lg font-bold mt-4 mb-2 text-white">{parseInline(trimmed.substring(3))}</h2>);
        } else if (trimmed.startsWith('### ')) {
            flushList(index);
            renderedElements.push(<h3 key={index} className="text-md font-semibold mt-3 mb-1.5 text-gray-100">{parseInline(trimmed.substring(4))}</h3>);
        } else if (trimmed.startsWith('#### ')) {
            flushList(index);
            renderedElements.push(<h4 key={index} className="text-sm font-semibold mt-2 mb-1.5 text-gray-200">{parseInline(trimmed.substring(5))}</h4>);
        } else if (trimmed === '---' || trimmed === '***') {
            flushList(index);
            renderedElements.push(<hr key={index} className="my-3 border-white/10" />);
        } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            inList = true;
            listItems.push(trimmed.substring(2));
        } else if (trimmed === '') {
            flushList(index);
        } else {
            flushList(index);
            renderedElements.push(<p key={index} className="mb-2.5 leading-relaxed text-gray-300 text-[14px]">{parseInline(line)}</p>);
        }
    });

    flushList(lines.length);
    return <div className="space-y-0.5">{renderedElements}</div>;
};

const PremiumTypingAnimation = () => {
    return (
        <div className="flex items-center py-1">
            <div className="flex items-center space-x-1.5">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}></div>
            </div>
        </div>
    );
};

const SearchStages = ({ searchInfo }) => {
    if (!searchInfo || !searchInfo.stages || searchInfo.stages.length === 0) return null;

    return (
        <div className="mb-4 mt-2 relative pl-5 border-l-2 border-purple-500/30 ml-2">
            <div className="flex flex-col space-y-3.5 text-xs text-gray-400">
                {/* Searching Stage */}
                {searchInfo.stages.includes('searching') && (
                    <div className="relative">
                        <div className="absolute -left-[27px] top-1 w-3 h-3 bg-purple-500 rounded-full border-2 border-[#0b0a14] shadow-[0_0_8px_rgba(168,85,247,0.5)]"></div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-gray-300 flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 text-purple-400 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Searching the Web
                            </span>
                            <div className="flex flex-wrap gap-2 mt-1.5">
                                <div className="bg-white/5 text-[11px] text-purple-300 px-2.5 py-1 rounded-lg border border-purple-500/20 inline-flex items-center">
                                    <svg className="w-3 h-3 mr-1 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
                        <div className="absolute -left-[27px] top-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-[#0b0a14] shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-gray-300 flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                                </svg>
                                Analyzing Resources
                            </span>
                            {searchInfo.urls && searchInfo.urls.length > 0 && (
                                <div className="mt-1.5 flex flex-wrap gap-2">
                                    {Array.isArray(searchInfo.urls) ? (
                                        searchInfo.urls.map((url, index) => {
                                            const hostname = typeof url === 'string' ? new URL(url).hostname.replace('www.', '') : 'source';
                                            return (
                                                <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="bg-white/5 hover:bg-white/10 text-[10px] text-blue-300 hover:text-blue-200 px-2 py-1 rounded border border-blue-500/20 max-w-[150px] truncate transition-all duration-200">
                                                    🔗 {hostname}
                                                </a>
                                            )
                                        })
                                    ) : (
                                        <div className="bg-white/5 text-[10px] text-blue-300 px-2 py-1 rounded border border-blue-500/20 max-w-[150px] truncate">
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
                        <div className="absolute -left-[27px] top-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0b0a14] shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                        <span className="font-semibold text-gray-300 flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                            </svg>
                            Synthesizing Answer
                        </span>
                    </div>
                )}

                {/* Error Message */}
                {searchInfo.stages.includes('error') && (
                    <div className="relative">
                        <div className="absolute -left-[27px] top-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-[#0b0a14] shadow-[0_0_8px_rgba(244,63,94,0.5)]"></div>
                        <span className="font-semibold text-rose-400">Search Error</span>
                        <div className="text-[11px] text-rose-300/80 mt-1 pl-1">
                            {searchInfo.error || "An error occurred during search."}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const MessageArea = ({ messages }) => {
    return (
        <div className="flex-grow overflow-y-auto bg-[#0b0a14] border-b border-white/5" style={{ minHeight: 0 }}>
            <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
                {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} w-full`}>
                        <div className="flex flex-col max-w-[85%] sm:max-w-[75%] space-y-1">
                            {/* Search Status Display - Above response */}
                            {!message.isUser && message.searchInfo && (
                                <SearchStages searchInfo={message.searchInfo} />
                            )}

                            {/* Message Content Bubble */}
                            <div
                                className={`rounded-2xl py-3 px-5 shadow-lg border transition-all duration-300 ${message.isUser
                                    ? 'bg-gradient-to-br from-purple-600 to-indigo-700 text-white border-purple-500/20 rounded-tr-none'
                                    : 'bg-[#121124] text-gray-100 border-white/5 rounded-tl-none'
                                    }`}
                            >
                                {message.isLoading ? (
                                    <PremiumTypingAnimation />
                                ) : message.isUser ? (
                                    <span className="text-[14.5px] leading-relaxed break-words">{message.content}</span>
                                ) : (
                                    message.content ? (
                                        <Markdown text={message.content} />
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