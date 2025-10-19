import { NextResponse } from "next/server"
import db from "@/database/db"
import { useSearchParams } from "next/navigation"

export async function GET(){
    try{
        const params = useSearchParams()
        const user_id = params.get('user')
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