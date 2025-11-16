"use client"

import {usePathname} from "next/navigation"
import {Calendar, List} from "lucide-react"

export function SideNav() {
    const pathname = usePathname()
    const btns = [
        {label: "Calendário", link: "/", icon: Calendar},
        {label: "Listagem", link: "/list", icon: List},
    ]
    return (
        <div className="side-nav">
            <div className="mt-8 mb-12">
                <h2 className="text-2xl font-bold text-white drop-shadow-lg">TimeCash</h2>
            </div>
            {
                btns.map((x, idx) => {
                    const Icon = x.icon
                    const isActive = pathname === x.link
                    return (
                        <a 
                            key={x.link}
                            href={x.link}
                            className={`flex items-center gap-3 px-6 py-4 w-full transition-all duration-300 ${
                                isActive 
                                    ? "bg-white/20 backdrop-blur-sm border-l-4 border-white shadow-lg" 
                                    : "hover:bg-white/10"
                            }`}
                            style={{animationDelay: `${idx * 0.1}s`}}
                        >
                            <Icon className="h-5 w-5" />
                            <span className="text-lg font-semibold">{x.label}</span>
                        </a>
                    )
                })
            }
        </div>
    )
}
