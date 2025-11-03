import db from "mysql2/promise"

const connection = db.createPool({
    host: "localhost",
    user: 'root',
    password: "123456",
    port: 3306,
    database: "time_cash"
})

export interface Event{
    event_id: string;
    date: Date;
    type: string;
    user_id: number;
    place: string;
    money: number;
    name?: string;
    is_recurring?: boolean;
    recurrence_type?: string;
    recurrence_interval?: number;
    parent_event_id?: string;
    recurrence_end_date?: Date;
}

export interface User{
    user_id: number;
    email: string;
    password: string;
}

export default connection