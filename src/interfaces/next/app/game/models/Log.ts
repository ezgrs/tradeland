export type TipoLog = "positivo" | "negativo" | "neutro" | "inesperado"

export type Log = {
    id: string
    tipo: TipoLog
    timestamp: Date
    mensagem: string
}
