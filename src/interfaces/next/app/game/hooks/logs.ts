import { useState } from "react"
import { Log, TipoLog } from "../models/Log"
import { produce } from "immer"

export function useLogs(): [
    Log[],
    (tipo: TipoLog, mensagem: string) => void,
    () => void,
] {
    const [logs, setLogs] = useState<Log[]>([])
    function addLog(tipo: TipoLog, mensagem: string) {
        setLogs(
            produce((draft) => {
                draft.unshift({
                    id: crypto.randomUUID(),
                    tipo: tipo,
                    timestamp: new Date(),
                    mensagem: mensagem,
                })
            }),
        )
    }
    function clearLogs() {
        setLogs([])
    }
    return [logs, addLog, clearLogs]
}
