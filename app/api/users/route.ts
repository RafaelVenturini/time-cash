import {NextRequest, NextResponse} from "next/server";
import {RowDataPacket} from "mysql2";
import db from "@/database/db"

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams
    console.log(searchParams)
    const email = searchParams.get('email')
    const password = searchParams.get('password')

    if (!email || !password) {
        return NextResponse.json({status: 500, msg: "Forneça o email e a senha."})
    }

    const [rows] = await db.execute<RowDataPacket[]>(`
        SELECT password, user_id
        FROM users
        WHERE email = ?
    `, [email])
    if (rows && rows.length == 1) {
        const user = rows[0]
        if (user.password == password) {
            console.log('Logged')
            return NextResponse.json({status: 200, user: user.user_id})
        }
    } else {
        return NextResponse.json({status: 500, msg: "não foi encontrado cadastro com essas credenciais."})
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const {email, password} = body
        if (!email || !password) return NextResponse.json({msg: "email e senha sao obrigatórios"}, {status: 500})

        const user_id = await db.execute(`
            INSERT INTO users(email, password)
            VALUES (?, ?)
        `, [email, password])
        //@ts-expect-error insertId exists
        return NextResponse.json({status: 200, user_id: user_id[0].insertId})
    } catch (e) {
        console.log("Error: ", e)
        return NextResponse.json({status: 500, msg: "erro ao cadastrar."})
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const body = await req.json()
        const {user} = body
        await db.execute(`
            DELETE
            FROM events
            WHERE user_id = ?
        `, user)
        await db.execute(`
            DELETE
            FROM users
            WHERE user_id = ?
        `, user)
    } catch (e) {
        console.log(e)
        return NextResponse.json({status: 500, msg: "erro ao deletar."})
    }
    return NextResponse.json({status: 200})
}