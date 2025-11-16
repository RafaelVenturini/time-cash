"use client"
import {SideNav} from "@/components/side-nav";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {useEffect, useState} from "react";
import {useLogin} from "@/contexts/login-context";
import {DbEvent} from "@/utils/interface";
import {toBLR} from "@/utils/string-manipulation/convert-money";
import {normalDate} from "@/utils/string-manipulation/normal date";
import {DollarSign, ArrowUpDown} from "lucide-react";
import {Button} from "@/components/ui/button";

export default function ListPage() {
    const thead = [
        {label: "Nome"},
        {label: "Data"},
        {label: "Lugar"},
        {label: "Custo"},
        {label: "Tipo"},
    ]
    const ctx = useLogin()
    const user = ctx.user
    const [events, setEvents] = useState<DbEvent[] | null>(null)
    const [showEvents, setShowEvents] = useState<DbEvent[] | null>(null)
    const [sort, setSort] = useState<number>(0)
    const [money, setMoney] = useState<number>(0)

    useEffect(() => {
        if (money === 3) setMoney(0)

        switch (money) {
            case 0:
                setSort(1)
                break;
            case 1:
                setShowEvents(events?.filter(e => Number(e.money) > 0) || null)
                break;
            case 2:
                setShowEvents(events?.filter(e => e.money == null) || null)
                break;

            default:
                setShowEvents(events)
                break;
        }
    }, [money]);

    useEffect(() => {
        let sorted = null
        if (showEvents) {
            switch (sort) {
                case 0:
                    sorted = showEvents.sort((a, b) => a.name.localeCompare(b.name));
                    break;
                case 1:
                    sorted = showEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                    break;
                case 2:
                    sorted = showEvents.sort((a, b) => a.place.localeCompare(b.place));
                    break;
                case 3:
                    sorted = showEvents.sort((a, b) => Number(a.money) - Number(b.money));
                    break;
                case 4:
                    sorted = showEvents.sort((a, b) => a.type.localeCompare(b.type));
                    break;
            }
        }
        setShowEvents(sorted)
    }, [sort]);

    useEffect(() => {
        fetch(`/api/events?user=${user}`)
            .then(r => r.json())
            .then(r => r.data as DbEvent[])
            .then(r => {
                setEvents(r)
                setShowEvents(r.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()))
                console.log(r)
            })
    }, []);

    if (!events) return (
        <div className="min-h-screen bg-white">
            <SideNav/>
            <main className="main-content-wrapper p-6">
                <div className="w-full max-w-[1400px] mx-auto space-y-6">
                    <h1 className="text-3xl font-bold gradient-text">Listagem de eventos</h1>
                    <Card className="shadow-2xl border-0 hover-lift bg-white/80 backdrop-blur-sm h-[600px] flex flex-col">
                        <CardHeader className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-t-lg flex-shrink-0">
                            <CardTitle className="text-xl font-bold">Eventos Cadastrados</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex items-center justify-center">
                            <p className="text-gray-500">Carregando eventos...</p>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
    else if (events.length === 0) return (
        <div className="min-h-screen bg-white">
            <SideNav/>
            <main className="main-content-wrapper p-6">
                <div className="w-full max-w-[1400px] mx-auto space-y-6">
                    <h1 className="text-3xl font-bold gradient-text">Listagem de eventos</h1>
                    <Card className="shadow-2xl border-0 hover-lift bg-white/80 backdrop-blur-sm h-[600px] flex flex-col">
                        <CardHeader className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-t-lg flex-shrink-0">
                            <CardTitle className="text-xl font-bold">Eventos Cadastrados</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex items-center justify-center">
                            <p className="text-gray-500">Nenhum evento encontrado</p>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )

    return (
        <div className="min-h-screen bg-white">
            <SideNav/>
            <main className="main-content-wrapper p-6">
                <div className="w-full max-w-[1400px] mx-auto space-y-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold gradient-text">Listagem de eventos</h1>
                        <Button
                            variant="outline"
                            onClick={() => setMoney(money + 1)}
                            className={`gap-2 ${money === 1 ? "bg-emerald-50 border-emerald-300 text-emerald-700" : money === 2 ? "bg-red-50 border-red-300 text-red-700" : ""}`}
                        >
                            <DollarSign className="h-4 w-4"/>
                            {money === 0 ? "Todos" : money === 1 ? "Com Custo" : "Sem Custo"}
                        </Button>
                    </div>
                    <Card className="shadow-2xl border-0 hover-lift bg-white/80 backdrop-blur-sm h-[600px] flex flex-col">
                        <CardHeader className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-t-lg flex-shrink-0">
                            <CardTitle className="text-xl font-bold">Eventos Cadastrados</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-hidden p-0 min-h-0">
                            <div className="h-full overflow-y-auto overflow-x-auto">
                                <table className="w-full">
                                    <thead className="sticky top-0 z-10 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
                                        <tr>
                                            {thead.map((x, i) => (
                                                <th
                                                    key={x.label}
                                                    onClick={() => setSort(i)}
                                                    className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-slate-700/50 transition-colors select-none"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {x.label}
                                                        <ArrowUpDown className="h-3 w-3 opacity-50"/>
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {showEvents?.map((x) => (
                                            <tr 
                                                key={x.event_id}
                                                className="hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-blue-50/50 transition-colors"
                                            >
                                                <td className="px-6 py-4 text-sm text-gray-900 font-medium">{x.name}</td>
                                                <td className="px-6 py-4 text-sm text-gray-700">{normalDate(x.date)}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {x.place || <span className="text-gray-400 italic">S/ Local</span>}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-semibold">
                                                    {toBLR(x.money) ? (
                                                        <span className={Number(x.money) > 0 ? "text-emerald-600" : "text-red-600"}>
                                                            {toBLR(x.money)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 italic">S/ Custo</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                        {x.type}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {(!showEvents || showEvents.length === 0) && (
                                    <div className="flex items-center justify-center h-64 text-gray-500">
                                        <p>Nenhum evento encontrado</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}