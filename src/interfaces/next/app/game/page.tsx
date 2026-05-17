"use client"

import { LogsSection } from "./components/LogsSection"
import { InventorySection } from "./components/InventorySection"
import { StatisticsSection } from "./components/StatisticsSection"
import { BattleSection } from "./components/BattleSection"
import { Inimigo, TipoInimigo } from "@/src/domain/entities/Inimigo"
import { Button } from "../../components/ui/button"
import { IconBuildingStore, IconBong } from "@tabler/icons-react"
import { RideButton } from "./components/RideButton"
import { TipoAlimento } from "@/src/domain/entities/Alimento"
import { produce } from "immer"
import { TipoPocao } from "@/src/domain/entities/Pocao"
import { AchadoPasseio, executaPasseio } from "@/src/domain/services/passeio"
import { ProbabilidadeAleatoria } from "@/src/infrastructure/services/Probabilidade/aleatoria"
import { delay } from "../../lib/utils"
import { Bebida } from "@/src/domain/entities/Bebida"
import { Comida } from "@/src/domain/entities/Comida"
import { FinalBatalha } from "./models/FinalBatalha"
import { Golpe } from "@/src/domain/entities/Golpe"
import { useEstado } from "./hooks/estado"
import { useEffect } from "react"
import { useLogs } from "./hooks/logs"
import { useCarteira } from "./hooks/carteira"
import { useSacola } from "./hooks/sacola"
import { Espolio } from "@/src/domain/entities/Espolio"

