import {
    AchadoPasseio,
    executaBatalha,
    executaPasseio,
    RodadaBatalha,
} from "@/src/domain/services/passeio"
import {
    IconSword,
    IconBrain,
    IconWallet,
    IconTrophy,
    IconBrandSafari,
    IconHome,
    IconBuildingStore,
    IconBong,
} from "@tabler/icons-react"
import { Button } from "../../../components/ui/button"
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "../../../components/ui/card"
import { Jogador } from "@/src/domain/entities/Jogador"
import { Progress } from "../../../components/ui/progress"
import { Carteira } from "@/src/domain/entities/Carteira"
import { Espolio } from "@/src/domain/entities/Espolio"
import { Probabilidade } from "@/src/domain/entities/Probabilidade"
import { TipoPersonagem } from "@/src/domain/entities/Personagem"
import { JogadorListener } from "@/src/domain/services/jogador"
import { delay } from "../../../lib/utils"
import { ProbabilidadeAleatoria } from "@/src/infrastructure/services/Probabilidade/aleatoria"
import { useRef, useState } from "react"
import { Bebida } from "@/src/domain/entities/Bebida"
import { Comida } from "@/src/domain/entities/Comida"
import { TipoInimigo } from "@/src/domain/entities/Inimigo"
import { Partida } from "../models/Partida"

type DadosPasseio = {
    controller: AbortController
}

type Props = {
    title: string

    partida: Partida
    jogador: Jogador
    carteira: Carteira

    listener: JogadorListener<Jogador>

    onFindMoney: (amount: number) => void
    onFindDrink: (drink: Bebida) => void
    onFindFood: (food: Comida) => void
    onFindEnemy: (enemy: TipoInimigo) => void
}

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

export function StatisticsSection(props: Props) {
    const { jogador, carteira, partida } = props
    const passeioRef = useRef<DadosPasseio | null>(null)
    const [ehPasseio, setEhPasseio] = useState<boolean>(false)

    return (
        <Card className="border-slate-800 bg-slate-900">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800 px-6 py-1">
                <CardTitle className="text-sm font-medium tracking-wider text-slate-400 uppercase">
                    {props.title}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs font-bold uppercase">
                                <span>HP</span>
                                <span>
                                    {jogador.hp}/{jogador.maxHp}
                                </span>
                            </div>
                            <Progress
                                value={(jogador.hp / jogador.maxHp) * 100}
                                className="h-3 bg-slate-800"
                            />
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs font-bold uppercase">
                                <span>XP</span>
                                <span>{jogador.xp}%</span>
                            </div>
                            <Progress
                                value={jogador.xp}
                                className="h-3 bg-slate-800"
                            />
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs font-bold uppercase">
                                <span>Fome</span>
                                <span>{jogador.fome}%</span>
                            </div>
                            <Progress
                                value={jogador.fome}
                                className="h-3 bg-slate-800"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                            <IconSword className="h-5 w-5 text-red-400" />{" "}
                            <div>
                                <p className="text-[10px] text-slate-400 uppercase">
                                    Força
                                </p>
                                <p className="text-lg font-bold">
                                    {jogador.forca}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <IconBrain className="h-5 w-5 text-purple-400" />{" "}
                            <div>
                                <p className="text-[10px] text-slate-400 uppercase">
                                    Inteligência
                                </p>
                                <p className="text-lg font-bold">
                                    {jogador.inteligencia}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <IconWallet className="h-5 w-5 text-green-400" />{" "}
                            <div>
                                <p className="text-[10px] text-slate-400 uppercase">
                                    Carteira
                                </p>
                                <p className="text-lg font-bold">
                                    TL${carteira.valor}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <IconTrophy className="h-5 w-5 text-yellow-400" />{" "}
                            <div>
                                <p className="text-[10px] text-slate-400 uppercase">
                                    Nível
                                </p>
                                <p className="text-lg font-bold">
                                    {jogador.nivel}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap justify-center gap-4 pt-5">
                    {!ehPasseio ? (
                        <Button
                            onClick={(_) => {
                                const controller = new AbortController()
                                passeia({
                                    signal: controller.signal,
                                    jogador: jogador,
                                    tipoPersonagem: partida.tipoPersonagem,
                                    probabilidade: new ProbabilidadeAleatoria(),
                                    listener: props.listener,
                                    async onAchado(
                                        achado: AchadoPasseio,
                                    ): Promise<void> {
                                        switch (achado.tipo) {
                                            case "bau":
                                                switch (achado.item.tipo) {
                                                    case "dinheiro":
                                                        const moedas =
                                                            achado.item.moedas
                                                        props.onFindMoney(
                                                            moedas,
                                                        )
                                                        break
                                                    case "bebida":
                                                        const bebida =
                                                            achado.item.bebida
                                                        props.onFindDrink(
                                                            bebida,
                                                        )
                                                        break
                                                    case "comida":
                                                        const comida =
                                                            achado.item.comida
                                                        props.onFindFood(comida)
                                                        break
                                                }
                                                await delay(1000)
                                                break
                                            case "inimigo":
                                                props.onFindEnemy(
                                                    achado.tipoInimigo,
                                                )
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
                            <IconBrandSafari className="h-4 w-4" /> Iniciar
                            passeio
                        </Button>
                    ) : (
                        <Button
                            onClick={async (_) => {
                                passeioRef.current?.controller.abort()
                                passeioRef.current = null
                                setEhPasseio(false)
                            }}
                            variant="secondary"
                            className="gap-2"
                        >
                            <IconHome className="h-4 w-4" /> Voltar para casa
                        </Button>
                    )}
                    <Button variant="secondary" className="gap-2">
                        <IconBuildingStore className="h-4 w-4" /> Visitar
                        comerciante
                    </Button>
                    <Button variant="secondary" className="gap-2">
                        <IconBong className="h-4 w-4" /> Visitar alquimista
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
