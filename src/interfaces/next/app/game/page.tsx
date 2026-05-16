"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { Jogador } from "@/src/domain/entities/Jogador"
import {
    DefaultJogadorController,
    DefaultJogadorListener,
    JogadorController,
    JogadorListener,
} from "@/src/domain/services/jogador"
import { LogsSection } from "./components/LogsSection"
import { State } from "./models/State"
import { createLog } from "./models/Log"
import { InventorySection } from "./components/InventorySection"
import { StatisticsSection } from "./components/StatisticsSection"
import { BattleSection } from "./components/BattleSection"
import { TipoInimigo } from "@/src/domain/entities/Inimigo"
import { Button } from "../../components/ui/button"
import { IconBuildingStore, IconBong } from "@tabler/icons-react"
import { RideButton } from "./components/RideButton"
import { TipoAlimento } from "@/src/domain/entities/Alimento"
import { produce } from "immer"
import { Partida } from "./models/Partida"
import { comportamentosPersonagens } from "@/src/domain/entities/Personagem"

type JogadorState = {
    controller: JogadorController<Jogador>
    listener: JogadorListener<Jogador>
}

export default function GameDashboard() {
    const router = useRouter()
    const [state, _setState] = useState<State | null>(null)

    function setState(action: (state: State) => State): void {
        _setState((state) => {
            if (state == null) return null
            return action(state)
        })
    }

    const jogadorRef = useRef<JogadorState>(
        (() => {
            const controller = new DefaultJogadorController()
            return {
                controller,
                listener: new DefaultJogadorListener(controller),
            }
        })(),
    )
    useEffect(() => {
        const stored = sessionStorage.getItem("userData")
        if (!stored) {
            router.replace("/")
            return
        }
        const userData = JSON.parse(stored)
        const partida: Partida = {
            nomePersonagem: userData["nome"],
            tipoPersonagem: userData["classe"],
            dificuldade: userData["dificuldade"],
        }
        const jogador: Jogador = {
            hp: 100,
            maxHp: 100,
            forca: 10,
            inteligencia: 0,
            nivel: 1,
            fome: 0,
            xp: 0,
            resistencias: {},
        }
        _setState({
            partida: partida,
            jogador:
                comportamentosPersonagens[
                    partida.tipoPersonagem
                ].quandoEhCriado(jogador),
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
            setState((state) => ({
                ...state,
                jogador: jogadorRef.current.controller.alteraFome(
                    state.jogador,
                    5,
                ),
            }))
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
                        jogador={jogador}
                        carteira={carteira}
                    >
                        <RideButton
                            offLabel="Iniciar passeio"
                            onLabel="Voltar pra casa"
                            partida={partida}
                            jogador={jogador}
                            listener={jogadorRef.current.listener}
                            onFindMoney={(qtd) => {
                                setState((state) => ({
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
                                }))
                            }}
                            onFindDrink={(_) => {
                                setState((state) => ({
                                    ...state,
                                    logs: [
                                        createLog(
                                            "positivo",
                                            `Você encontrou uma bebida!`,
                                        ),
                                        ...state.logs,
                                    ],
                                }))
                            }}
                            onFindFood={(comida) => {
                                const labelsAlimentos: Record<
                                    TipoAlimento,
                                    string
                                > = {
                                    uva: "uma uva",
                                    maca: "uma maçã",
                                    banana: "uma banana",
                                    cenoura: "uma cenoura",
                                    ensopado: "um ensopado",
                                    frango: "um frango",
                                }
                                const tipoAlimento = comida.calculaTipo()
                                setState((state) => ({
                                    ...state,
                                    logs: [
                                        createLog(
                                            "positivo",
                                            `Você encontrou ${labelsAlimentos[comida.calculaTipo()]}!`,
                                        ),
                                        ...state.logs,
                                    ],
                                    mochila: {
                                        ...state.mochila,
                                        comidas: {
                                            ...state.mochila.comidas,
                                            [tipoAlimento]: [
                                                ...(state.mochila.comidas[
                                                    tipoAlimento
                                                ] ?? []),
                                                comida,
                                            ],
                                        },
                                    },
                                }))
                            }}
                            onFindEnemy={(tipoInimigo) => {
                                const labelsInimigos: Record<
                                    TipoInimigo,
                                    string
                                > = {
                                    dragao: "um dragão",
                                    trasgo: "um trasgo",
                                    ogro: "um ogro",
                                    gigante: "um gigante",
                                    bruxa: "uma bruxa",
                                    vampiro: "um vampiro",
                                }
                                setState((state) => ({
                                    ...state,
                                    logs: [
                                        createLog(
                                            "neutro",
                                            `Você encontrou ${labelsInimigos[tipoInimigo]}, prepare-se!`,
                                        ),
                                        ...state.logs,
                                    ],
                                }))
                            }}
                        />
                        <Button variant="secondary" className="gap-2">
                            <IconBuildingStore className="h-4 w-4" /> Visitar
                            comerciante
                        </Button>
                        <Button variant="secondary" className="gap-2">
                            <IconBong className="h-4 w-4" /> Visitar alquimista
                        </Button>
                    </StatisticsSection>
                    <LogsSection
                        title="Logs de Registro"
                        logs={state.logs}
                        onClearLogs={() =>
                            setState((state) => ({ ...state, logs: [] }))
                        }
                    />
                </div>

                <div className="space-y-6 lg:col-span-6">
                    <InventorySection
                        title="Inventário"
                        mochila={mochila}
                        onEat={(tipoAlimento) => {
                            setState(
                                produce((draft) => {
                                    const comidas =
                                        draft.mochila.comidas[tipoAlimento] ??
                                        []
                                    const comida = comidas.shift()
                                    if (comida == null) return

                                    switch (comida.calculaTempero()) {
                                        case "amargo":
                                            draft.logs.unshift(
                                                createLog(
                                                    "negativo",
                                                    "Alguém amargou isso, sua fome piorou!",
                                                ),
                                            )
                                            break
                                        case "doce":
                                            draft.logs.unshift(
                                                createLog(
                                                    "positivo",
                                                    "Alguém colocou algo gostoso nisso, sua fome melhorou!",
                                                ),
                                            )
                                            break
                                    }
                                    draft.jogador =
                                        jogadorRef.current.listener.come(
                                            jogador,
                                            comida,
                                        )
                                    if (comidas.length === 0) {
                                        delete draft.mochila.comidas[
                                            tipoAlimento
                                        ]
                                    } else {
                                        draft.mochila.comidas[tipoAlimento] =
                                            comidas
                                    }
                                }),
                            )
                        }}
                    />
                    <BattleSection
                        title="Batalha"
                        jogador={jogador}
                        partida={partida}
                        strikeIndex={state.idxGolpe}
                        onUpdateStrike={(idx) => {
                            setState((state) => ({ ...state, idxGolpe: idx }))
                        }}
                    />
                </div>
            </div>
        </main>
    )
}