export default function GameDashboard() {
    const hook = useEstado()
    if (!hook) return null

    const [estado, setEstado, efeitos, addEfeito] = hook
    const { jogador, partida } = estado
    const [moedas, depositCoins] = useCarteira()
    const [logs, addLog, clearLogs] = useLogs()
    const [espolios, addEspolio, _] = useSacola<Espolio["id"], Espolio>()
    const [comidas, addComida, popComida] = useSacola<TipoAlimento, Comida>()
    const [bebidas, addBebida, popBebida] = useSacola<TipoPocao, Bebida>()

    const tier = Math.min(31 - Math.clz32(jogador.nivel), 6)
    useEffect(() => {
        if (tier == null) return
        if (tier < 2) return
        addLog("inesperado", "Você desbloqueou um novo ataque!")
    }, [tier])

    function onEncontraMoedas(valor: number) {
        addLog("positivo", `Você encontrou ${valor} moedas!`)
        depositCoins(valor)
    }

    function onEncontraComida(comida: Comida) {
        const labelsAlimentos: Record<TipoAlimento, string> = {
            uva: "uma uva",
            maca: "uma maçã",
            banana: "uma banana",
            cenoura: "uma cenoura",
            ensopado: "um ensopado",
            frango: "um frango",
        }
        const tipoAlimento = comida.calculaTipo()
        addLog("positivo", `Você encontrou ${labelsAlimentos[tipoAlimento]}!`)
        addComida(tipoAlimento, comida)
    }

    function onEncontraBebida(bebida: Bebida) {
        const labelsPocoes: Record<TipoPocao, string> = {
            vida: "vida",
            sagacidade: "sagacidade",
            forca: "força",
        }
        const tipoPocao = bebida.calculaTipo()
        addLog(
            "positivo",
            `Você encontrou uma poção de ${labelsPocoes[tipoPocao]}!`,
        )
        addBebida(tipoPocao, bebida)
    }

    function onEncontraInimigo(inimigo: Inimigo) {
        const labelsInimigos: Record<TipoInimigo, string> = {
            dragao: "um dragão",
            trasgo: "um trasgo",
            ogro: "um ogro",
            gigante: "um gigante",
            bruxa: "uma bruxa",
            vampiro: "um vampiro",
        }
        addLog(
            "neutro",
            `Você encontrou ${labelsInimigos[inimigo.tipo]}, prepare-se!`,
        )
        setEstado(
            produce((draft) => {
                draft.inimigo = inimigo
            }),
        )
    }

    function onAtacaInimigo(inimigo: Inimigo, dano: number) {
        const labelsInimigos: Record<TipoInimigo, string> = {
            dragao: "no dragão",
            trasgo: "no trasgo",
            ogro: "no ogro",
            gigante: "no gigante",
            bruxa: "na bruxa",
            vampiro: "no vampiro",
        }

        addLog(
            "neutro",
            `Você causou ${dano} pontos de dano ${labelsInimigos[inimigo.tipo]}.`,
        )
        setEstado(
            produce((draft) => {
                const novoHpInimigo = inimigo.hp - dano
                if (novoHpInimigo > 0) {
                    draft.inimigo = { ...inimigo, hp: novoHpInimigo }
                }
            }),
        )
    }

    return (
        <main className="min-h-screen w-full bg-slate-950 p-4 text-slate-50 md:p-8">
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="space-y-6 lg:col-span-6">
                    <StatisticsSection
                        title="Estatísticas"
                        jogador={jogador}
                        moedas={moedas}
                    >
                        <RideButton
                            offLabel="Iniciar passeio"
                            onLabel="Voltar pra casa"
                            traveler={{
                                level(): number {
                                    return jogador.nivel
                                },
                                async produceDamage(
                                    inimigo: Inimigo,
                                ): Promise<number> {
                                    const tiers: Record<Golpe, number> = {
                                        lvl1: 1,
                                        lvl2: 2,
                                        lvl3: 3,
                                        lvl4: 4,
                                        lvl5: 5,
                                        lvl6: 6,
                                    }
                                    const danoGolpe =
                                        estado.golpe == null
                                            ? 10
                                            : (tiers[estado.golpe] + 1) * 10
                                    const dano =
                                        partida.personagem.classe.calculaDano(
                                            jogador,
                                            danoGolpe,
                                        )
                                    onAtacaInimigo(inimigo, dano)
                                    return dano
                                },
                                async consumeDamage(
                                    valor: number,
                                ): Promise<void> {
                                    setEstado(
                                        produce((draft) => {
                                            draft.jogador =
                                                partida.personagem.recebeDano(
                                                    draft.jogador,
                                                    valor,
                                                )
                                        }),
                                    )
                                    await delay(1000)
                                },
                            }}
                            listener={{
                                async onSomethingFound(): Promise<AchadoPasseio> {
                                    const achado = executaPasseio(
                                        new ProbabilidadeAleatoria(),
                                        partida.personagem.classe,
                                    )
                                    switch (achado.tipo) {
                                        case "bau":
                                            switch (achado.item.tipo) {
                                                case "dinheiro":
                                                    onEncontraMoedas(
                                                        achado.item.moedas,
                                                    )
                                                    break
                                                case "bebida":
                                                    onEncontraBebida(
                                                        achado.item.bebida,
                                                    )
                                                    break
                                                case "comida":
                                                    onEncontraComida(
                                                        achado.item.comida,
                                                    )
                                                    break
                                            }
                                            await delay(5000)
                                            break
                                        case "inimigo":
                                            break
                                    }
                                    return achado
                                },
                                async onEnemyFound(
                                    inimigo: Inimigo,
                                ): Promise<void> {
                                    onEncontraInimigo(inimigo)
                                    await delay(5000)
                                },
                                async onBattleFinished(
                                    result: FinalBatalha,
                                ): Promise<void> {
                                    setEstado(
                                        produce((draft) => {
                                            draft.inimigo = null

                                            let jogador = draft.jogador
                                            jogador =
                                                partida.personagem.classe.evoluiBatalha(
                                                    jogador,
                                                )
                                            const nivelAtual = jogador.nivel
                                            jogador =
                                                partida.personagem.aumentaXp(
                                                    jogador,
                                                    nivelAtual * 10,
                                                )
                                            draft.jogador = jogador
                                            switch (result.type) {
                                                case "vitoria":
                                                    if (
                                                        result.espolio != null
                                                    ) {
                                                        addEspolio(
                                                            result.espolio.id,
                                                            result.espolio,
                                                        )
                                                    }
                                            }
                                        }),
                                    )
                                    await delay(2000)
                                },
                            }}
                        />
                        <div className="flex flex-wrap justify-center gap-4">
                            <Button variant="secondary" className="gap-2">
                                <IconBuildingStore className="h-4 w-4" />{" "}
                                Visitar comerciante
                            </Button>
                            <Button variant="secondary" className="gap-2">
                                <IconBong className="h-4 w-4" /> Visitar
                                alquimista
                            </Button>
                        </div>
                    </StatisticsSection>
                    <LogsSection
                        title="Logs de Registro"
                        logs={logs}
                        onClearLogs={clearLogs}
                    />
                </div>

                <div className="space-y-6 lg:col-span-6">
                    <InventorySection
                        title="Inventário"
                        espolios={espolios}
                        comidas={comidas}
                        bebidas={bebidas}
                        onEat={(tipoAlimento) => {
                            const comida = popComida(tipoAlimento)
                            switch (comida.calculaTempero()) {
                                case "amargo":
                                    addLog(
                                        "inesperado",
                                        "Alguém amargou isso, sua fome piorou!",
                                    )
                                    break
                                case "doce":
                                    addLog(
                                        "inesperado",
                                        "Alguém colocou algo gostoso nisso, sua fome melhorou!",
                                    )
                                    break
                            }
                            setEstado(
                                produce((draft) => {
                                    draft.jogador =
                                        partida.personagem.diminuiFome(
                                            jogador,
                                            comida.calculaFomeRestaurada(),
                                        )
                                }),
                            )
                        }}
                        onDrink={(tipoPocao) => {
                            const bebida = popBebida(tipoPocao)
                            if (bebida.calculaTipoElixir() != null) {
                                addLog(
                                    "inesperado",
                                    "Esta poção foi tonificada e é mais potente!",
                                )
                            }
                            const atributos = bebida.calculaAtributos()
                            setEstado(
                                produce((draft) => {
                                    draft.jogador =
                                        partida.personagem.aumentaHp(
                                            draft.jogador,
                                            atributos.hp,
                                        )
                                }),
                            )
                            switch (tipoPocao) {
                                case "forca":
                                case "sagacidade":
                                    addEfeito(tipoPocao, {
                                        forca: atributos.forca,
                                        sagacidade: atributos.sagacidade,
                                        tempo: 10,
                                    })
                            }
                        }}
                    />
                    <BattleSection
                        title="Batalha"
                        jogador={jogador}
                        partida={partida}
                        golpe={estado.golpe}
                        inimigo={estado.inimigo}
                        potions={{
                            forca: efeitos.get("forca")?.tempo,
                            sagacidade: efeitos.get("sagacidade")?.tempo,
                        }}
                        onUpdateGolpe={(golpe) => {
                            setEstado(
                                produce((draft) => {
                                    draft.golpe = golpe
                                }),
                            )
                        }}
                    />
                </div>
            </div>
        </main>
    )
}
