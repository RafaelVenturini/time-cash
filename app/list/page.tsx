"use client"
import {SideNav} from "@/components/side-nav";
import {Card} from "@/components/ui/card";
import {useEffect, useState} from "react";
import {useLogin} from "@/contexts/login-context";
import {DbEvent} from "@/utils/interface";
import {toBLR} from "@/utils/string-manipulation/convert-money";
import {normalDate} from "@/utils/string-manipulation/normal date";

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

    function sortDate(v){
        if(events){
            switch (v){
                case 0:
                    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            }   case 1:
                    return events.sort()
        }
    }

    useEffect(() => {
        fetch(`/api/events?user=${user}`)
            .then(r => r.json())
            .then(r => r.data as DbEvent[])
            .then(r => {
                setEvents(r.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()))
                console.log(r)
            })
    }, []);

    if (!events) return (
        <div>
            <SideNav/>
            <main className="main-content">
                <h1>Listagem de eventos</h1>
                <Card className="card-list">
                    <p>Nenhum evento encontrado</p>
                </Card>
            </main>
        </div>
    )
    else if (events.length === 0) return (
        <div>
            <SideNav/>
            <main className="main-content">
                <h1>Listagem de eventos</h1>
                <Card className="card-list">
                    <p>Nenhum evento encontrado</p>
                </Card>
            </main>
        </div>
    )

    return (
        <div>
            <SideNav/>
            <main className="main-content">
                <h1>Listagem de eventos</h1>
                <Card className="card-list w-full">
                    <table className="table-auto w-full">
                        <thead>
                        <tr>
                            {thead.map(x => <th key={x.label}>{x.label}</th>)}
                        </tr>
                        </thead>
                        <tbody>
                        {events.map(x => (
                            <tr>
                                <td>{x.name}</td>
                                <td>{normalDate(x.date)}</td>
                                <td>{x.place || "S/ Local"}</td>
                                <td>{toBLR(x.money) || "S/ Custo"}</td>
                                <td>{x.type}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </Card>
            </main>
        </div>
    )
}