import db from "mysql2/promise"

// ============================================
// CONFIGURAÇÃO DO BANCO DE DADOS
// ============================================
// IMPORTANTE: Ajuste estas credenciais para as do seu MySQL
//
// Para descobrir sua senha do MySQL:
// 1. Abra o MySQL Workbench
// 2. Tente conectar com a conexão "Local instance MySQL83"
// 3. Se pedir senha, essa é a senha correta
// 4. Se conectar sem pedir senha, deixe password: ""
//
// Opções comuns:
// - password: "" (sem senha - comum em XAMPP/WAMP)
// - password: "123" (se essa for sua senha)
// - password: "root" (senha padrão comum)
// - password: "sua_senha_aqui" (sua senha personalizada)
// ============================================

// Garantir que o pool seja um singleton (evitar múltiplas instâncias em hot reload)
let connection: db.Pool

if (!(global as any).mysqlPool) {
    (global as any).mysqlPool = db.createPool({
        host: "localhost",
        user: 'root',
        password: "123456",  // ⚠️ ALTERE AQUI: Coloque sua senha do MySQL ou deixe "" se não tiver senha
        port: 3306,
        database: "time_cash",
        // Configurações do pool para evitar "Too many connections"
        waitForConnections: true,
        connectionLimit: 5, // Reduzido para evitar muitas conexões
        queueLimit: 0,
        // Timeouts para liberar conexões ociosas
        idleTimeout: 60000, // 60 segundos
        enableKeepAlive: true,
        keepAliveInitialDelay: 0
    })
}

connection = (global as any).mysqlPool

// Testar conexão ao inicializar (apenas em desenvolvimento)
if (process.env.NODE_ENV !== 'production') {
    connection.getConnection()
        .then((conn) => {
            console.log('✅ Conexão com MySQL estabelecida com sucesso!')
            console.log(`   Usuário: root`)
            console.log(`   Banco: time_cash`)
            conn.release()
        })
        .catch((err) => {
            console.error('\n❌ ERRO AO CONECTAR AO MYSQL:')
            console.error(`   Código: ${err.code}`)
            console.error(`   Mensagem: ${err.message}\n`)
            
            if (err.code === 'ER_ACCESS_DENIED_ERROR') {
                console.error('💡 SOLUÇÃO:')
                console.error('   1. Abra o MySQL Workbench')
                console.error('   2. Tente conectar na conexão "Local instance MySQL83"')
                console.error('   3. Veja qual senha funciona (ou se não pede senha)')
                console.error('   4. Atualize a senha no arquivo database/db.ts na linha 33')
                console.error('   5. Se não pedir senha, deixe: password: ""')
                console.error('   6. Se pedir senha, coloque: password: "sua_senha_aqui"\n')
            } else if (err.code === 'ER_BAD_DB_ERROR') {
                console.error('💡 SOLUÇÃO:')
                console.error('   O banco "time_cash" não existe.')
                console.error('   Execute no MySQL: CREATE DATABASE time_cash;\n')
            } else if (err.code === 'ECONNREFUSED') {
                console.error('💡 SOLUÇÃO:')
                console.error('   O MySQL não está rodando.')
                console.error('   Inicie o serviço MySQL no Windows.\n')
            }
        })
}

export interface Event {
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

export interface User {
    user_id: number;
    email: string;
    password: string;
}

export default connection