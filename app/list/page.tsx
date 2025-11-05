"use client"
import {SideNav} from "@/components/side-nav";
import {Card} from "@/components/ui/card";
import {useEffect, useState} from "react";
import {useLogin} from "@/contexts/login-context";
import {DbEvent} from "@/utils/interface";
import {toBLR} from "@/utils/string-manipulation/convert-money";
import {normalDate} from "@/utils/string-manipulation/normal date";
import {DollarSign} from "lucide-react";

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
                <div className="header-list">
                    <div></div>
                    <h1>Listagem de eventos</h1>
                    <button
                        className={`btn-money ${money === 1 ? "active" : money === 2 ? "disable" : ""}`}
                        onClick={() => setMoney(money + 1)}
                    >
                        <DollarSign/>
                    </button>
                </div>
                <Card className="card-list w-full">
                    <table className="table-auto w-full">
                        <thead>
                        <tr>
                            {
                                thead.map((x, i) => (
                                    <th
                                        key={x.label}
                                        onClick={() => setSort(i)}
                                    >
                                        {x.label}
                                    </th>
                                ))
                            }
                        </tr>
                        </thead>
                        <tbody>
                        {showEvents?.map(x => (
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