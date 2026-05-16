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
import { TipoPocao } from "@/src/domain/entities/Pocao"

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
            setState(
                produce((draft) => {
                    draft.jogador = jogadorRef.current.controller.alteraFome(
                        draft.jogador,
                        5,
                    )
                }),
            )
        }, 60_000)
        return () => clearInterval(id)
    }, [])

    type Efeito = {
        forca: number
        inteligencia: number
        tempo: number
    }
    const [efeitos, setEfeitos] = useState<
        Map<"forca" | "inteligencia", Efeito>
    >(new Map())
    const hasEfeitos = efeitos.size > 0
    useEffect(() => {
        if (!hasEfeitos) return
        const id = setInterval(() => {
            setEfeitos((efeitos) => {
                const updatedEfeitos = new Map(efeitos)
                for (const [tipoEfeito, efeito] of efeitos.entries()) {
                    const novoTempo = efeito.tempo - 1
                    if (novoTempo <= 0) {
                        updatedEfeitos.delete(tipoEfeito)
                    } else {
                        updatedEfeitos.set(tipoEfeito, {
                            ...efeito,
                            tempo: novoTempo,
                        })
                    }
                }
                return updatedEfeitos
            })
        }, 1_000)
        return () => clearInterval(id)
    }, [hasEfeitos])

    if (!state) return null
    const { partida, carteira, mochila } = state
    const jogador = produce(state.jogador, (draft) => {
        // Inclui efeitos ativos
        for (const [_, efeito] of efeitos.entries()) {
            draft.forca += efeito.forca
            draft.inteligencia += efeito.inteligencia
        }
    })
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
                                setState(
                                    produce((draft) => {
                                        draft.logs.unshift(
                                            createLog(
                                                "positivo",
                                                `Você encontrou ${qtd} moedas!`,
                                            ),
                                        )
                                        draft.carteira.valor += qtd
                                    }),
                                )
                            }}
                            onFindDrink={(bebida) => {
                                const labelsPocoes: Record<TipoPocao, string> =
                                    {
                                        vida: "vida",
                                        inteligencia: "sagacidade",
                                        forca: "força",
                                    }
                                const tipoPocao = bebida.calculaTipo()
                                setState(
                                    produce((draft) => {
                                        draft.logs.unshift(
                                            createLog(
                                                "positivo",
                                                `Você encontrou uma poção de ${labelsPocoes[tipoPocao]}!`,
                                            ),
                                        )
                                        const bebidas = (draft.mochila.bebidas[
                                            tipoPocao
                                        ] ??= [])
                                        bebidas.push(bebida)
                                    }),
                                )
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
                                setState(
                                    produce((draft) => {
                                        draft.logs.unshift(
                                            createLog(
                                                "positivo",
                                                `Você encontrou ${labelsAlimentos[comida.calculaTipo()]}!`,
                                            ),
                                        )
                                        const comidas = (draft.mochila.comidas[
                                            tipoAlimento
                                        ] ??= [])
                                        comidas.push(comida)
                                    }),
                                )
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
                                setState(
                                    produce((draft) => {
                                        draft.logs.unshift(
                                            createLog(
                                                "neutro",
                                                `Você encontrou ${labelsInimigos[tipoInimigo]}, prepare-se!`,
                                            ),
                                        )
                                    }),
                                )
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
                            setState(
                                produce((draft) => {
                                    draft.logs = []
                                }),
                            )
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
                        onDrink={(tipoPocao) => {
                            setState(
                                produce((draft) => {
                                    const bebidas =
                                        draft.mochila.bebidas[tipoPocao] ?? []
                                    const bebida = bebidas.shift()
                                    if (bebida == null) return

                                    if (bebida.calculaTipoElixir() != null) {
                                        draft.logs.unshift(
                                            createLog(
                                                "positivo",
                                                "Esta poção foi tonificada e é mais potente!",
                                            ),
                                        )
                                    }

                                    const atributos = bebida.calculaAtributos()
                                    draft.jogador =
                                        jogadorRef.current.controller.alteraHp(
                                            draft.jogador,
                                            atributos.hp,
                                        )

                                    switch (tipoPocao) {
                                        case "forca":
                                        case "inteligencia":
                                            setEfeitos((efeitos) =>
                                                new Map(efeitos).set(
                                                    tipoPocao,
                                                    {
                                                        forca: atributos.forca,
                                                        inteligencia:
                                                            atributos.inteligencia,
                                                        tempo: 10,
                                                    },
                                                ),
                                            )
                                    }

                                    if (bebidas.length === 0) {
                                        delete draft.mochila.bebidas[tipoPocao]
                                    } else {
                                        draft.mochila.bebidas[tipoPocao] =
                                            bebidas
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
                        potions={{
                            forca: efeitos.get("forca")?.tempo,
                            inteligencia: efeitos.get("inteligencia")?.tempo,
                        }}
                        onUpdateStrike={(idx) => {
                            setState(
                                produce((draft) => {
                                    draft.idxGolpe = idx
                                }),
                            )
                        }}
                    />
                </div>
            </div>
        </main>
    )
}
