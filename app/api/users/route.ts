import { NextRequest, NextResponse } from "next/server";
import { RowDataPacket } from "mysql2";
import db from "@/database/db"

export async function GET(req:NextRequest) {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')
    const password = searchParams.get('password')

    if(!email || !password) {return NextResponse.json({status:500, msg: "Forneça o email e a senha."})}

    const [rows] = await db.execute<RowDataPacket[]>(`
        SELECT password, user_id
        FROM users
        WHERE email = ?
        `, [email])
    if(rows && rows.length == 1){
        const user = rows[0]
        if (user.password == password){
            console.log('Logged')
            return NextResponse.json({status:200, user:user.user_id})
        }
    } else{
        return NextResponse.json({status:500, msg:"não foi encontrado cadastro com essas credenciais."})
    }
}

export async function POST(req: NextRequest){
    const body = await req.json()
    const {email,password} = body

    try{
        const user_id = await db.execute(`
            INSERT INTO users(email, password) VALUES (?,?)    
        `,[email, password])
        return NextResponse.json({status:200, user_id: user_id})
    }
    catch(e){
        return NextResponse.json({status:500, msg:"erro ao cadastrar."})
    }
}