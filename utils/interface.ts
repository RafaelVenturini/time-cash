export interface Event {
    id: string
    date: string
    name: string
    type: string
    location?: string
    cost: number
}

export interface DbEvent {
    event_id: string
    date: string
    type: string
    place: string
    money: string
    name: string
}