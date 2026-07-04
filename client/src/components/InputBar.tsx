const InputBar = ({ currentMessage, setCurrentMessage, onSubmit, isDarkMode }: any) => {
    return (
        <div className={`border-t p-6 backdrop-blur-md transition-colors duration-300 ${
            isDarkMode ? "bg-[#121124]/90 border-white/10" : "bg-white/90 border-black/10"
        }`}>
            <div className={`border focus-within:border-purple-500/50 rounded-xl p-4.5 transition-all duration-300 shadow-inner group ${
                isDarkMode ? "bg-[#191835] border-white/10" : "bg-gray-50 border-black/10"
            }`}>
                <div className="flex items-center gap-3.5">
                    <span className="text-purple-500 font-semibold text-xl select-none ml-1 transform group-focus-within:translate-x-0.5 transition-transform">/</span>
                    <input 
                        type="text" 
                        placeholder="Ask anything you want to search or discuss..." 
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") onSubmit(e) }}
                        className={`flex-grow bg-transparent focus:outline-none text-base transition-colors duration-300 ${
                            isDarkMode ? "text-gray-100 placeholder-gray-500" : "text-gray-900 placeholder-gray-400"
                        }`} 
                    />
                </div>
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-3.5">
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide border inline-flex items-center gap-1.5 shadow-sm transition-all ${
                            isDarkMode 
                                ? "bg-purple-500/10 text-purple-400 border-purple-500/20" 
                                : "bg-purple-100/60 text-purple-700 border-purple-200"
                        }`}>
                            <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse"></span>
                            Web Search Enabled
                        </span>
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide border inline-flex items-center gap-1.5 shadow-sm transition-all ${
                            isDarkMode 
                                ? "bg-blue-500/10 text-blue-400 border-blue-500/20" 
                                : "bg-blue-100/60 text-blue-700 border-blue-200"
                        }`}>
                            DeepSeek v4 Active
                        </span>
                    </div>
                    <button 
                        onClick={onSubmit} 
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold px-5 py-2.5 rounded-lg text-xs tracking-wider transition-all duration-200 cursor-pointer shadow-md hover:shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
                    >
                        <span>Search</span>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                        </svg>
                    </button>
                </div>
            </div>
            <div className={`flex items-center justify-between mt-3 px-1 text-[11px] font-semibold transition-colors duration-300 ${
                isDarkMode ? "text-gray-500" : "text-gray-600"
            }`}>
                <span>SYSTEM STATUS: <span className="text-emerald-500 font-bold">READY</span></span>
                <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    ONLINE
                </span>
            </div>
        </div>
    );
}

export default InputBar;