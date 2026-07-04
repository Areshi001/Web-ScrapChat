"use client"
import { useEffect, useState } from "react"

interface HeaderProps {
    tokenUsage?: { prompt: number; completion: number };
    tokenLimit?: number;
}

const Header: React.FC<HeaderProps> = ({ tokenUsage, tokenLimit }) => {
    const [time, setTime] = useState("")
    const [date, setDate] = useState("")
    const [showSettings, setShowSettings] = useState(false)
    const [orKey, setOrKey] = useState("")
    const [tavKey, setTavKey] = useState("")
    const [model, setModel] = useState("")

    useEffect(() => {
        const tick = () => {
            const now = new Date()
            setTime(now.toTimeString().slice(0, 8))
            setDate(now.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }))
        }
        tick(); 
        const id = setInterval(tick, 1000); 
        return () => clearInterval(id)
    }, [])

    useEffect(() => {
        // Read keys on mount
        setOrKey(localStorage.getItem("scrapchat_openrouter_key") || "")
        setTavKey(localStorage.getItem("scrapchat_tavily_key") || "")
        setModel(localStorage.getItem("scrapchat_model_name") || "")
    }, [])

    const handleSave = () => {
        localStorage.setItem("scrapchat_openrouter_key", orKey)
        localStorage.setItem("scrapchat_tavily_key", tavKey)
        localStorage.setItem("scrapchat_model_name", model)
        setShowSettings(false)
    }

    const totalUsage = tokenUsage ? tokenUsage.prompt + tokenUsage.completion : 0
    const limit = tokenLimit || 15000
    const percentage = Math.min((totalUsage / limit) * 100, 100)

    const getBarColor = (pct: number) => {
        if (pct > 85) return "from-red-500 to-rose-600"
        if (pct > 60) return "from-amber-500 to-orange-500"
        return "from-purple-500 to-blue-500"
    }

    return (
        <header className="bg-[#121124]/80 backdrop-blur-md flex items-center justify-between px-6 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
                <div className="relative flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-purple-500 shadow-[0_0_8px_#a855f7]"></span>
                </div>
                <span className="font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 text-base">
                    WEB SCRAPCHAT
                </span>
            </div>

            <div className="flex items-center gap-6">
                {tokenUsage && (
                    <div className="flex flex-col items-end gap-1.5 select-none">
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-semibold tracking-wider">
                            <span>TOKEN USAGE</span>
                            <span className="font-mono text-purple-400">{totalUsage.toLocaleString()} / {limit.toLocaleString()}</span>
                        </div>
                        <div className="w-40 h-1.5 bg-white/5 border border-white/10 rounded-full overflow-hidden">
                            <div 
                                className={`h-full bg-gradient-to-r ${getBarColor(percentage)} rounded-full transition-all duration-500 ease-out`} 
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                    </div>
                )}
                
                <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
                    <span className="px-2.5 py-1 bg-white/5 rounded-full border border-white/5">{date}</span>
                    <span className="font-mono text-purple-400">{time}</span>
                    <button 
                        onClick={() => setShowSettings(true)}
                        className="p-1.5 hover:bg-white/5 text-gray-400 hover:text-white rounded-lg border border-transparent hover:border-white/10 transition-all cursor-pointer"
                        title="API Configurations"
                    >
                        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                </div>
            </div>

            {showSettings && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#121124] border border-white/10 rounded-xl max-w-md w-full shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
                        <button 
                            onClick={() => setShowSettings(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <h3 className="text-base font-bold text-white mb-4">Credentials & Settings</h3>
                        <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                            Provide your own API keys to bypass default limits. Keys are stored locally in your browser.
                        </p>
                        <div className="space-y-4 text-xs">
                            <div>
                                <label className="block text-gray-300 font-semibold mb-1">OpenRouter API Key</label>
                                <input 
                                    type="password" 
                                    value={orKey}
                                    onChange={(e) => setOrKey(e.target.value)}
                                    placeholder="sk-or-v1-..."
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-300 font-semibold mb-1">OpenRouter Model Name</label>
                                <input 
                                    type="text" 
                                    value={model}
                                    onChange={(e) => setModel(e.target.value)}
                                    placeholder="deepseek/deepseek-v4-flash"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-300 font-semibold mb-1">Tavily Search API Key</label>
                                <input 
                                    type="password" 
                                    value={tavKey}
                                    onChange={(e) => setTavKey(e.target.value)}
                                    placeholder="tvly-..."
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2.5 mt-6">
                            <button 
                                onClick={() => setShowSettings(false)}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg border border-white/10 text-xs transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSave}
                                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-lg text-xs font-semibold shadow-md transition-colors cursor-pointer"
                            >
                                Save Settings
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    )
}

export default Header
