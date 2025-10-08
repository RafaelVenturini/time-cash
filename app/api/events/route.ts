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