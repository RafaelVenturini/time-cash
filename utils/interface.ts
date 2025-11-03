export interface Event {
    id: string
    date: string
    name: string
    type: string
    location?: string
    cost: number
    isRecurring?: boolean
    recurrenceType?: 'monthly' | 'weekly' | 'yearly' | 'daily'
    recurrenceInterval?: number
    recurrenceEndDate?: string
    parentEventId?: string
}

export interface DbEvent {
    event_id: string
    date: string
    type: string
    place: string
    money: string
    name: string
    is_recurring?: boolean
    recurrence_type?: string
    recurrence_interval?: number
    parent_event_id?: string
    recurrence_end_date?: string
}