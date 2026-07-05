"use client"
import { useEffect, useState } from "react"

interface HeaderProps {
    isDarkMode: boolean;
    onToggleTheme: () => void;
    onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, onToggleTheme, onOpenSettings }) => {
    const [time, setTime] = useState("")
    const [date, setDate] = useState("")

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

    return (
        <header className={`backdrop-blur-md flex items-center justify-between px-8 py-5 border-b transition-colors duration-300 ${
            isDarkMode 
                ? "bg-[#121124]/80 border-white/10" 
                : "bg-white/80 border-black/10"
        }`}>
            <div className="flex items-center gap-3">
                <div className="relative flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-purple-500 shadow-[0_0_8px_#a855f7]"></span>
                </div>
                <span className="font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500 text-base">
                    WEB SCRAPCHAT
                </span>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-4 text-xs font-medium">
                    <span className={`px-3 py-1.5 rounded-full border transition-colors duration-300 ${
                        isDarkMode 
                            ? "bg-white/5 border-white/5 text-gray-400" 
                            : "bg-black/5 border-black/5 text-gray-600"
                    }`}>{date}</span>
                    <span className={`font-mono transition-colors duration-300 ${
                        isDarkMode ? "text-purple-400" : "text-purple-600 font-semibold"
                    }`}>{time}</span>
                    
                    <button
                        onClick={onToggleTheme}
                        className={`p-2 rounded-lg border transition-all duration-300 cursor-pointer ${
                            isDarkMode
                                ? "text-gray-400 hover:text-white hover:bg-white/5 border-transparent hover:border-white/10"
                                : "text-gray-600 hover:text-black hover:bg-black/5 border-transparent hover:border-black/10"
                        }`}
                        aria-label="Toggle Theme"
                        title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {isDarkMode ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z"></path>
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                            </svg>
                        )}
                    </button>

                    <button
                        onClick={onOpenSettings}
                        className={`p-2 rounded-lg border transition-all duration-300 cursor-pointer ${
                            isDarkMode
                                ? "text-gray-400 hover:text-white hover:bg-white/5 border-transparent hover:border-white/10"
                                : "text-gray-600 hover:text-black hover:bg-black/5 border-transparent hover:border-black/10"
                        }`}
                        aria-label="API Settings"
                        title="Configure API Keys"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                </div>
            </div>
        </header>
    )
}

export default Header
