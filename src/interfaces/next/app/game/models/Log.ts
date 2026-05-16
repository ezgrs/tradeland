type TipoLog = "positivo" | "negativo" | "neutro" | "inesperado"

export type Log = {
    id: string
    tipo: TipoLog
    timestamp: Date
    mensagem: string
}

export function createLog(tipo: TipoLog, mensagem: string): Log {
    return {
        id: crypto.randomUUID(),
        tipo: tipo,
        timestamp: new Date(),
        mensagem: mensagem,
    }
}
