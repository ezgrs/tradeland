import {
    AchadoPasseio,
    executaBatalha,
    executaPasseio,
    RodadaBatalha,
} from "@/src/domain/services/passeio"
import { ProbabilidadeAleatoria } from "@/src/infrastructure/services/Probabilidade/aleatoria"
import { IconBrandSafari, IconHome } from "@tabler/icons-react"
import { Button } from "../../../components/ui/button"
import { delay } from "../../../lib/utils"
import { useRef, useState } from "react"
import { Espolio } from "@/src/domain/entities/Espolio"
import { Probabilidade } from "@/src/domain/entities/Probabilidade"
import { TipoPersonagem } from "@/src/domain/entities/Personagem"
import { Jogador } from "@/src/domain/entities/Jogador"
import { JogadorListener } from "@/src/domain/services/jogador"
import { Partida } from "../models/Partida"
import { Bebida } from "@/src/domain/entities/Bebida"
import { Comida } from "@/src/domain/entities/Comida"
import { TipoInimigo } from "@/src/domain/entities/Inimigo"

type PasseioArgs = {
    signal: AbortSignal
    probabilidade: Probabilidade
    tipoPersonagem: TipoPersonagem
    jogador: Jogador
    onAchado: (achado: AchadoPasseio) => Promise<void>
    onRodadaBatalha: (rodada: RodadaBatalha) => Promise<void>
    onCovarde: () => Promise<void>
    listener: JogadorListener<any>
}

type DadosPasseio = {
    controller: AbortController
}

async function passeia(args: PasseioArgs): Promise<void> {
    type Event =
        | { type: "passeio" }
        | { type: "batalha"; recompensa: Espolio | null; rodada: RodadaBatalha }

    let currentJogador = args.jogador
    let currentEvent: Event = { type: "passeio" }
    while (!args.signal.aborted) {
        switch (currentEvent.type) {
            case "passeio":
                const achado = executaPasseio(args.probabilidade, {
                    tipoPersonagem: args.tipoPersonagem,
                })
                await args.onAchado(achado)
                switch (achado.tipo) {
                    case "bau":
                        currentEvent = { type: "passeio" }
                        break
                    case "inimigo":
                        currentEvent = {
                            type: "batalha",
                            recompensa: achado.recompensa,
                            rodada: {
                                inimigo: {
                                    tipo: achado.tipoInimigo,
                                    nivel: currentJogador.nivel,
                                    hp: currentJogador.nivel * 20 + 50,
                                    forca: currentJogador.nivel + 2,
                                },
                                jogador: currentJogador,
                            },
                        }
                        break
                }
                break
            case "batalha":
                const proximaRodada = executaBatalha({
                    inimigo: currentEvent.rodada.inimigo,
                    jogador: currentEvent.rodada.jogador,
                    tipoPersonagem: args.tipoPersonagem,
                    listener: args.listener,
                })
                if (
                    proximaRodada.inimigo.hp <= 0 ||
                    proximaRodada.jogador.hp <= 0
                ) {
                    currentEvent = { type: "passeio" }
                } else {
                    await args.onRodadaBatalha(proximaRodada)
                    currentEvent = {
                        type: "batalha",
                        recompensa: currentEvent.recompensa,
                        rodada: proximaRodada,
                    }
                }
        }
    }
    if (currentEvent?.type == "batalha") {
        await args.onCovarde()
    }
}

type Props = {
    offLabel: string
    onLabel: string

    jogador: Jogador
    partida: Partida

    listener: JogadorListener<any>

    onFindMoney: (amount: number) => void
    onFindDrink: (drink: Bebida) => void
    onFindFood: (food: Comida) => void
    onFindEnemy: (enemy: TipoInimigo) => void
}

export function RideButton(props: Props) {
    const { jogador, partida } = props

    const passeioRef = useRef<DadosPasseio | null>(null)
    const [ehPasseio, setEhPasseio] = useState<boolean>(false)
    if (ehPasseio) {
        return (
            <Button
                onClick={async (_) => {
                    passeioRef.current?.controller.abort()
                    passeioRef.current = null
                    setEhPasseio(false)
                }}
                variant="secondary"
                className="gap-2"
            >
                <IconHome className="h-4 w-4" /> {props.onLabel}
            </Button>
        )
    }

    return (
        <Button
            onClick={(_) => {
                const controller = new AbortController()
                passeia({
                    signal: controller.signal,
                    jogador: jogador,
                    tipoPersonagem: partida.tipoPersonagem,
                    probabilidade: new ProbabilidadeAleatoria(),
                    listener: props.listener,
                    async onAchado(achado: AchadoPasseio): Promise<void> {
                        switch (achado.tipo) {
                            case "bau":
                                switch (achado.item.tipo) {
                                    case "dinheiro":
                                        const moedas = achado.item.moedas
                                        props.onFindMoney(moedas)
                                        break
                                    case "bebida":
                                        const bebida = achado.item.bebida
                                        props.onFindDrink(bebida)
                                        break
                                    case "comida":
                                        const comida = achado.item.comida
                                        props.onFindFood(comida)
                                        break
                                }
                                await delay(1000)
                                break
                            case "inimigo":
                                props.onFindEnemy(achado.tipoInimigo)
                                await delay(5000)
                                break
                        }
                    },
                    async onRodadaBatalha(
                        rodada: RodadaBatalha,
                    ): Promise<void> {},
                    async onCovarde(): Promise<void> {},
                })
                passeioRef.current = { controller }
                setEhPasseio(true)
            }}
            variant="secondary"
            className="gap-2"
        >
            <IconBrandSafari className="h-4 w-4" /> {props.offLabel}
        </Button>
    )
}
