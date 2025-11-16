"use client"

import {useEffect, useState, useCallback} from "react"
import {Button} from "@/components/ui/button"
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Switch} from "@/components/ui/switch"
import {Calendar, ChevronLeft, ChevronRight, DollarSign, MapPin, Pencil, Plus} from "lucide-react"
import {toast} from "sonner"
import {useLogin} from "@/contexts/login-context"
import {DbEvent, Event} from "@/utils/interface"
import {SideNav} from "@/components/side-nav";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Divider} from "@/components/divider";

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
    Lazer: "bg-slate-500",
    Compra: "bg-indigo-500",
    Outro: "bg-gray-500",
    Parcelamento: "bg-red-500",
    Assinatura: "bg-red-500",
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

    const loadEvents = useCallback(() => {
        if (!user) return
        
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

                    let cost = event.money ? Number.parseFloat(event.money) : 0
                    // Para compras, garantir que o custo seja negativo (perda)
                    // Se o valor estiver positivo, converter para negativo
                    if (event.type === "Compra" && cost > 0) {
                        cost = -cost
                    }

                    return {
                        id: event.event_id,
                        date: formattedDate,
                        name: event.name,
                        type: event.type,
                        location: event.place,
                        cost,
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
    }, [user])

    useEffect(() => {
        loadEvents()
    }, [loadEvents])

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

                // Para compras, o custo deve ser negativo (perda)
                const finalCost = type === "Compra" ? -Number(installmentCost.toFixed(2)) : Number(installmentCost.toFixed(2))

                return {
                    id: installmentId,
                    date: installmentDate,
                    name: `${name} (${index + 1}/${installmentsValue})`,
                    type,
                    location,
                    cost: finalCost,
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
                    .then((response) => {
                        console.log(response)
                        // Recarregar eventos após criar todas as parcelas
                        if (eventData.id === installmentEvents[installmentEvents.length - 1].id) {
                            loadEvents()
                        }
                    })
                    .catch((error) => console.log(error))
            })

            handleModalChange(false)
            return
        }

        const adjustedCost =
            installmentsValue && installmentsValue > 0
                ? Math.round((totalCost / installmentsValue) * 100) / 100
                : totalCost

        // Para compras, o custo deve ser negativo (perda)
        const finalCost = type === "Compra" ? -Number(adjustedCost.toFixed(2)) : Number(adjustedCost.toFixed(2))

        const updatedEvent: Event = {
            id,
            date,
            name,
            type,
            location,
            cost: finalCost,
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
            .then((r) => {
                console.log(r)
                // Recarregar eventos após salvar, especialmente importante para eventos recorrentes
                // que geram múltiplas instâncias no backend
                loadEvents()
                
                // Feedback visual para eventos recorrentes
                if (isRecurring && !isEditing) {
                    toast.success("Evento recorrente criado!", {
                        description: `O evento será repetido ${recurrenceTypeValue === 'daily' ? 'diariamente' : recurrenceTypeValue === 'weekly' ? 'semanalmente' : recurrenceTypeValue === 'monthly' ? 'mensalmente' : 'anualmente'}.`,
                    })
                } else if (isEditing) {
                    toast.success("Evento atualizado com sucesso!")
                } else {
                    toast.success("Evento criado com sucesso!")
                }
            })
            .catch((e) => {
                console.log(e)
                toast.error("Erro ao salvar evento", {
                    description: "Tente novamente mais tarde.",
                })
            })

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

    const getCurrentMonthEvents = () => {
        return events.filter((event) => {
            const eventDate = new Date(event.date)
            return eventDate.getMonth() === month && eventDate.getFullYear() === year
        })
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
            days.push(<div key={`empty-${i}`} className="h-[120px] w-full rounded-lg border border-dashed border-border/40 bg-muted/10"></div>)
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
                    className={`flex h-[120px] w-full cursor-pointer flex-col rounded-xl border-2 px-3 py-2.5 text-left text-xs transition-all duration-300 ${
                        isSelected
                            ? "border-primary bg-gradient-to-br from-purple-100 to-blue-100 shadow-lg scale-105"
                            : "border-transparent bg-white/60 hover:border-primary/50 hover:bg-gradient-to-br hover:from-purple-50 hover:to-blue-50 hover:shadow-md hover:scale-[1.02]"
                    } ${
                        isToday(day) ? "ring-2 ring-primary ring-offset-2 shadow-lg" : ""
                    }`}
                >
                    <div className="mb-1 flex items-center justify-between">
                        <span className={`text-sm font-semibold ${isSelected ? "text-primary" : "text-foreground"} transition-all duration-300`}>{day}</span>
                        {hasEvents && (
                            <span className="text-[9px] text-muted-foreground font-medium">
                                {dayEvents.length}
                            </span>
                        )}
                    </div>

                    {hasEvents && (
                        <div className="mt-1.5 flex flex-1 flex-col gap-1">
                            {dayEvents.slice(0, 3).map((event) => (
                                <div
                                    key={event.id}
                                    className="flex items-center gap-1.5 text-[10px] text-foreground/80"
                                >
                                    <span
                                        className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                                            EVENT_TYPE_COLORS[event.type] || "bg-gray-400"
                                        }`}
                                    ></span>
                                    <span className="truncate font-medium">{event.name}</span>
                                </div>
                            ))}
                            {dayEvents.length > 3 && (
                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 flex-shrink-0"></span>
                                    <span>+{dayEvents.length - 3} mais</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )
        }

        return days
    }

    return (
        <div className="min-h-screen bg-white p-4 main-content-wrapper">
            <div className="mx-auto space-y-6 main-page-wrapper animate-in">
                <SideNav/>

                <Card className="shadow-2xl border-0 hover-lift bg-white/80 backdrop-blur-sm animate-in min-h-[680px] max-w-[1400px] w-full flex flex-col" style={{animationDelay: '0.1s'}}>
                    <CardHeader className="space-y-4 pb-4 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-t-lg flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={goToPreviousMonth}
                                className="h-10 w-10 bg-white/80 hover:bg-primary hover:text-white transition-all duration-300 hover:scale-110 shadow-md"
                            >
                                <ChevronLeft className="h-5 w-5"/>
                            </Button>
                            <CardTitle className="text-3xl font-bold gradient-text">
                                {MONTHS[month]} {year}
                            </CardTitle>

                            <Button
                                variant="outline"
                                size="icon"
                                onClick={goToNextMonth}
                                className="h-10 w-10 bg-white/80 hover:bg-primary hover:text-white transition-all duration-300 hover:scale-110 shadow-md"
                            >
                                <ChevronRight className="h-5 w-5"/>
                            </Button>
                        </div>

                        <div className="flex justify-end">
                            <Button 
                                onClick={handleCreateEventClick} 
                                className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                            >
                                <Plus className="h-5 w-5"/>
                                Novo Evento
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="flex-1 flex flex-col overflow-x-auto">
                        {/* Cabeçalho dos dias da semana */}
                        <div className="mb-3 grid grid-cols-7 gap-3 min-w-[900px]">
                            {DAYS_OF_WEEK.map((day) => (
                                <div
                                    key={day}
                                    className="flex h-10 w-full items-center justify-center text-sm font-bold text-muted-foreground bg-gradient-to-br from-purple-100/50 to-blue-100/50 rounded-lg"
                                >
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Grade do calendário */}
                        <div className="grid grid-cols-7 gap-3 min-w-[900px]">{generateCalendarDays()}</div>

                        <div className="mt-6 space-y-4 border-t-2 border-border/50 pt-6">
                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-100 to-blue-100">
                                    <div className="h-3 w-3 rounded-full bg-primary shadow-md animate-pulse"></div>
                                    <span className="font-semibold text-foreground">Hoje</span>
                                </div>
                            </div>

                            {getCurrentMonthEventTypes().length > 0 && (
                                <div className="bg-gradient-to-br from-purple-50/50 to-blue-50/50 p-4 rounded-xl">
                                    <div className="mb-3 text-sm font-bold text-foreground">Tipos de Eventos:</div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {getCurrentMonthEventTypes().map((type) => (
                                            <div key={type} className="flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg bg-white/60 hover:bg-white/80 transition-all">
                                                <div className={`h-3 w-3 rounded-full shadow-sm ${EVENT_TYPE_COLORS[type]}`}></div>
                                                <span className="font-medium">{type}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-2xl border-0 hover-lift bg-white/80 backdrop-blur-sm animate-in min-h-[350px] max-w-[1400px] w-full flex flex-col" style={{animationDelay: '0.2s'}}>
                    <CardHeader className="pb-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-t-lg flex-shrink-0">
                        <CardTitle className="flex items-center gap-2 text-xl font-bold">
                            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-lg">
                                <DollarSign className="h-5 w-5 text-white"/>
                            </div>
                            Resumo do Mês
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="bank-card p-4 flex-1 flex flex-col">
                        <div className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                            R$ {getCurrentMonthTotal().toFixed(2)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">Total movimentado em {MONTHS[month]}</p>
                        <Divider/>
                        <div className="bank-count-wrapper gap-4 mt-3 flex-1">
                            <div className="bank-count gains flex-1">
                                <h3 className="text-lg font-bold mb-2">💰 Ganhos</h3>
                                <div className="space-y-1 h-[140px] overflow-y-auto">
                                    {(() => {
                                        const currentMonthEvents = getCurrentMonthEvents()
                                        const gains = currentMonthEvents.filter(e => e.cost > 0)
                                        return gains.length > 0 ? (
                                            gains.map((event) => (
                                                <p key={event.id} className="text-sm font-medium">+ R$ {event.cost.toFixed(2)}</p>
                                            ))
                                        ) : (
                                            <p className="text-sm opacity-70">Nenhum ganho este mês</p>
                                        )
                                    })()}
                                </div>
                            </div>
                            <div className="bank-count loses flex-1">
                                <h3 className="text-lg font-bold mb-2">💸 Perdas</h3>
                                <div className="space-y-1 h-[140px] overflow-y-auto">
                                    {(() => {
                                        const currentMonthEvents = getCurrentMonthEvents()
                                        const losses = currentMonthEvents.filter(e => e.cost < 0)
                                        return losses.length > 0 ? (
                                            losses.map((event) => (
                                                <p key={event.id} className="text-sm font-medium">- R$ {Math.abs(event.cost).toFixed(2)}</p>
                                            ))
                                        ) : (
                                            <p className="text-sm opacity-70">Nenhuma perda este mês</p>
                                        )
                                    })()}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isModalOpen} onOpenChange={handleModalChange}>
                <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-xl border-0 shadow-2xl">
                    <DialogHeader className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 p-4 rounded-t-lg -m-6 mb-4">
                        <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
                            <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg shadow-lg">
                                <Calendar className="h-5 w-5 text-white"/>
                            </div>
                            {editingEvent ? "Editar Evento" : "Criar Evento"}{" "}
                            {eventForm.date && <span className="text-lg text-muted-foreground">- {new Date(eventForm.date).toLocaleDateString("pt-BR")}</span>}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="eventName" className="text-sm font-semibold">Nome do Evento</Label>
                            <Input
                                id="eventName"
                                value={eventForm.name}
                                onChange={(e) => setEventForm({...eventForm, name: e.target.value})}
                                placeholder="Digite o nome do evento"
                                className="transition-all duration-300 focus:ring-2 focus:ring-primary focus:border-primary hover:border-primary/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="eventDate" className="text-sm font-semibold">Data</Label>
                            <Input
                                id="eventDate"
                                type="date"
                                value={eventForm.date}
                                onChange={(e) => setEventForm({...eventForm, date: e.target.value})}
                                className="transition-all duration-300 focus:ring-2 focus:ring-primary focus:border-primary hover:border-primary/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="eventType" className="text-sm font-semibold">Tipo do Evento</Label>
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
                                <SelectTrigger className="transition-all duration-300 focus:ring-2 focus:ring-primary hover:border-primary/50">
                                    <SelectValue placeholder="Selecione o tipo"/>
                                </SelectTrigger>
                                <SelectContent className="bg-white/95 backdrop-blur-xl">
                                    {EVENT_TYPES.map((type) => (
                                        <SelectItem key={type} value={type} className="hover:bg-primary/10 transition-colors">
                                            {type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="eventLocation" className="text-sm font-semibold">Local (opcional)</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
                                <Input
                                    id="eventLocation"
                                    value={eventForm.location}
                                    onChange={(e) => setEventForm({...eventForm, location: e.target.value})}
                                    placeholder="Digite o local do evento"
                                    className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-primary focus:border-primary hover:border-primary/50"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="eventCost" className="text-sm font-semibold">Gasto (R$)</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
                                <Input
                                    id="eventCost"
                                    type="number"
                                    step="0.01"
                                    value={eventForm.cost}
                                    onChange={(e) => setEventForm({...eventForm, cost: e.target.value})}
                                    placeholder="0,00"
                                    className="pl-10 transition-all duration-300 focus:ring-2 focus:ring-primary focus:border-primary hover:border-primary/50"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between rounded-xl border-2 border-border/60 bg-gradient-to-br from-purple-50/50 to-blue-50/50 p-4 hover:border-primary/50 transition-all duration-300">
                            <div>
                                <Label htmlFor="eventRecurring" className="text-sm font-bold flex items-center gap-2">
                                    🔄 Evento recorrente
                                </Label>
                                <p className="text-xs text-muted-foreground mt-1">
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
                                className="data-[state=checked]:bg-primary"
                            />
                        </div>

                        {eventForm.isRecurring && (
                            <div className="grid gap-4 md:grid-cols-2 bg-gradient-to-br from-purple-50/30 to-blue-50/30 p-4 rounded-xl border-2 border-primary/20 animate-in">
                                <div className="space-y-2">
                                    <Label htmlFor="recurrenceType" className="text-sm font-semibold">Frequência</Label>
                                    <Select
                                        value={eventForm.recurrenceType}
                                        onValueChange={(value) => setEventForm({...eventForm, recurrenceType: value})}
                                    >
                                        <SelectTrigger id="recurrenceType" className="transition-all duration-300 focus:ring-2 focus:ring-primary hover:border-primary/50">
                                            <SelectValue placeholder="Selecione a frequência"/>
                                        </SelectTrigger>
                                        <SelectContent className="bg-white/95 backdrop-blur-xl">
                                            {RECURRENCE_OPTIONS.map((option) => (
                                                <SelectItem key={option.value} value={option.value} className="hover:bg-primary/10 transition-colors">
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <Label htmlFor="recurrenceEndDate" className="text-sm font-semibold">Data final (opcional)</Label>
                                    <Input
                                        id="recurrenceEndDate"
                                        type="date"
                                        value={eventForm.recurrenceEndDate}
                                        onChange={(e) => setEventForm({...eventForm, recurrenceEndDate: e.target.value})}
                                        className="transition-all duration-300 focus:ring-2 focus:ring-primary focus:border-primary hover:border-primary/50"
                                    />
                                </div>
                            </div>
                        )}

                        {eventForm.type === "Compra" && (
                            <div className="space-y-2 bg-gradient-to-br from-purple-50/50 to-indigo-50/50 p-4 rounded-xl border-2 border-purple-200 animate-in">
                                <Label htmlFor="installments" className="text-sm font-semibold">💳 Parcelas</Label>
                                <Input
                                    id="installments"
                                    type="number"
                                    min={1}
                                    value={eventForm.installments}
                                    onChange={(e) => setEventForm({...eventForm, installments: e.target.value})}
                                    placeholder="Quantidade de parcelas"
                                    className="transition-all duration-300 focus:ring-2 focus:ring-primary focus:border-primary hover:border-primary/50"
                                />
                            </div>
                        )}

                        <div className="flex gap-3 pt-4">
                            <Button 
                                variant="outline" 
                                onClick={() => handleModalChange(false)} 
                                className="flex-1 border-2 hover:bg-red-50 hover:border-red-300 transition-all duration-300"
                            >
                                Cancelar
                            </Button>
                            <Button 
                                onClick={handleSaveEvent} 
                                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100" 
                                disabled={isSaveDisabled}
                            >
                                Salvar Evento
                            </Button>
                        </div>
                    </div>
                    </DialogContent>
                </Dialog>

            <Dialog open={isDayEventsModalOpen} onOpenChange={setIsDayEventsModalOpen}>
                <DialogContent className="sm:max-w-lg bg-white/95 backdrop-blur-xl border-0 shadow-2xl">
                    <DialogHeader className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 p-4 rounded-t-lg -m-6 mb-4">
                        <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
                            <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg shadow-lg">
                                <Calendar className="h-5 w-5 text-white"/>
                            </div>
                            Eventos em {selectedDayLabel ?? "dia selecionado"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
                        {selectedDayEvents.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                                Nenhum evento cadastrado para este dia.
                            </p>
                        )}

                        {selectedDayEvents.map((event, idx) => (
                            <div
                                key={event.id}
                                className="rounded-lg border border-border/40 p-3 transition-all duration-200 hover:border-border/60 hover:bg-muted/30"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="space-y-1.5 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`h-2 w-2 rounded-full flex-shrink-0 ${
                                                    EVENT_TYPE_COLORS[event.type] || "bg-gray-400"
                                                }`}
                                            ></span>
                                            <span className="text-sm font-semibold text-foreground">{event.name}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 items-center text-xs text-muted-foreground">
                                            <span>{event.type}</span>
                                            {event.cost !== 0 && (
                                                <span className={event.cost > 0 ? "text-emerald-600" : "text-red-600"}>
                                                    {event.cost > 0 ? "+" : ""}R$ {Math.abs(event.cost).toFixed(2)}
                                                </span>
                                            )}
                                            {event.installments && event.installments > 1 && (
                                                <span className="text-muted-foreground">
                                                    • {event.installments}x
                                                </span>
                                            )}
                                        </div>
                                        {event.location && (
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <MapPin className="h-3 w-3"/>
                                                {event.location}
                                            </p>
                                        )}
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEditEvent(event)}
                                        className="h-8 w-8 p-0 hover:bg-muted"
                                    >
                                        <Pencil className="h-3.5 w-3.5"/>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between gap-3 pt-2">
                        <Button 
                            variant="outline" 
                            onClick={() => setIsDayEventsModalOpen(false)} 
                            className="flex-1 border-2 hover:bg-gray-50 transition-all duration-300"
                        >
                            Fechar
                        </Button>
                        <Button 
                            onClick={handleCreateEventClick} 
                            className="flex-1 gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                        >
                            <Plus className="h-4 w-4"/>
                            Novo Evento
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
