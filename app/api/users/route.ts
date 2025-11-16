import {NextRequest, NextResponse} from "next/server";
import {RowDataPacket} from "mysql2";
import db from "@/database/db"

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams
        const email = searchParams.get('email')
        const password = searchParams.get('password')

        if (!email || !password) {
            return NextResponse.json({msg: "Forneça o email e a senha."}, {status: 400})
        }

        const [rows] = await db.execute<RowDataPacket[]>(`
            SELECT password, user_id
            FROM users
            WHERE email = ?
        `, [email])

        if (!rows || rows.length === 0) {
            return NextResponse.json({msg: "Usuário não encontrado."}, {status: 404})
        }

        const user = rows[0]

        if (user.password !== password) {
            return NextResponse.json({msg: "Senha inválida."}, {status: 401})
        }

        return NextResponse.json({user: user.user_id}, {status: 200})
    } catch (error) {
        console.error("Erro ao buscar usuário", error)
        return NextResponse.json({msg: "Erro interno ao buscar usuário."}, {status: 500})
    }
}

export async function POST(req: NextRequest) {
    try {
        // Testar conexão primeiro
        try {
            await db.execute('SELECT 1')
            console.log('✅ Conexão com banco de dados OK')
        } catch (connError: any) {
            console.error('❌ Erro de conexão:', connError.code, connError.message)
            return NextResponse.json({
                status: 500,
                msg: `Erro de conexão: ${connError.message}. Verifique as credenciais em database/db.ts`
            })
        }

        const body = await req.json()
        const {email, password} = body
        
        // Validações
        if (!email || !password) {
            return NextResponse.json({msg: "Email e senha são obrigatórios"}, {status: 400})
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json({msg: "Email inválido"}, {status: 400})
        }

        // Validar tamanho da senha (limite do banco é 20 caracteres)
        if (password.length > 20) {
            return NextResponse.json({msg: "A senha deve ter no máximo 20 caracteres"}, {status: 400})
        }

        if (password.length < 3) {
            return NextResponse.json({msg: "A senha deve ter no mínimo 3 caracteres"}, {status: 400})
        }

        // Verificar se a tabela users existe, se não existir, criar
        try {
            await db.execute('SELECT 1 FROM users LIMIT 1')
        } catch (tableError: any) {
            if (tableError.code === 'ER_NO_SUCH_TABLE') {
                console.log('⚠️ Tabela users não existe. Criando...')
                try {
                    await db.execute(`
                        CREATE TABLE IF NOT EXISTS users (
                            user_id INT AUTO_INCREMENT PRIMARY KEY,
                            email VARCHAR(225),
                            password VARCHAR(20)
                        )
                    `)
                    console.log('✅ Tabela users criada com sucesso!')
                } catch (createError: any) {
                    console.error('❌ Erro ao criar tabela users:', createError.message)
                    return NextResponse.json({
                        status: 500,
                        msg: `Erro ao criar tabela: ${createError.message}. Execute o script database/creation-script.sql manualmente.`
                    })
                }
            } else {
                throw tableError
            }
        }

        // Verificar se o email já existe
        try {
            const [existingUsers] = await db.execute<RowDataPacket[]>(`
                SELECT user_id FROM users WHERE email = ?
            `, [email])

            if (Array.isArray(existingUsers) && existingUsers.length > 0) {
                return NextResponse.json({msg: "Este email já está cadastrado"}, {status: 409})
            }
        } catch (checkError: any) {
            console.warn("Erro ao verificar email existente:", checkError.message)
        }

        // Inserir novo usuário
        console.log("Tentando inserir usuário:", { email, passwordLength: password.length })
        
        const result = await db.execute(`
            INSERT INTO users(email, password)
            VALUES (?, ?)
        `, [email, password])

        console.log("Resultado do INSERT:", result)
        console.log("Tipo do resultado:", typeof result, Array.isArray(result))
        
        // O resultado do mysql2/promise.execute retorna [ResultSetHeader, FieldPacket[]]
        // O insertId está em result[0].insertId
        const resultHeader = result[0] as any
        const insertId = resultHeader?.insertId

        console.log("ResultHeader:", resultHeader)
        console.log("InsertId encontrado:", insertId)

        if (!insertId) {
            console.error("InsertId não encontrado no resultado. Estrutura completa:", JSON.stringify(result, null, 2))
            return NextResponse.json({msg: "Erro ao criar usuário. Não foi possível obter o ID do usuário criado."}, {status: 500})
        }

        console.log("✅ Usuário criado com sucesso, ID:", insertId)
        return NextResponse.json({status: 200, user_id: insertId, msg: "Conta criada com sucesso!"})
    } catch (e: any) {
        console.error("Erro ao cadastrar usuário:", e)
        
        // Mensagens de erro mais específicas
        if (e.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({msg: "Este email já está cadastrado"}, {status: 409})
        }
        
        if (e.code === 'ER_DATA_TOO_LONG') {
            return NextResponse.json({msg: "Email ou senha muito longos"}, {status: 400})
        }

        // Erro de acesso ao banco de dados
        if (e.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error("❌ Erro de acesso negado:", e.message)
            console.error("💡 Verifique as credenciais no arquivo database/db.ts")
            return NextResponse.json({
                status: 500,
                msg: "Erro de acesso ao banco de dados. Verifique as credenciais no arquivo database/db.ts (usuário e senha do MySQL)."
            })
        }

        if (e.code === 'ECONNREFUSED') {
            console.error("❌ Erro de conexão recusada:", e.message)
            return NextResponse.json({
                status: 500,
                msg: "Não foi possível conectar ao MySQL. Verifique se o MySQL está rodando."
            })
        }

        if (e.code === 'ER_BAD_DB_ERROR') {
            console.error("❌ Banco de dados não existe:", e.message)
            return NextResponse.json({
                status: 500,
                msg: "O banco de dados 'time_cash' não existe. Execute o script database/creation-script.sql no MySQL."
            })
        }

        console.error("❌ Erro detalhado:", e)
        return NextResponse.json({
            status: 500, 
            msg: e.message || "Erro ao cadastrar. Verifique os logs do servidor para mais detalhes."
        })
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