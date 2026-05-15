"use client"

import { Button } from "../../components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "../../components/ui/card"
import { Progress } from "../../components/ui/progress"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/ui/select"
import {
    IconSword,
    IconBrain,
    IconWallet,
    IconTrophy,
    IconBrandSafari,
    IconBuildingStore,
    IconFoldDown,
    IconFoldUp,
    IconBong,
    IconHome,
} from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { Jogador } from "@/src/domain/entities/Jogador"
import {
    AchadoPasseio,
    executaBatalha,
    executaPasseio,
    RodadaBatalha,
} from "@/src/domain/services/passeio"
import {
    DefaultJogadorController,
    DefaultJogadorListener,
    JogadorController,
    JogadorListener,
} from "@/src/domain/services/jogador"
import { TipoArmadura } from "@/src/domain/entities/Armadura"
import { cn } from "../../lib/utils"
import { TipoAlimento } from "@/src/domain/entities/Alimento"
import { Comida } from "@/src/domain/entities/Comida"
import { Espolio } from "@/src/domain/entities/Espolio"
import { TipoPocao } from "@/src/domain/entities/Pocao"
import { Bebida } from "@/src/domain/entities/Bebida"
import {
    comportamentosPersonagens,
    TipoGolpe,
    TipoPersonagem,
} from "@/src/domain/entities/Personagem"
import { Probabilidade } from "@/src/domain/entities/Probabilidade"
import { LogsSection } from "./components/LogsSection"
import { State } from "./models/State"
import { createLog } from "./models/Log"
import { InventorySection } from "./components/InventorySection"
import { StatisticsSection } from "./components/StatisticsSection"

type AtaquesSelectProps = {
    nivel: number
    tipoPersonagem: TipoPersonagem
    idx: number | null
    onSelected: (idx: number | null) => void
}

function AtaquesSelect(props: AtaquesSelectProps) {
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

type JogadorState = {
    controller: JogadorController<Jogador>
    listener: JogadorListener<Jogador>
}

export default function GameDashboard() {
    const router = useRouter()
    const [state, setState] = useState<State | null>(null)
    const jogadorRef = useRef<JogadorState>(
        (() => {
            const controller = new DefaultJogadorController()
            return {
                controller,
                listener: new DefaultJogadorListener(controller),
            }
        })(),
    )

    const labelsArmaduras: Record<TipoArmadura, string> = {
        elmo: "Elmo",
        peitoral: "Peitoral",
        calcas: "Calças",
        botas: "Botas",
    }

    useEffect(() => {
        const stored = sessionStorage.getItem("userData")
        if (!stored) {
            router.replace("/")
            return
        }
        const userData = JSON.parse(stored)
        setState({
            partida: {
                nomePersonagem: userData["nome"],
                tipoPersonagem: userData["classe"],
                dificuldade: userData["dificuldade"],
            },
            jogador: {
                hp: 100,
                maxHp: 100,
                forca: 10,
                inteligencia: 0,
                nivel: 4,
                fome: 0,
                xp: 0,
                resistencias: {},
            },
            carteira: {
                valor: 0,
            },
            mochila: {
                espolios: {},
                comidas: {},
                bebidas: {},
            },
            idxGolpe: null,
            logs: [],
        })
    }, [router])
    useEffect(() => {
        const id = setInterval(() => {
            setState((state) => {
                if (state == null) return null
                return {
                    ...state,
                    jogador: jogadorRef.current.controller.alteraFome(
                        state.jogador,
                        5,
                    ),
                }
            })
        }, 60_000)
        return () => clearInterval(id)
    }, [])
    if (!state) return null
    const { partida, jogador, carteira, mochila } = state
    return (
        <main className="min-h-screen w-full bg-slate-950 p-4 text-slate-50 md:p-8">
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="space-y-6 lg:col-span-6">
                    <StatisticsSection
                        title="Estatísticas"
                        partida={partida}
                        jogador={jogador}
                        carteira={carteira}
                        listener={jogadorRef.current.listener}
                        onFindMoney={(qtd) => {
                            setState((state) => {
                                if (state == null) return null
                                return {
                                    ...state,
                                    logs: [
                                        createLog(
                                            "positivo",
                                            `Você encontrou ${qtd} moedas!`,
                                        ),
                                        ...state.logs,
                                    ],
                                    carteira: {
                                        ...state.carteira,
                                        valor: state.carteira.valor + qtd,
                                    },
                                }
                            })
                        }}
                        onFindDrink={(_) => {
                            setState((state) => {
                                if (state == null) return null
                                return {
                                    ...state,
                                    logs: [
                                        createLog(
                                            "positivo",
                                            `Você encontrou uma bebida!`,
                                        ),
                                        ...state.logs,
                                    ],
                                }
                            })
                        }}
                        onFindFood={(_) => {
                            setState((state) => {
                                if (state == null) return null
                                return {
                                    ...state,
                                    logs: [
                                        createLog(
                                            "positivo",
                                            `Você encontrou uma comida!`,
                                        ),
                                        ...state.logs,
                                    ],
                                }
                            })
                        }}
                        onFindEnemy={(_) => {
                            setState((state) => {
                                if (state == null) return null
                                return {
                                    ...state,
                                    logs: [
                                        createLog(
                                            "neutro",
                                            `Você encontrou um inimigo, prepare-se!`,
                                        ),
                                        ...state.logs,
                                    ],
                                }
                            })
                        }}
                    />
                    <LogsSection
                        title="Logs de Registro"
                        logs={state.logs}
                        onClearLogs={() => {
                            setState((state) => {
                                if (state == null) return null
                                return { ...state, logs: [] }
                            })
                        }}
                    />
                </div>

                <div className="space-y-6 lg:col-span-6">
                    <InventorySection mochila={mochila} />
                    <Card className="border-slate-800 bg-slate-900">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800 px-6 py-1">
                            <CardTitle className="text-sm font-medium tracking-wider text-slate-400 uppercase">
                                Batalha
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-2">
                            <AtaquesSelect
                                nivel={jogador.nivel}
                                tipoPersonagem={partida.tipoPersonagem}
                                idx={state.idxGolpe}
                                onSelected={(idxGolpe) =>
                                    setState((state) => {
                                        if (state == null) return null
                                        return { ...state, idxGolpe: idxGolpe }
                                    })
                                }
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
                                                                stats?.montada ===
                                                                    true
                                                                    ? "text-white-500"
                                                                    : "text-slate-500",
                                                                "uppercase",
                                                            )}
                                                        >
                                                            <span>{label}</span>
                                                            {stats != null && (
                                                                <span>
                                                                    {stats.hp}%
                                                                </span>
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
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-[10px] text-blue-400 uppercase">
                                            <span>Sagacidade</span>
                                            <span>120s</span>
                                        </div>
                                        <Progress
                                            value={60}
                                            className="h-2 bg-slate-800"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-[10px] text-red-400 uppercase">
                                            <span>Força Bruta</span>
                                            <span>45s</span>
                                        </div>
                                        <Progress
                                            value={30}
                                            className="h-2 bg-slate-800"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    )
}
