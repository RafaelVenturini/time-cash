"use client"

import {useEffect, useState} from "react"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Switch} from "@/components/ui/switch"
import {Calendar, ChevronLeft, ChevronRight, DollarSign, MapPin, Pencil, Plus} from "lucide-react"
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

const EVENT_TYPES = ["Trabalho", "Pessoal", "Reunião", "Aniversário", "Compromisso médico", "Viagem", "Lazer", "Compra", "Outro"]

const EVENT_TYPE_COLORS: Record<string, string> = {
    Trabalho: "bg-blue-500",
    Pessoal: "bg-green-500",
    Reunião: "bg-purple-500",
    Aniversário: "bg-pink-500",
    "Compromisso médico": "bg-red-500",
    Viagem: "bg-orange-500",
    Lazer: "bg-yellow-500",
    Compra: "bg-amber-500",
    Outro: "bg-gray-500",
}

const RECURRENCE_OPTIONS = [
    {value: "daily", label: "Diariamente"},
    {value: "weekly", label: "Semanalmente"},
    {value: "monthly", label: "Mensalmente"},
    {value: "yearly", label: "Anualmente"},
]

const INITIAL_EVENT_FORM = {
    name: "",
    date: "",
    type: "",
    location: "",
    cost: "",
    isRecurring: false,
    recurrenceType: "",
    recurrenceInterval: "1",
    recurrenceEndDate: "",
    installments: "",
}


