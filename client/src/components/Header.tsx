"use client"
import { useEffect, useState } from "react"

const Header: React.FC = () => {
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
                <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
                    <span className="px-2.5 py-1 bg-white/5 rounded-full border border-white/5">{date}</span>
                    <span className="font-mono text-purple-400">{time}</span>
                </div>
            </div>
        </header>
    )
}

export default Header
