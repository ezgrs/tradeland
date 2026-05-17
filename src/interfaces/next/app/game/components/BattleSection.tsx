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
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
    Select,
} from "../../../components/ui/select"
import { Jogador } from "@/src/domain/entities/Jogador"
import { Golpe } from "@/src/domain/entities/Golpe"
import { Partida } from "../models/Partida"
import { Inimigo, TipoInimigo } from "@/src/domain/entities/Inimigo"
import { Classe } from "@/src/domain/entities/Classe"

const labelsArmaduras: Record<TipoArmadura, string> = {
    elmo: "Elmo",
    peitoral: "Peitoral",
    calcas: "Calças",
    botas: "Botas",
}

type AtaquesSelectProps = {
    nivel: number
    classe: Classe
    golpe: Golpe | null
    onSelected: ((golpe: Golpe | null) => void) | null
}

const enumGolpes = ["lvl1", "lvl2", "lvl3", "lvl4", "lvl5", "lvl6"] as const

function AtaquesSelect(props: AtaquesSelectProps) {
    const { onSelected } = props
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
            onValueChange={
                onSelected == null
                    ? undefined
                    : (golpe) => {
                          onSelected(golpe == "_" ? null : (golpe as Golpe))
                      }
            }
            disabled={onSelected != null}
        >
            <SelectTrigger className="h-12 w-full border-slate-700 bg-slate-950">
                <SelectValue placeholder="Selecione um ataque" />
            </SelectTrigger>
            <SelectContent>
                {golpesDisponiveis.map((golpe) => {
                    const label =
                        golpe == null
                            ? "Ataque padrão"
                            : props.classe.nomeiaGolpe(golpe)
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
    inimigo: Inimigo | null
    golpe: Golpe | null
    potions: Record<"forca" | "sagacidade", number | undefined>

    onUpdateGolpe: (golpe: Golpe | null) => void
}

const labelsInimigos: Record<TipoInimigo, string> = {
    dragao: "Dragão",
    trasgo: "Trasgo",
    ogro: "Ogro",
    gigante: "Gigante",
    bruxa: "Bruxa",
    vampiro: "Vampiro",
}

export function BattleSection(props: Props) {
    const { jogador, partida, inimigo } = props
    return (
        <Card className="border-slate-800 bg-slate-900">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800 px-6 py-1">
                <CardTitle className="text-sm font-medium tracking-wider text-slate-400 uppercase">
                    {props.title}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
                {inimigo != null && (
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold uppercase">
                            <span>{labelsInimigos[inimigo.tipo]}</span>
                            <span>
                                {inimigo.hp}/{inimigo.maxHp}
                            </span>
                        </div>
                        <Progress
                            value={(inimigo.hp / inimigo.maxHp) * 100}
                            className="h-3 bg-slate-800"
                        />
                    </div>
                )}
                <AtaquesSelect
                    nivel={jogador.nivel}
                    classe={partida.classePersonagem}
                    golpe={props.golpe}
                    onSelected={inimigo == null ? null : props.onUpdateGolpe}
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