export default function CalendarPage() {
    const today = new Date()
    const {user} = useLogin()
    const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
    const [events, setEvents] = useState<Event[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedDay, setSelectedDay] = useState<number | null>(null)
    const [isDayEventsModalOpen, setIsDayEventsModalOpen] = useState(false)
    const [eventForm, setEventForm] = useState({...INITIAL_EVENT_FORM})
    const [editingEvent, setEditingEvent] = useState<Event | null>(null)

    useEffect(() => {
        fetch(`/api/events?user=${user}`)
            .then(r => r.json())
            .then(r => {
                const dbEvents = (r.data || []) as DbEvent[]
                const formattedEvents = dbEvents.map((event) => {
                    const formattedDate = event.date ? event.date.split("T")[0] : ""
                    const recurrenceEndDate = event.recurrence_end_date
                        ? event.recurrence_end_date.split("T")[0]
                        : undefined
                    const installments =
                        event.installments !== undefined && event.installments !== null
                            ? Number(event.installments)
                            : null

                    return {
                        id: event.event_id,
                        date: formattedDate,
                        name: event.name,
                        type: event.type,
                        location: event.place,
                        cost: event.money ? Number.parseFloat(event.money) : 0,
                        isRecurring: Boolean(event.is_recurring),
                        recurrenceType: event.recurrence_type ?? undefined,
                        recurrenceInterval: event.recurrence_interval ?? undefined,
                        recurrenceEndDate,
                        installments,
                    } as Event
                })

                setEvents(formattedEvents)
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
        setSelectedDay(null)
        setIsDayEventsModalOpen(false)
    }

    // Navegar para o próximo mês
    const goToNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1))
        setSelectedDay(null)
        setIsDayEventsModalOpen(false)
    }

    // Verificar se é o dia atual
    const isToday = (day: number) => {
        return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year
    }

    const openCreateModal = (date: string, day: number | null) => {
        setEventForm({...INITIAL_EVENT_FORM, date})
        setEditingEvent(null)
        setSelectedDay(day)
        setIsModalOpen(true)
    }

    const handleDayClick = (day: number) => {
        const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
        setSelectedDay(day)
        if (!editingEvent) {
            setEventForm((current) => ({
                ...current,
                date: dateString,
            }))
        }
        setIsDayEventsModalOpen(true)
    }

    const handleCreateEventClick = () => {
        if (isDayEventsModalOpen) {
            setIsDayEventsModalOpen(false)
        }
        const today = new Date()
        const defaultDay =
            selectedDay ??
            (today.getFullYear() === year && today.getMonth() === month
                ? today.getDate()
                : 1)

        const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(defaultDay).padStart(2, "0")}`
        openCreateModal(dateString, defaultDay)
    }

    const handleEditEvent = (event: Event) => {
        setEditingEvent(event)
        setIsDayEventsModalOpen(false)

        const eventDate = new Date(event.date)
        const formattedDate = !Number.isNaN(eventDate.getTime())
            ? event.date
            : ""

        setEventForm({
            name: event.name,
            date: formattedDate,
            type: event.type,
            location: event.location ?? "",
            cost: event.cost !== undefined ? event.cost.toString() : "",
            isRecurring: Boolean(event.isRecurring),
            recurrenceType: event.recurrenceType ?? "",
            recurrenceInterval: event.recurrenceInterval ? event.recurrenceInterval.toString() : "1",
            recurrenceEndDate: event.recurrenceEndDate ?? "",
            installments:
                event.installments !== null && event.installments !== undefined
                    ? event.installments.toString()
                    : "",
        })

        setSelectedDay(!Number.isNaN(eventDate.getTime()) ? eventDate.getDate() : null)
        setIsModalOpen(true)
    }

    const handleModalChange = (open: boolean) => {
        setIsModalOpen(open)
        if (!open) {
            setEventForm({...INITIAL_EVENT_FORM})
            setEditingEvent(null)
        }
    }

    const addMonthsPreservingDay = (dateString: string, monthsToAdd: number) => {
        const [yearStr, monthStr, dayStr] = dateString.split("-")
        const year = Number(yearStr)
        const month = Number(monthStr)
        const day = Number(dayStr)

        if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
            return dateString
        }

        const baseDate = new Date(year, month - 1, 1)
        baseDate.setMonth(baseDate.getMonth() + monthsToAdd)
        const lastDayOfTargetMonth = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0).getDate()
        const targetDay = Math.min(day, lastDayOfTargetMonth)
        baseDate.setDate(targetDay)

        const formattedMonth = String(baseDate.getMonth() + 1).padStart(2, "0")
        const formattedDay = String(baseDate.getDate()).padStart(2, "0")

        return `${baseDate.getFullYear()}-${formattedMonth}-${formattedDay}`
    }

    const handleSaveEvent = () => {
        const isEditing = Boolean(editingEvent)

        if (!eventForm.name || !eventForm.type || !eventForm.date) return
        if (eventForm.isRecurring && !eventForm.recurrenceType) return
        if (eventForm.type === "Compra" && !eventForm.installments) return

        const id = isEditing
            ? editingEvent!.id
            : new Date().toLocaleString("sv-SE", {timeZone: "America/Sao_Paulo"})
        const date = eventForm.date
        const name = eventForm.name
        const type = eventForm.type
        const location = eventForm.location
        const totalCost = Number.parseFloat(eventForm.cost) || 0
        const recurrenceIntervalValue = Math.max(1, parseInt(eventForm.recurrenceInterval || "1", 10) || 1)
        const recurrenceEndDateValue = eventForm.recurrenceEndDate || undefined
        const installmentsValue =
            eventForm.type === "Compra"
                ? Math.max(1, parseInt(eventForm.installments || "1", 10) || 1)
                : null
        const isRecurring = eventForm.isRecurring
        const recurrenceTypeValue = isRecurring ? eventForm.recurrenceType : null
        const recurrenceIntervalPayload = isRecurring ? recurrenceIntervalValue : 1
        const recurrenceEndDatePayload = isRecurring && recurrenceEndDateValue ? recurrenceEndDateValue : null
        const shouldCreateInstallments =
            !isEditing && eventForm.type === "Compra" && (installmentsValue ?? 0) > 1

        if (shouldCreateInstallments && installmentsValue) {
            const perInstallmentBase = Math.round((totalCost / installmentsValue) * 100) / 100
            let allocated = 0

            const installmentEvents: Event[] = Array.from({length: installmentsValue}, (_, index) => {
                const isLast = index === installmentsValue - 1
                const installmentCost = isLast
                    ? Number((totalCost - allocated).toFixed(2))
                    : perInstallmentBase
                allocated += installmentCost

                const installmentId = index === 0 ? id : `${id}-${index + 1}`
                const installmentDate = addMonthsPreservingDay(date, index)

                return {
                    id: installmentId,
                    date: installmentDate,
                    name: `${name} (${index + 1}/${installmentsValue})`,
                    type,
                    location,
                    cost: Number(installmentCost.toFixed(2)),
                    isRecurring: false,
                    recurrenceType: undefined,
                    recurrenceInterval: undefined,
                    recurrenceEndDate: undefined,
                    installments: installmentsValue,
                }
            })

            setEvents((currentEvents) => [...currentEvents, ...installmentEvents])

            installmentEvents.forEach((eventData) => {
                const payload = {
                    ...eventData,
                    user: user,
                    isRecurring: false,
                    recurrenceType: null,
                    recurrenceInterval: 1,
                    recurrenceEndDate: null,
                    installments: installmentsValue,
                }

                fetch("/api/events", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                })
                    .then((response) => response.json())
                    .then((response) => console.log(response))
                    .catch((error) => console.log(error))
            })

            handleModalChange(false)
            return
        }

        const adjustedCost =
            installmentsValue && installmentsValue > 0
                ? Math.round((totalCost / installmentsValue) * 100) / 100
                : totalCost

        const updatedEvent: Event = {
            id,
            date,
            name,
            type,
            location,
            cost: Number(adjustedCost.toFixed(2)),
            isRecurring: isRecurring,
            recurrenceType: recurrenceTypeValue ? (recurrenceTypeValue as Event["recurrenceType"]) : undefined,
            recurrenceInterval: isRecurring ? recurrenceIntervalValue : undefined,
            recurrenceEndDate: isRecurring && recurrenceEndDateValue ? recurrenceEndDateValue : undefined,
            installments: installmentsValue,
        }

        if (isEditing) {
            setEvents((currentEvents) =>
                currentEvents.map((event) => (event.id === id ? updatedEvent : event))
            )
        } else {
            setEvents((currentEvents) => [...currentEvents, updatedEvent])
        }

        console.log(`${isEditing ? "updated" : "new"} event: `, updatedEvent)

        const payload = {
            ...updatedEvent,
            user: user,
            isRecurring,
            recurrenceType: recurrenceTypeValue,
            recurrenceInterval: recurrenceIntervalPayload,
            recurrenceEndDate: recurrenceEndDatePayload,
            installments: installmentsValue,
        }

        const opt = {
            method: isEditing ? "PUT" : "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        }

        fetch("/api/events", opt)
            .then((r) => r.json())
            .then((r) => console.log(r))
            .catch((e) => console.log(e))

        handleModalChange(false)
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

    const isSaveDisabled =
        !eventForm.name ||
        !eventForm.date ||
        !eventForm.type ||
        (eventForm.isRecurring && !eventForm.recurrenceType) ||
        (eventForm.type === "Compra" && !eventForm.installments)

    const selectedDayEvents =
        selectedDay !== null
            ? getDayEvents(selectedDay).sort(
                (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
            )
            : []
    const selectedDayLabel =
        selectedDay !== null
            ? `${String(selectedDay).padStart(2, "0")}/${String(month + 1).padStart(2, "0")}/${year}`
            : null

    // Gerar os dias do calendário
    const generateCalendarDays = () => {
        const days = []

        // Adicionar espaços vazios para os dias antes do primeiro dia do mês
        for (let i = 0; i < firstDayWeekday; i++) {
            days.push(<div key={`empty-${i}`} className="min-h-24 rounded-lg border border-dashed border-border/40 bg-muted/10"></div>)
        }

        // Adicionar os dias do mês
        for (let day = 1; day <= daysInMonth; day++) {
            const dayEvents = getDayEvents(day).sort(
                (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
            )
            const hasEvents = dayEvents.length > 0
            const isSelected = selectedDay === day

            days.push(
                <div
                    key={day}
                    onClick={() => handleDayClick(day)}
                    className={`flex h-full min-h-24 cursor-pointer flex-col rounded-lg border p-2 text-left text-xs transition-colors ${
                        isSelected
                            ? "border-primary/70 bg-primary/10"
                            : "border-transparent bg-background hover:border-accent hover:bg-accent/40"
                    } ${
                        isToday(day) ? "ring-1 ring-primary/60" : ""
                    }`}
                >
                    <div className="mb-1 flex items-center justify-between text-sm font-semibold">
                        <span className={isSelected ? "text-primary" : "text-foreground"}>{day}</span>
                        {hasEvents && (
                            <span className="text-[10px] font-medium text-muted-foreground">
                                {dayEvents.length} evento{dayEvents.length > 1 ? "s" : ""}
                            </span>
                        )}
                    </div>

                    {hasEvents && (
                        <div className="mt-1 flex flex-1 flex-wrap gap-1">
                            {dayEvents.slice(0, 3).map((event) => (
                                <span
                                    key={event.id}
                                    className="inline-flex items-center gap-1 rounded-full bg-muted/80 px-2 py-[2px] text-[10px] font-medium text-muted-foreground"
                                >
                                    <span
                                        className={`h-2 w-2 rounded-full ${
                                            EVENT_TYPE_COLORS[event.type] || "bg-gray-400"
                                        }`}
                                    ></span>
                                    <span className="max-w-[72px] truncate">{event.name}</span>
                                </span>
                            ))}
                            {dayEvents.length > 3 && (
                                <span className="inline-flex items-center rounded-full bg-muted px-2 py-[2px] text-[10px] font-semibold text-muted-foreground">
                                    +{dayEvents.length - 3}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            )
        }

        return days
    };

    return (
        <div className="min-h-screen bg-background p-4">
            <div className="mx-auto max-w-5xl space-y-4">
                <Card>
                    <CardHeader className="space-y-4 pb-4">
                        <div className="flex items-center justify-between">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={goToPreviousMonth}
                                className="h-8 w-8 bg-transparent"
                            >
                                <ChevronLeft className="h-4 w-4"/>
                            </Button>

                            <CardTitle className="text-xl font-semibold">
                                {MONTHS[month]} {year}
                            </CardTitle>

                            <Button
                                variant="outline"
                                size="icon"
                                onClick={goToNextMonth}
                                className="h-8 w-8 bg-transparent"
                            >
                                <ChevronRight className="h-4 w-4"/>
                            </Button>
                        </div>

                        <div className="flex justify-end">
                            <Button onClick={handleCreateEventClick} className="gap-2">
                                <Plus className="h-4 w-4"/>
                                Novo Evento
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent>
                        {/* Cabeçalho dos dias da semana */}
                        <div className="mb-2 grid grid-cols-7 gap-1">
                            {DAYS_OF_WEEK.map((day) => (
                                <div
                                    key={day}
                                    className="flex h-8 items-center justify-center text-sm font-medium text-muted-foreground"
                                >
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Grade do calendário */}
                        <div className="grid grid-cols-7 gap-1">{generateCalendarDays()}</div>

                        <div className="mt-4 space-y-3 border-t border-border pt-4">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded bg-primary"></div>
                                    <span>Hoje</span>
                                </div>
                            </div>

                            {getCurrentMonthEventTypes().length > 0 && (
                                <div>
                                    <div className="mb-2 text-sm font-medium">Tipos de Eventos:</div>
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
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <DollarSign className="h-5 w-5"/>
                            Resumo do Mês
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            R$ {getCurrentMonthTotal().toFixed(2)}
                        </div>
                        <p className="text-sm text-muted-foreground">Total movimentado em {MONTHS[month]}</p>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isModalOpen} onOpenChange={handleModalChange}>
                <DialogContent className="sm:max-w-md bg-fff">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5"/>
                            {editingEvent ? "Editar Evento" : "Criar Evento"}{" "}
                            {eventForm.date && `- ${new Date(eventForm.date).toLocaleDateString("pt-BR")}`}
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
                            <Label htmlFor="eventDate">Data</Label>
                            <Input
                                id="eventDate"
                                type="date"
                                value={eventForm.date}
                                onChange={(e) => setEventForm({...eventForm, date: e.target.value})}
                            />
                        </div>

                        <div>
                            <Label htmlFor="eventType">Tipo do Evento</Label>
                            <Select
                                value={eventForm.type}
                                onValueChange={(value) =>
                                    setEventForm({
                                        ...eventForm,
                                        type: value,
                                        installments: value === "Compra" ? eventForm.installments : "",
                                    })
                                }
                            >
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

                        <div className="flex items-center justify-between rounded-md border border-border p-3">
                            <div>
                                <Label htmlFor="eventRecurring" className="text-sm font-medium">
                                    Evento recorrente
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Ative para definir uma frequência.
                                </p>
                            </div>
                            <Switch
                                id="eventRecurring"
                                checked={eventForm.isRecurring}
                                onCheckedChange={(checked) =>
                                    setEventForm({
                                        ...eventForm,
                                        isRecurring: checked,
                                        recurrenceType: checked ? eventForm.recurrenceType : "",
                                        recurrenceInterval: checked ? eventForm.recurrenceInterval : "1",
                                        recurrenceEndDate: checked ? eventForm.recurrenceEndDate : "",
                                    })
                                }
                            />
                        </div>

                        {eventForm.isRecurring && (
                            <div className="grid gap-3 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="recurrenceType">Frequência</Label>
                                    <Select
                                        value={eventForm.recurrenceType}
                                        onValueChange={(value) => setEventForm({...eventForm, recurrenceType: value})}
                                    >
                                        <SelectTrigger id="recurrenceType">
                                            <SelectValue placeholder="Selecione a frequência"/>
                                        </SelectTrigger>
                                        <SelectContent className="bg-fff">
                                            {RECURRENCE_OPTIONS.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="md:col-span-2">
                                    <Label htmlFor="recurrenceEndDate">Data final (opcional)</Label>
                                    <Input
                                        id="recurrenceEndDate"
                                        type="date"
                                        value={eventForm.recurrenceEndDate}
                                        onChange={(e) => setEventForm({...eventForm, recurrenceEndDate: e.target.value})}
                                    />
                                </div>
                            </div>
                        )}

                        {eventForm.type === "Compra" && (
                            <div>
                                <Label htmlFor="installments">Parcelas</Label>
                                <Input
                                    id="installments"
                                    type="number"
                                    min={1}
                                    value={eventForm.installments}
                                    onChange={(e) => setEventForm({...eventForm, installments: e.target.value})}
                                    placeholder="Quantidade de parcelas"
                                />
                            </div>
                        )}

                        <div className="flex gap-2 pt-4">
                            <Button variant="outline" onClick={() => handleModalChange(false)} className="flex-1">
                                Cancelar
                            </Button>
                            <Button onClick={handleSaveEvent} className="flex-1" disabled={isSaveDisabled}>
                                Salvar Evento
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isDayEventsModalOpen} onOpenChange={setIsDayEventsModalOpen}>
                <DialogContent className="sm:max-w-lg bg-fff">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5"/>
                            Eventos em {selectedDayLabel ?? "dia selecionado"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
                        {selectedDayEvents.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                                Nenhum evento cadastrado para este dia.
                            </p>
                        )}

                        {selectedDayEvents.map((event) => (
                            <div
                                key={event.id}
                                className="rounded-lg border border-border/60 p-3 shadow-sm transition hover:border-primary/60"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`inline-flex h-2.5 w-2.5 rounded-full ${
                                                    EVENT_TYPE_COLORS[event.type] || "bg-gray-400"
                                                }`}
                                            ></span>
                                            <span className="text-sm font-semibold">{event.name}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {event.type}
                                            {event.cost > 0 && ` • R$ ${event.cost.toFixed(2)}`}
                                            {event.installments && event.installments > 1 && ` • ${event.installments}x`}
                                        </p>
                                        {event.location && (
                                            <p className="text-xs text-muted-foreground">
                                                Local: {event.location}
                                            </p>
                                        )}
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEditEvent(event)}
                                        className="gap-2"
                                    >
                                        <Pencil className="h-4 w-4"/>
                                        Editar
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between gap-2 pt-2">
                        <Button variant="outline" onClick={() => setIsDayEventsModalOpen(false)} className="flex-1">
                            Fechar
                        </Button>
                        <Button onClick={handleCreateEventClick} className="flex-1 gap-2">
                            <Plus className="h-4 w-4"/>
                            Novo Evento
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
