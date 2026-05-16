import { TipoArmadura } from "@/src/domain/entities/Armadura"
import { IconFoldDown, IconFoldUp } from "@tabler/icons-react"
import { Button } from "../../../components/ui/button"
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "../../../components/ui/card"
import { cn } from "../../../lib/utils"
import { Progress } from "../../../components/ui/progress"
import {
    TipoPersonagem,
    TipoGolpe,
    comportamentosPersonagens,
} from "@/src/domain/entities/Personagem"
import {
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
    Select,
} from "../../../components/ui/select"
import { Jogador } from "@/src/domain/entities/Jogador"
import { Partida } from "../models/Partida"

const labelsArmaduras: Record<TipoArmadura, string> = {
    elmo: "Elmo",
    peitoral: "Peitoral",
    calcas: "Calças",
    botas: "Botas",
}

const labelsAtaques: Record<TipoGolpe<TipoPersonagem>, string> = {
    claraoLuz: "Clarão de luz",
    nevoaLacrimejante: "Névoa lacrimejante",
    raioFogo: "Raio de fogo",
    penitencia: "Penitência",
    choqueSagrado: "Choque sagrado",
    curaReversa: "Cura reversa",
    socoParalisante: "Soco paralisante",
    picadaAbelha: "Picada de abelha",
    avalancheManual: "Avalanche manual",
    golpeCauterizador: "Golpe cauterizador",
    murroAflicao: "Murro da aflição",
    apunhaladaMortal: "Apunhalada mortal",
    raioEnergia: "Raio de energia",
    rajadaFogo: "Rajada de fogo",
    espinhosMagicos: "Espinhos mágicos",
    trovaoIncandescente: "Trovão incandescente",
    explosaoMistica: "Explosão mística",
    soproDragao: "Sopro do dragão",
}

type AtaquesSelectProps = {
    nivel: number
    tipoPersonagem: TipoPersonagem
    idx: number | null
    onSelected: (idx: number | null) => void
}

function AtaquesSelect(props: AtaquesSelectProps) {
    const tier = 31 - Math.clz32(props.nivel)

    const golpes = comportamentosPersonagens[props.tipoPersonagem].listaGolpes()
    const golpesDisponiveis = Array.from(
        { length: Math.min(tier, golpes.length) },
        (_, i) => golpes[i],
    )
    const labels = [
        "Sem ataque",
        ...golpesDisponiveis.map((golpe) => labelsAtaques[golpe]),
    ]
    const labelIdx = props.idx == null ? 0 : props.idx + 1
    return (
        <Select
            value={labelIdx.toString()}
            onValueChange={(e) => {
                const labelIdx = parseInt(e)
                props.onSelected(labelIdx === 0 ? null : labelIdx - 1)
            }}
        >
            <SelectTrigger className="h-12 w-full border-slate-700 bg-slate-950">
                <SelectValue placeholder="Selecione um ataque" />
            </SelectTrigger>
            <SelectContent>
                {labels.map((label, idx) => {
                    return (
                        <SelectItem key={label} value={`${idx}`}>
                            {label}
                        </SelectItem>
                    )
                })}
            </SelectContent>
        </Select>
    )
}

type Props = {
    title: string

    jogador: Jogador
    partida: Partida
    strikeIndex: number | null
    potions: Record<"forca" | "inteligencia", number | undefined>

    onUpdateStrike: (idx: number | null) => void
}

export function BattleSection(props: Props) {
    const { jogador, partida } = props
    return (
        <Card className="border-slate-800 bg-slate-900">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800 px-6 py-1">
                <CardTitle className="text-sm font-medium tracking-wider text-slate-400 uppercase">
                    {props.title}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
                <AtaquesSelect
                    nivel={jogador.nivel}
                    tipoPersonagem={partida.tipoPersonagem}
                    idx={props.strikeIndex}
                    onSelected={props.onUpdateStrike}
                />
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <div className="space-y-3">
                        {Object.entries(labelsArmaduras).map(
                            ([tipoArmadura, label]) => {
                                const stats =
                                    jogador.resistencias[
                                        tipoArmadura as TipoArmadura
                                    ]
                                return (
                                    <div
                                        key={tipoArmadura}
                                        className="flex gap-x-4"
                                    >
                                        <div className="flex-1 space-y-1">
                                            <div
                                                className={cn(
                                                    "flex",
                                                    "justify-between",
                                                    "text-[10px]",
                                                    stats?.montada === true
                                                        ? "text-white-500"
                                                        : "text-slate-500",
                                                    "uppercase",
                                                )}
                                            >
                                                <span>{label}</span>
                                                {stats != null && (
                                                    <span>{stats.hp}%</span>
                                                )}
                                            </div>
                                            <Progress
                                                value={stats?.hp}
                                                className={cn(
                                                    "h-1.5",
                                                    stats?.montada
                                                        ? null
                                                        : "[&>div]:bg-gray-500",
                                                )}
                                            />
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={cn(
                                                "h-7",
                                                "border-slate-700",
                                                "bg-slate-950",
                                                "px-2",
                                                "text-[10px]",
                                                "uppercase",
                                                "hover:bg-blue-950",
                                                "hover:text-blue-400",
                                                stats == null
                                                    ? "invisible"
                                                    : null,
                                            )}
                                        >
                                            {stats?.montada ? (
                                                <IconFoldDown className="h-4 w-4" />
                                            ) : (
                                                <IconFoldUp className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                )
                            },
                        )}
                    </div>
                    <div className="space-y-3">
                        {(["forca", "inteligencia"] as const).map((key) => {
                            const labels: Record<
                                "forca" | "inteligencia",
                                string
                            > = {
                                forca: "Força",
                                inteligencia: "Sagacidade",
                            }
                            const tempo = props.potions[key]
                            if (tempo == null) return
                            return (
                                <div key={key} className="space-y-1">
                                    <div className="flex justify-between text-[10px] text-blue-400 uppercase">
                                        <span>{labels[key]}</span>
                                        <span>{tempo} seg</span>
                                    </div>
                                    <Progress
                                        value={(tempo / 60) * 100}
                                        className="h-2 bg-slate-800"
                                    />
                                </div>
                            )
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
