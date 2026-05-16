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
import { Golpe } from "@/src/domain/entities/Golpe"
import { Partida } from "../models/Partida"

const labelsArmaduras: Record<TipoArmadura, string> = {
    elmo: "Elmo",
    peitoral: "Peitoral",
    calcas: "Calças",
    botas: "Botas",
}

type AtaquesSelectProps = {
    nivel: number
    tipoPersonagem: TipoPersonagem
    golpe: Golpe | null
    onSelected: (golpe: Golpe | null) => void
}

const labelsGolpes: Record<TipoPersonagem, Record<Golpe, string>> = {
    curandeiro: {
        lvl1: "Clarão de luz",
        lvl2: "Névoa lacrimejante",
        lvl3: "Raio de fogo",
        lvl4: "Penitência",
        lvl5: "Choque sagrado",
        lvl6: "Cura reversa",
    },
    gladiador: {
        lvl1: "Soco paralisante",
        lvl2: "Picada de abelha",
        lvl3: "Avalanche manual",
        lvl4: "Golpe cauterizador",
        lvl5: "Murro da aflição",
        lvl6: "Apunhalada mortal",
    },
    mago: {
        lvl1: "Raio de energia",
        lvl2: "Espinhos mágicos",
        lvl3: "Rajada de fogo",
        lvl4: "Trovão incandescente",
        lvl5: "Explosão mística",
        lvl6: "Sopro do dragão",
    },
}

const enumGolpes = ["lvl1", "lvl2", "lvl3", "lvl4", "lvl5", "lvl6"] as const

function AtaquesSelect(props: AtaquesSelectProps) {
    const tier = Math.min(
        Math.max(0, 31 - Math.clz32(props.nivel)),
        enumGolpes.length - 1,
    )
    const golpesDisponiveis: (Golpe | null)[] = [
        null,
        ...enumGolpes.slice(0, tier),
    ]
    return (
        <Select
            value={props.golpe == null ? "_" : props.golpe}
            onValueChange={(golpe) => {
                props.onSelected(golpe == "_" ? null : (golpe as Golpe))
            }}
        >
            <SelectTrigger className="h-12 w-full border-slate-700 bg-slate-950">
                <SelectValue placeholder="Selecione um ataque" />
            </SelectTrigger>
            <SelectContent>
                {golpesDisponiveis.map((golpe) => {
                    const label =
                        golpe == null
                            ? "Ataque padrão"
                            : labelsGolpes[props.tipoPersonagem][golpe]
                    return (
                        <SelectItem key={label} value={golpe ?? "_"}>
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
    golpe: Golpe | null
    potions: Record<"forca" | "sagacidade", number | undefined>

    onUpdateGolpe: (golpe: Golpe | null) => void
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
                    golpe={props.golpe}
                    onSelected={props.onUpdateGolpe}
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
                        {(["forca", "sagacidade"] as const).map((key) => {
                            const labels: Record<
                                "forca" | "sagacidade",
                                string
                            > = {
                                forca: "Força",
                                sagacidade: "Sagacidade",
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
