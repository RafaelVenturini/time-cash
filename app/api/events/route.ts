import {NextRequest, NextResponse} from "next/server"
import db from "@/database/db"

// Função auxiliar para gerar datas recorrentes
function generateRecurringDates(
    startDate: string,
    recurrenceType: string,
    recurrenceInterval: number,
    endDate?: string
): string[] {
    const dates: string[] = []
    const start = new Date(startDate)
    const end = endDate ? new Date(endDate) : new Date(start.getFullYear() + 1, start.getMonth(), start.getDate())
    const current = new Date(start)

    dates.push(startDate)

    while (current <= end) {
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
                break
            case 'yearly':
                nextDate.setFullYear(nextDate.getFullYear() + recurrenceInterval)
                break
            default:
                return dates
        }

        if (nextDate <= end) {
            dates.push(nextDate.toISOString().split('T')[0])
            current.setTime(nextDate.getTime())
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
            SELECT event_id,
                   date,
                   type,
                   place,
                   money,
                   name,
                   installments,
                   is_recurring,
                   recurrence_type,
                   recurrence_interval,
                   parent_event_id,
                   recurrence_end_date
            FROM events
            WHERE user_id = ?;
        `, [user_id])
        return NextResponse.json({data: data}, {status: 200,})
    } catch (e) {
        console.log(e)
        return NextResponse.json({error: e}, {status: 500})
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
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY
                UPDATE date                = VALUES(date),
                       type                = VALUES(type),
                       user_id             = VALUES(user_id),
                       place               = VALUES(place),
                       money               = VALUES(money),
                       installments        = VALUES(installments),
                       is_recurring        = VALUES(is_recurring),
                       recurrence_type     = VALUES(recurrence_type),
                       recurrence_interval = VALUES(recurrence_interval),
                       recurrence_end_date = VALUES(recurrence_end_date);
        `, values)

        // Se for um evento recorrente, criar as instâncias repetidas
        if (is_recurring && recurrence_type && date) {
            const recurringDates = generateRecurringDates(
                date,
                recurrence_type,
                recurrence_interval,
                recurrence_end_date || undefined
            )

            // Criar eventos para cada data recorrente (pulando a primeira, que já foi criada)
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
                        ON DUPLICATE KEY UPDATE date         = VALUES(date),
                                                place        = VALUES(place),
                                                money        = VALUES(money),
                                                installments = VALUES(installments);
                    `, [
                        recurringEventId,
                        recurringDate,
                        name || null,
                        type || null,
                        user || null,
                        location || null,
                        cost || null,
                        null,
                        false, // Instâncias repetidas não são marcadas como recorrentes
                        null,
                        null,
                        id, // parent_event_id aponta para o evento original
                        null
                    ])
                } catch (recurringError) {
                    console.log(`Erro ao criar evento recorrente para data ${recurringDate}:`, recurringError)
                    // Continua criando os outros eventos mesmo se um falhar
                }
            }
        }

        return NextResponse.json({data: values})
    } catch (e) {
        console.log(e)
        return NextResponse.json({err: e}, {status: 500})
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
            return NextResponse.json({msg: "ID do evento e usuário são obrigatórios."}, {status: 400})
        }

        await db.execute(`
            UPDATE events
            SET date                = ?,
                name                = ?,
                type                = ?,
                user_id             = ?,
                place               = ?,
                money               = ?,
                installments        = ?,
                is_recurring        = ?,
                recurrence_type     = ?,
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
    } catch (e) {
        console.log(e)
        return NextResponse.json({err: e}, {status: 500})
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
    } catch (e) {
        console.log(e)
        return NextResponse.json({err: e}, {status: 500})
    }
}
