import { IconTrash } from "@tabler/icons-react"
import { Button } from "../../../components/ui/button"
import { Card, CardHeader, CardTitle } from "../../../components/ui/card"
import { ScrollArea } from "../../../components/ui/scroll-area"
import { Log } from "../models/Log"
import { cn } from "../../../lib/utils"

type Props = {
    title: string
    logs: Log[]
    onClearLogs: () => void
}

export function LogsSection(props: Props) {
    return (
        <Card className="flex h-[300px] flex-col border-slate-800 bg-slate-900">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800 px-6 py-1">
                <CardTitle className="text-sm font-medium tracking-wider text-slate-400 uppercase">
                    {props.title}
                </CardTitle>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-500 hover:text-red-400"
                    onClick={(_) => props.onClearLogs()}
                >
                    <IconTrash className="h-4 w-4" />
                </Button>
            </CardHeader>
            <ScrollArea className="max-h-[200px] p-4 font-mono text-sm text-slate-400">
                {props.logs.map((log) => {
                    const timestampLabel =
                        `${String(log.timestamp.getHours()).padStart(2, "0")}:` +
                        `${String(log.timestamp.getMinutes()).padStart(2, "0")}:` +
                        `${String(log.timestamp.getSeconds()).padStart(2, "0")}`
                    const attrs = ["mb-1"]
                    switch (log.tipo) {
                        case "neutro":
                            attrs.push("text-slate-500")
                            break
                        case "negativo":
                            attrs.push("text-red-400")
                            break
                        case "positivo":
                            attrs.push("font-bold", "text-green-400")
                            break
                    }
                    return (
                        <p key={log.id} className={cn(...attrs)}>
                            [{timestampLabel}] {log.mensagem}
                        </p>
                    )
                })}
            </ScrollArea>
        </Card>
    )
}
