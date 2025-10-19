"use client"

import {useEffect, useState} from "react"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Calendar, ChevronLeft, ChevronRight, DollarSign, MapPin} from "lucide-react"
import {useLogin} from "@/contexts/login-context"
import {DbEvent, Event} from "@/utils/interface"

const MONTHS = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
]

const DAYS_OF_WEEK = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

const EVENT_TYPES = ["Trabalho", "Pessoal", "Reunião", "Aniversário", "Compromisso médico", "Viagem", "Lazer", "Outro"]

const EVENT_TYPE_COLORS: Record<string, string> = {
    Trabalho: "bg-blue-500",
    Pessoal: "bg-green-500",
    Reunião: "bg-purple-500",
    Aniversário: "bg-pink-500",
    "Compromisso médico": "bg-red-500",
    Viagem: "bg-orange-500",
    Lazer: "bg-yellow-500",
    Outro: "bg-gray-500",
}


export default function CalendarPage() {
    const today = new Date()
    const {user} = useLogin()
    const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
    const [events, setEvents] = useState<Event[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedDay, setSelectedDay] = useState<number | null>(null)
    const [eventForm, setEventForm] = useState({
        name: "",
        type: "",
        location: "",
        cost: "",
    })
    const [hoveredDay, setHoveredDay] = useState<number | null>(null)

    useEffect(() => {
        fetch(`/api/events?user=${user}`)
            .then(r => r.json())
            .then(r => {
                const events = r.data as DbEvent[]
                const fixedEvents = events.map(event => {
                    console.log("Evento: ", event)
                    return {
                        ...event,
                        date: event.date.split("T")[0],
                        cost: event.money ? Number.parseFloat(event.money) : 0,
                    }
                })

                console.log("Eventos: ", fixedEvents)
                setEvents(fixedEvents)
            })
            .catch(e => console.log(e))
    }, [])

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    // Primeiro dia do mês e último dia do mês
    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)

    // Primeiro dia da semana do primeiro dia do mês (0 = domingo)
    const firstDayWeekday = firstDayOfMonth.getDay()

    // Número de dias no mês
    const daysInMonth = lastDayOfMonth.getDate()

    // Navegar para o mês anterior
    const goToPreviousMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1))
    }

    // Navegar para o próximo mês
    const goToNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1))
    }

    // Verificar se é o dia atual
    const isToday = (day: number) => {
        return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year
    }

    const handleDayClick = (day: number) => {
        setSelectedDay(day)
        setIsModalOpen(true)
    }

    const handleSaveEvent = () => {
        if (!eventForm.name || !eventForm.type || !selectedDay) return
        const id = new Date().toLocaleString('sv-SE', {
            timeZone: 'America/Sao_Paulo'
        });
        const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`
        const name = eventForm.name
        const type = eventForm.type
        const location = eventForm.location
        const cost = Number.parseFloat(eventForm.cost) || 0

        const newEvent: Event = {
            id: id,
            date: date,
            name: name,
            type: type,
            location: location,
            cost: cost,
        }

        setEvents([...events, newEvent])
        setEventForm({name: "", type: "", location: "", cost: ""})
        setIsModalOpen(false)
        setSelectedDay(null)
        console.log("new event: ", newEvent)
        const opt = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({...newEvent, user: user}),
        }

        fetch("/api/events", opt)
            .then(r => r.json())
            .then(r => console.log(r))
            .catch(e => console.log(e))
    }

    const getDayEvents = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`

        if (events.length === 0) return []
        return events.filter((event) => event.date === dateStr)
    }

    const getCurrentMonthTotal = () => {
        const currentMonthEvents = events.filter((event) => {
            const eventDate = new Date(event.date)
            return eventDate.getMonth() === month && eventDate.getFullYear() === year
        })
        return currentMonthEvents.reduce((total, event) => total + event.cost, 0)
    }

    const getCurrentMonthEventTypes = () => {
        const currentMonthEvents = events.filter((event) => {
            const eventDate = new Date(event.date)
            return eventDate.getMonth() === month && eventDate.getFullYear() === year
        })
        return [...new Set(currentMonthEvents.map((event) => event.type))]
    }

    // Gerar os dias do calendário
    const generateCalendarDays = () => {
        const days = []

        // Adicionar espaços vazios para os dias antes do primeiro dia do mês
        for (let i = 0; i < firstDayWeekday; i++) {
            days.push(<div key={`empty-${i}`} className="h-12 w-12"></div>)
        }

        // Adicionar os dias do mês
        for (let day = 1; day <= daysInMonth; day++) {
            const dayEvents = getDayEvents(day)
            const hasEvents = dayEvents.length > 0

            days.push(
                <div
                    key={day}
                    onClick={() => handleDayClick(day)}
                    onMouseEnter={() => setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                    className={`h-12 w-12 flex items-center justify-center rounded-lg text-sm font-medium cursor-pointer transition-colors hover:bg-accent hover:text-accent-foreground relative ${
                        isToday(day) ? "bg-primary text-primary-foreground font-bold" : "text-foreground"
                    }`}
                >
                    {day}
                    {hasEvents && (
                        <div
                            className={`absolute top-1 right-1 h-4 w-4 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                dayEvents.length > 1 ? EVENT_TYPE_COLORS[dayEvents[0].type] : EVENT_TYPE_COLORS[dayEvents[0].type]
                            }`}
                        >
                            {dayEvents.length > 1 ? dayEvents.length : ""}
                        </div>
                    )}

                    {hoveredDay === day && hasEvents && (
                        <div
                            className="bg-fff absolute top-14 left-1/2 transform -translate-x-1/2 bg-popover border border-border rounded-lg p-3 shadow-lg z-10 min-w-48">
                            <div className="text-sm font-semibold mb-2">
                                {day}/{month + 1}/{year}
                            </div>
                            <div className="space-y-1">
                                {dayEvents.map((event, index) => (
                                    <div key={index} className="text-xs">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`w-2 h-2 rounded-full ${EVENT_TYPE_COLORS[event.type]}`}></div>
                                            <span className="font-medium">{event.name}</span>
                                        </div>
                                        <div className="text-muted-foreground ml-4">
                                            {event.type} {event.cost > 0 && `• R$ ${event.cost.toFixed(2)}`}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>,
            )
        }

        return days
    }

    return (
        <div className="min-h-screen bg-background p-4">
            <div className="max-w-md mx-auto space-y-4">
                <Card>
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <Button variant="outline" size="icon" onClick={goToPreviousMonth}
                                    className="h-8 w-8 bg-transparent">
                                <ChevronLeft className="h-4 w-4"/>
                            </Button>

                            <CardTitle className="text-xl font-semibold">
                                {MONTHS[month]} {year}
                            </CardTitle>

                            <Button variant="outline" size="icon" onClick={goToNextMonth}
                                    className="h-8 w-8 bg-transparent">
                                <ChevronRight className="h-4 w-4"/>
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent>
                        {/* Cabeçalho dos dias da semana */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {DAYS_OF_WEEK.map((day) => (
                                <div
                                    key={day}
                                    className="h-8 flex items-center justify-center text-sm font-medium text-muted-foreground"
                                >
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Grade do calendário */}
                        <div className="grid grid-cols-7 gap-1">{generateCalendarDays()}</div>

                        <div className="mt-4 pt-4 border-t border-border">
                            <div className="space-y-3">
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 bg-primary rounded"></div>
                                        <span>Hoje</span>
                                    </div>
                                </div>

                                {getCurrentMonthEventTypes().length > 0 && (
                                    <div>
                                        <div className="text-sm font-medium mb-2">Tipos de Eventos:</div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {getCurrentMonthEventTypes().map((type) => (
                                                <div key={type} className="flex items-center gap-2 text-xs">
                                                    <div className={`h-3 w-3 rounded ${EVENT_TYPE_COLORS[type]}`}></div>
                                                    <span>{type}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <DollarSign className="h-5 w-5"/>
                            Resumo do Mês
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">R$ {getCurrentMonthTotal().toFixed(2)}</div>
                        <p className="text-sm text-muted-foreground">Total movimentado em {MONTHS[month]}</p>
                    </CardContent>
                </Card>

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="sm:max-w-md bg-fff">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5"/>
                                Criar Evento - {selectedDay}/{month + 1}/{year}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="eventName">Nome do Evento</Label>
                                <Input
                                    id="eventName"
                                    value={eventForm.name}
                                    onChange={(e) => setEventForm({...eventForm, name: e.target.value})}
                                    placeholder="Digite o nome do evento"
                                />
                            </div>

                            <div>
                                <Label htmlFor="eventType">Tipo do Evento</Label>
                                <Select value={eventForm.type}
                                        onValueChange={(value) => setEventForm({...eventForm, type: value})}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o tipo"/>
                                    </SelectTrigger>
                                    <SelectContent className="bg-fff">
                                        {EVENT_TYPES.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="eventLocation">Local (opcional)</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
                                    <Input
                                        id="eventLocation"
                                        value={eventForm.location}
                                        onChange={(e) => setEventForm({...eventForm, location: e.target.value})}
                                        placeholder="Digite o local do evento"
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="eventCost">Gasto (R$)</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
                                    <Input
                                        id="eventCost"
                                        type="number"
                                        step="0.01"
                                        value={eventForm.cost}
                                        onChange={(e) => setEventForm({...eventForm, cost: e.target.value})}
                                        placeholder="0,00"
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
                                    Cancelar
                                </Button>
                                <Button onClick={handleSaveEvent} className="flex-1"
                                        disabled={!eventForm.name || !eventForm.type}>
                                    Salvar Evento
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
