import { NextRequest, NextResponse } from "next/server"
import db from "@/database/db"

export async function GET(req:NextRequest){
    try{
        const body = await req.json()
        const {user_id} = body
        if(!user_id) return NextResponse.json({status:500, error: "O ID de usuário nao foi enviado!"})

        const [data] = await db.execute(`
            SELECT event_id, date, type, place, money
            FROM EVENT 
            WHERE user_id = ?
        `, user_id)
        return NextResponse.json({status:200, data:data})
    }
    catch(e){
        return NextResponse.json({status:500})
    }
}

export async function POST(){

}

async function createEvent(data: any) {
    const { event_id, date, type, user_id, place, money } = data
    if (!event_id || !date || !type || !user_id) {
        throw new Error('Missing required fields (event_id, date, type, user_id)')
    }
    await db.execute(
        `INSERT INTO events (event_id, date, type, user_id, place, money) VALUES (?, ?, ?, ?, ?, ?)`,
        [event_id, date, type, user_id, place || null, money || 0]
    )
}

// helper: update event
async function updateEvent(eventId: string, data: any) {
    const { date, type, place, money } = data
    const fields: string[] = []
    const values: any[] = []
    if (date !== undefined) { fields.push('date = ?'); values.push(date) }
    if (type !== undefined) { fields.push('type = ?'); values.push(type) }
    if (place !== undefined) { fields.push('place = ?'); values.push(place) }
    if (money !== undefined) { fields.push('money = ?'); values.push(money) }
    if (fields.length === 0) return 0
    const sql = `UPDATE events SET ${fields.join(', ')} WHERE event_id = ?`
    values.push(eventId)
    const [res] = await db.execute(sql, values)
    return res
}

async function deleteEvent(eventId: string) {
    await db.execute(`DELETE FROM events WHERE event_id = ?`, [eventId])
}

export async function POST_FULL(req: NextRequest) {
    try {
        const body = await req.json()
        await createEvent(body)
        return NextResponse.json({ message: 'Event created (POST_FULL)' }, { status: 201 })
    } catch (e: any) {
        return NextResponse.json({ error: e?.message || 'Internal server error' }, { status: 500 })
    }
}

export async function PUT_FULL(req: NextRequest) {
    try {
        const url = new URL(req.url)
        const eventId = url.searchParams.get('event_id')
        if (!eventId) return NextResponse.json({ error: 'event_id query param required' }, { status: 400 })
        const body = await req.json()
        const result = await updateEvent(eventId, body)
        return NextResponse.json({ message: 'Event updated (PUT_FULL)', result }, { status: 200 })
    } catch (e: any) {
        return NextResponse.json({ error: e?.message || 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE_FULL(req: NextRequest) {
    try {
        const url = new URL(req.url)
        const eventId = url.searchParams.get('event_id')
        if (!eventId) return NextResponse.json({ error: 'event_id query param required' }, { status: 400 })
        await deleteEvent(eventId)
        return NextResponse.json({ message: 'Event deleted (DELETE_FULL)' }, { status: 200 })
    } catch (e: any) {
        return NextResponse.json({ error: e?.message || 'Internal server error' }, { status: 500 })
    }
}



