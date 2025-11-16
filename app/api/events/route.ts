import {NextRequest, NextResponse} from "next/server"
import db from "@/database/db"

// Função auxiliar para tratar erros de conexão
function handleConnectionError(e: any) {
    if (e.code === 'ER_CON_COUNT_ERROR' || e.errno === 1040) {
        console.error('❌ ERRO: Muitas conexões ao banco de dados')
        console.error('   Aguarde alguns segundos e tente novamente')
        return NextResponse.json({
            error: "Muitas conexões ao banco de dados. Aguarde alguns segundos e tente novamente.",
            code: "TOO_MANY_CONNECTIONS"
        }, {status: 503}) // 503 Service Unavailable
    }
    return null
}

// Função auxiliar para gerar datas recorrentes
function generateRecurringDates(
    startDate: string,
    recurrenceType: string,
    recurrenceInterval: number,
    endDate?: string
): string[] {
    const dates: string[] = []
    const start = new Date(startDate + 'T00:00:00') // Garantir que está no início do dia
    const maxEvents = 365 // Limite máximo de eventos para evitar sobrecarga
    
    // Se não houver data final, gerar eventos para 1 ano no futuro ou até 365 eventos
    let end: Date
    if (endDate) {
        end = new Date(endDate + 'T23:59:59') // Fim do dia
    } else {
        // Limitar a 1 ano no futuro ou 365 eventos, o que vier primeiro
        end = new Date(start)
        end.setFullYear(end.getFullYear() + 1)
    }
    
    const current = new Date(start)
    dates.push(startDate) // Adicionar a data inicial

    let eventCount = 1
    while (current < end && eventCount < maxEvents) {
        const nextDate = new Date(current)

        switch (recurrenceType) {
            case 'daily':
                nextDate.setDate(nextDate.getDate() + recurrenceInterval)
                break
            case 'weekly':
                nextDate.setDate(nextDate.getDate() + (7 * recurrenceInterval))
                break
            case 'monthly':
                nextDate.setMonth(nextDate.getMonth() + recurrenceInterval)
                // Ajustar o dia se o mês não tiver esse dia (ex: 31 de janeiro -> 28/29 de fevereiro)
                if (nextDate.getDate() !== start.getDate()) {
                    nextDate.setDate(0) // Vai para o último dia do mês anterior
                }
                break
            case 'yearly':
                nextDate.setFullYear(nextDate.getFullYear() + recurrenceInterval)
                // Ajustar para 29 de fevereiro em anos bissextos
                if (start.getMonth() === 1 && start.getDate() === 29) {
                    const isLeapYear = (year: number) => (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
                    if (!isLeapYear(nextDate.getFullYear())) {
                        nextDate.setDate(28)
                    }
                }
                break
            default:
                return dates
        }

        if (nextDate <= end && eventCount < maxEvents) {
            const dateString = nextDate.toISOString().split('T')[0]
            dates.push(dateString)
            current.setTime(nextDate.getTime())
            eventCount++
        } else {
            break
        }
    }

    return dates
}

export async function GET(req: NextRequest) {
    try {
        const params = req.nextUrl.searchParams
        const user_id = params.get('user')
        if (!user_id) {
            console.log("Não tem id de user")
            return NextResponse.json({error: "O ID de usuário nao foi enviado!"}, {status: 500})
        }

        const [data] = await db.execute(`
            SELECT event_id, date, type, place, money, name,
                   installments,
                   is_recurring, recurrence_type, recurrence_interval, 
                   parent_event_id, recurrence_end_date
            FROM events
            WHERE user_id = ?;
        `, [user_id])
        return NextResponse.json({data: data}, {status: 200,})
    } catch (e: any) {
        console.log(e)
        const connectionError = handleConnectionError(e)
        if (connectionError) return connectionError
        return NextResponse.json({error: e.message || e}, {status: 500})
    }
}

export async function POST(req: NextRequest) {
    if (req.body === null) {
        console.log("Não tem body")
        return NextResponse.json({msg: "O Body é necessário"}, {status: 500})
    }
    const body = await req.json()
    const {
        date, name, type, location, cost, id, user,
        isRecurring, recurrenceType, recurrenceInterval, recurrenceEndDate,
        installments
    } = body

    const is_recurring = isRecurring === true || isRecurring === 'true'
    const recurrence_type = recurrenceType || null
    const recurrence_interval = recurrenceInterval || 1
    const recurrence_end_date = recurrenceEndDate || null
    const installments_count = installments || null

    const values = [
        id || null,
        date || null,
        name || null,
        type || null,
        user || null,
        location || null,
        cost || null,
        installments_count,
        is_recurring,
        recurrence_type,
        recurrence_interval,
        null, // parent_event_id (NULL para o evento original)
        recurrence_end_date
    ]

    try {
        // Inserir o evento original
        await db.execute(`
            INSERT INTO events(event_id, date, name, type, user_id, place, money,
                              installments,
                              is_recurring, recurrence_type, recurrence_interval,
                              parent_event_id, recurrence_end_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY
            UPDATE
                date = VALUES(date),
                type = VALUES(type),
                user_id = VALUES(user_id),
                place = VALUES(place),
                money = VALUES(money),
                installments = VALUES(installments),
                is_recurring = VALUES(is_recurring),
                recurrence_type = VALUES(recurrence_type),
                recurrence_interval = VALUES(recurrence_interval),
                recurrence_end_date = VALUES(recurrence_end_date);
        `, values)

        // Se for um evento recorrente, criar as instâncias repetidas
        if (is_recurring && recurrence_type && date) {
            console.log(`Criando eventos recorrentes: tipo=${recurrence_type}, intervalo=${recurrence_interval}, data_inicio=${date}, data_fim=${recurrence_end_date || 'sem fim'}`)
            
            const recurringDates = generateRecurringDates(
                date,
                recurrence_type,
                recurrence_interval,
                recurrence_end_date || undefined
            )

            console.log(`Geradas ${recurringDates.length} datas recorrentes:`, recurringDates.slice(0, 10), recurringDates.length > 10 ? '...' : '')

            // Criar eventos para cada data recorrente (pulando a primeira, que já foi criada)
            let createdCount = 0
            for (let i = 1; i < recurringDates.length; i++) {
                const recurringDate = recurringDates[i]
                const recurringEventId = `${id}_${i}`

                try {
                    await db.execute(`
                        INSERT INTO events(event_id, date, name, type, user_id, place, money,
                                          installments,
                                          is_recurring, recurrence_type, recurrence_interval,
                                          parent_event_id, recurrence_end_date)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ON DUPLICATE KEY UPDATE
                            date = VALUES(date),
                            place = VALUES(place),
                            money = VALUES(money),
                            installments = VALUES(installments);
                    `, [
                        recurringEventId,
                        recurringDate,
                        name || null,
                        type || null,
                        user || null,
                        location || null,
                        cost || null,
                        installments_count,
                        false, // Instâncias repetidas não são marcadas como recorrentes
                        null,
                        null,
                        id, // parent_event_id aponta para o evento original
                        null
                    ])
                    createdCount++
                } catch (recurringError: any) {
                    const connectionError = handleConnectionError(recurringError)
                    if (connectionError) {
                        console.error('Erro ao criar eventos recorrentes:', recurringError)
                        // Não retornar erro aqui, apenas logar, pois o evento principal já foi criado
                    }
                    console.error(`Erro ao criar evento recorrente para data ${recurringDate}:`, recurringError)
                    // Continua criando os outros eventos mesmo se um falhar
                }
            }
            
            console.log(`Criados ${createdCount} eventos recorrentes de ${recurringDates.length - 1} esperados`)
        }

        return NextResponse.json({status: 200, data: values})
    } catch (e: any) {
        console.log(e)
        const connectionError = handleConnectionError(e)
        if (connectionError) return connectionError
        return NextResponse.json({msg: "Erro", error: e.message || e}, {status: 500})
    }
}

export async function PUT(req: NextRequest) {
    if (req.body === null) return NextResponse.json({status: 500, msg: "O Body é necessário"})

    try {
        const body = await req.json()
        const {
            id,
            date,
            name,
            type,
            location,
            cost,
            user,
            isRecurring,
            recurrenceType,
            recurrenceInterval,
            recurrenceEndDate,
            installments,
        } = body

        if (!id || !user) {
            return NextResponse.json({status: 400, msg: "ID do evento e usuário são obrigatórios."})
        }

        await db.execute(`
            UPDATE events
            SET
                date = ?,
                name = ?,
                type = ?,
                user_id = ?,
                place = ?,
                money = ?,
                installments = ?,
                is_recurring = ?,
                recurrence_type = ?,
                recurrence_interval = ?,
                recurrence_end_date = ?
            WHERE event_id = ?
        `, [
            date || null,
            name || null,
            type || null,
            user || null,
            location || null,
            cost || null,
            installments ?? null,
            isRecurring ? 1 : 0,
            recurrenceType || null,
            recurrenceInterval || 1,
            recurrenceEndDate || null,
            id,
        ])

        return NextResponse.json({status: 200})
    } catch (e: any) {
        console.log(e)
        const connectionError = handleConnectionError(e)
        if (connectionError) return connectionError
        return NextResponse.json({status: 500, msg: "Erro ao atualizar evento", error: e.message || e})
    }
}

export async function DELETE(req: NextRequest) {
    if (req.body === null) return NextResponse.json({msg: "O Body é necessário"}, {status: 500})
    const body = await req.json()
    const {id} = body

    try {
        // Deletar o evento e suas instâncias recorrentes (CASCADE)
        // Se deletar o evento original, as instâncias serão deletadas automaticamente
        await db.execute(`
            DELETE
            FROM events
            WHERE event_id = ?
        `, id)
        return NextResponse.json({ok: true}, {status: 200})
    } catch (e: any) {
        console.log(e)
        const connectionError = handleConnectionError(e)
        if (connectionError) return connectionError
        return NextResponse.json({msg: e.message || e}, {status: 500})
    }
}
