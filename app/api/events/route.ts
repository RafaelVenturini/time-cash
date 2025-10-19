import {NextRequest, NextResponse} from "next/server"
import db from "@/database/db"

export async function GET(req: NextRequest) {
    try {
        const params = req.nextUrl.searchParams
        const user_id = params.get('user')
        if (!user_id) return NextResponse.json({status: 500, error: "O ID de usuário nao foi enviado!"})

        const [data] = await db.execute(`
            SELECT event_id, date, type, place, money, name
            FROM events
            WHERE user_id = ?;
        `, [user_id])
        return NextResponse.json({status: 200, data: data})
    } catch (e) {
        console.log(e)
        return NextResponse.json({status: 500})
    }
}

export async function POST(req: NextRequest) {
    if (req.body === null) return NextResponse.json({status: 500, msg: "O Body é necessário"})
    const body = await req.json()
    const {date, name, type, location, cost, id, user} = body


    const values = [
        id || null,
        date || null,
        name || null,
        type || null,
        user || null,
        location || null,
        cost || null
    ]

    try {
        await db.execute(`
            INSERT INTO events(event_id, date, name, type, user_id, place, money)
            VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY
            UPDATE
                date =
            VALUES (date), type =
            VALUES (type), user_id =
            VALUES (user_id), place =
            VALUES (place), money =
            VALUES (money);
        `, values)
        return NextResponse.json({status: 200, data: values})
    } catch (e) {
        console.log(e)
        return NextResponse.json({status: 500, msg: "Erro"})
    }
}

export async function DELETE(req: NextRequest) {
    if (req.body === null) return NextResponse.json({status: 500, msg: "O Body é necessário"})
    const body = await req.json()
    const {id} = body

    try {
        await db.execute(`
            DELETE
            FROM event
            WHERE id = ?
        `, id)
        return NextResponse.json({status: 200})
    } catch (e) {
        console.log(e)
        return NextResponse.json({status: 500, msg: "Erro"})
    }
}