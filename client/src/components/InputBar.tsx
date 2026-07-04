const InputBar = ({ currentMessage, setCurrentMessage, onSubmit }: any) => {
    return (
        <div className="bg-[#121124]/90 border-t border-white/10 p-5 backdrop-blur-md">
            <div className="bg-[#191835] border border-white/10 focus-within:border-purple-500/50 rounded-xl p-3.5 transition-all duration-300 shadow-inner group">
                <div className="flex items-center gap-3">
                    <span className="text-purple-400 font-semibold text-lg select-none ml-1 transform group-focus-within:translate-x-0.5 transition-transform">/</span>
                    <input 
                        type="text" 
                        placeholder="Ask anything you want to search or discuss..." 
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") onSubmit(e) }}
                        className="flex-grow bg-transparent focus:outline-none text-gray-100 placeholder-gray-500 text-sm" 
                    />
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                    <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 bg-purple-500/10 text-purple-400 rounded-lg text-xs font-semibold tracking-wide border border-purple-500/20 inline-flex items-center gap-1.5 shadow-sm">
                            <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse"></span>
                            Web Search Enabled
                        </span>
                        <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-semibold tracking-wide border border-blue-500/20 inline-flex items-center gap-1.5 shadow-sm">
                            DeepSeek v4 Active
                        </span>
                    </div>
                    <button 
                        onClick={onSubmit} 
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold px-4 py-2 rounded-lg text-xs tracking-wider transition-all duration-200 cursor-pointer shadow-md hover:shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5"
                    >
                        <span>Search</span>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                        </svg>
                    </button>
                </div>
            </div>
            <div className="flex items-center justify-between mt-3 px-1 text-[11px] text-gray-500 font-medium">
                <span>SYSTEM STATUS: <span className="text-emerald-400 font-bold">READY</span></span>
                <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    ONLINE
                </span>
            </div>
        </div>
    );
}

export default InputBar;