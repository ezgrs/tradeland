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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/ui/select"
import { ScrollArea } from "../../components/ui/scroll-area"
import {
    IconTrash,
    IconSword,
    IconBrain,
    IconWallet,
    IconTrophy,
    IconBrandSafari,
    IconBuildingStore,
    IconToolsKitchen2,
    IconMug,
    IconFoldDown,
    IconFoldUp,
    IconBong,
    IconHome,
} from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { Jogador } from "@/src/domain/entities/Jogador"
import { Carteira } from "@/src/domain/entities/Carteira"
import { Mochila } from "@/src/domain/entities/Mochila"
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
import { Dificuldade } from "@/src/domain/entities/Dificuldade"
import { Probabilidade } from "@/src/domain/entities/Probabilidade"

type DadosPasseio = {
    controller: AbortController
}

type TipoLog = "positivo" | "negativo" | "neutro"
type Log = {
    id: string
    tipo: TipoLog
    timestamp: Date
    mensagem: string
}
function createLog(tipo: TipoLog, mensagem: string): Log {
    return {
        id: crypto.randomUUID(),
        tipo: tipo,
        timestamp: new Date(),
        mensagem: mensagem,
    }
}

type State = {
    partida: {
        nomePersonagem: string
        tipoPersonagem: TipoPersonagem
        dificuldade: Dificuldade
    }
    jogador: Jogador
    carteira: Carteira
    mochila: Mochila
    idxGolpe: number | null
    logs: Log[]
}

type RowValue<K, V> = { tipo: K; valores: V[] } | null

type Row = {
    espolio: RowValue<Espolio["id"], Espolio>
    comida: RowValue<TipoAlimento, Comida>
    bebida: RowValue<TipoPocao, Bebida>
}

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}

function MochilaTable({ mochila }: { mochila: Mochila }) {
    const labelsEspolios: Record<Espolio["id"], string> = {
        escamaDragao: "Escama de dragão",
        salivaDragao: "Saliva de dragão",
        caudaDragao: "Cauda de dragão",
        asaDragao: "Asa de dragão",
        chifreDragao: "Chifre de dragão",
        pataDragao: "Pata de dragão",
        narinaDragao: "Narina de dragão",
        coracaoTrasgo: "Coração de trasgo",
        peleTrasgo: "Pele de trasgo",
        orelhaTrasgo: "Orelha de trasgo",
        tangaTrasgo: "Tango de trasgo",
        unhaTrasgo: "Unha de trasgo",
        bastaoTrasgo: "Bastão de trasgo",
        toucaTrasgo: "Touca de trasgo",
        dedoOgro: "Dedo de ogro",
        peloOgro: "Pelo de ogro",
        carcacaOgro: "Carcaça de ogro",
        peleOgro: "Pele de ogro",
        orelhaOgro: "Orelha de ogro",
        gorduraOgro: "Gordura de ogro",
        sobrancelhaOgro: "Sobrancelha de ogro",
        olhoGigante: "Olho de gigante",
        melecaGigante: "Meleca de gigante",
        couroGigante: "Couro de gigante",
        peleGigante: "Pele de gigante",
        tangaGigante: "Tanga de gigante",
        sangueGigante: "Sangue de gigante",
        barbaGigante: "Barba de gigante",
        varinhaBruxa: "Varinha de bruxa",
        chapeuBruxa: "Chapéu de bruxa",
        cabeloBruxa: "Cabelo de bruxa",
        narizBruxa: "Nariz de bruxa",
        vassouraBruxa: "Vassoura de bruxa",
        verrugaBruxa: "Verruga de bruxa",
        colarBruxa: "Colar de bruxa",
        cabecaVampiro: "Cabeça de vampiro",
        denteVampiro: "Dente de vampiro",
        capaVampiro: "Capa de vampiro",
        peleVampiro: "Pele de vampiro",
        sangueVampiro: "Sangue de vampiro",
        pingenteVampiro: "Pingente de vampiro",
        linguaVampiro: "Língua de vampiro",
    }
    const labelsComidas: Record<TipoAlimento, string> = {
        uva: "Uva",
        maca: "Maçã",
        banana: "Banana",
        cenoura: "Cenoura",
        ensopado: "Ensopado",
        frango: "Frango",
    }
    const labelsPocoes: Record<TipoPocao, string> = {
        vida: "Vida",
        sagacidade: "Sagacidade",
        forca: "Força",
    }

    const itensEspolios = [...Object.entries(mochila.espolios)]
    const itensComidas = [...Object.entries(mochila.comidas)]
    const itensBebidas = [...Object.entries(mochila.bebidas)]
    const rowCount = Math.max(
        itensEspolios.length,
        itensComidas.length,
        itensBebidas.length,
    )
    const rows: Row[] = Array.from({ length: rowCount }, (_, i) => {
        const itemEspolio = itensEspolios[i]
        const itemComida = itensComidas[i]
        const itemBebida = itensBebidas[i]
        return {
            espolio:
                itemEspolio == null
                    ? null
                    : {
                          tipo: itemEspolio[0] as Espolio["id"],
                          valores: itemEspolio[1],
                      },
            comida:
                itemComida == null
                    ? null
                    : {
                          tipo: itemComida[0] as TipoAlimento,
                          valores: itemComida[1],
                      },
            bebida:
                itemBebida == null
                    ? null
                    : {
                          tipo: itemBebida[0] as TipoPocao,
                          valores: itemBebida[1],
                      },
        }
    })
    return (
        <Table>
            <TableHeader className="bg-slate-800/50">
                <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="pl-6 text-xs font-bold text-slate-300 uppercase">
                        Espólio
                    </TableHead>
                    <TableHead className="px-0 text-xs font-bold text-slate-300 uppercase">
                        Comida
                    </TableHead>
                    <TableHead className="px-0 text-xs font-bold text-slate-300 uppercase">
                        Poção
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {rows.map((row, index) => {
                    const dadosEspolio = row.espolio
                    const dadosComida = row.comida
                    const dadosBebida = row.bebida
                    return (
                        <TableRow
                            key={index}
                            className="border-slate-800 hover:bg-slate-800/20"
                        >
                            <TableCell className="pl-6 font-medium text-slate-400">
                                {dadosEspolio != null &&
                                    labelsEspolios[dadosEspolio.tipo]}
                            </TableCell>
                            <TableCell className="px-0">
                                {dadosComida != null && (
                                    <div className="flex items-center gap-4">
                                        <span className="font-medium text-slate-400">
                                            {labelsComidas[dadosComida.tipo]}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 border-slate-700 bg-slate-950 px-2 text-[10px] uppercase hover:bg-orange-950 hover:text-orange-400"
                                        >
                                            <IconToolsKitchen2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </TableCell>
                            <TableCell className="px-0">
                                {dadosBebida != null && (
                                    <div className="flex items-center gap-4">
                                        <span className="font-medium text-slate-400">
                                            {labelsPocoes[dadosBebida.tipo]}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 border-slate-700 bg-slate-950 px-2 text-[10px] uppercase hover:bg-blue-950 hover:text-blue-400"
                                        >
                                            <IconMug className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </TableCell>
                        </TableRow>
                    )
                })}
            </TableBody>
        </Table>
    )
}

class ProbabilidadeAleatoria implements Probabilidade {
    porChaves<T extends string>(pesos: Record<T, number>): T {
        const entries = Object.entries(pesos) as [T, number][]
        return this.porItens(entries.map(([valor, peso]) => ({ valor, peso })))
    }

    porItens<T>(pesos: { valor: T; peso: number }[]): T {
        const total = pesos.reduce((sum, p) => sum + p.peso, 0)

        if (total <= 0) {
            throw new Error("Total de pesos deve ser maior que zero")
        }

        let random = Math.random() * total
        for (const item of pesos) {
            random -= item.peso
            if (random <= 0) {
                return item.valor
            }
        }
        return pesos[pesos.length - 1].valor
    }

    porIntervaloNumerico(min: number, max: number): number {
        if (max < min) {
            throw new Error("max deve ser >= min")
        }
        return Math.floor(Math.random() * (max - min + 1)) + min
    }
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
    const passeioRef = useRef<DadosPasseio | null>(null)
    const [ehPasseio, setEhPasseio] = useState<boolean>(false)

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
                    <Card className="border-slate-800 bg-slate-900">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800 px-6 py-1">
                            <CardTitle className="text-sm font-medium tracking-wider text-slate-400 uppercase">
                                Estatísticas
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
                                            value={
                                                (jogador.hp / jogador.maxHp) *
                                                100
                                            }
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
                                            const controller =
                                                new AbortController()
                                            passeia({
                                                signal: controller.signal,
                                                jogador: jogador,
                                                tipoPersonagem:
                                                    partida.tipoPersonagem,
                                                probabilidade:
                                                    new ProbabilidadeAleatoria(),
                                                listener:
                                                    jogadorRef.current.listener,
                                                async onAchado(
                                                    achado: AchadoPasseio,
                                                ): Promise<void> {
                                                    switch (achado.tipo) {
                                                        case "bau":
                                                            switch (
                                                                achado.item.tipo
                                                            ) {
                                                                case "dinheiro":
                                                                    const moedas =
                                                                        achado
                                                                            .item
                                                                            .moedas
                                                                    setState(
                                                                        (
                                                                            state,
                                                                        ) => {
                                                                            if (
                                                                                state ==
                                                                                null
                                                                            )
                                                                                return null
                                                                            return {
                                                                                ...state,
                                                                                logs: [
                                                                                    createLog(
                                                                                        "positivo",
                                                                                        `Você encontrou ${moedas} moedas!`,
                                                                                    ),
                                                                                    ...state.logs,
                                                                                ],
                                                                                carteira:
                                                                                    {
                                                                                        ...state.carteira,
                                                                                        valor:
                                                                                            state
                                                                                                .carteira
                                                                                                .valor +
                                                                                            moedas,
                                                                                    },
                                                                            }
                                                                        },
                                                                    )
                                                                    break
                                                                case "bebida":
                                                                    const bebida =
                                                                        achado
                                                                            .item
                                                                            .bebida
                                                                    setState(
                                                                        (
                                                                            state,
                                                                        ) => {
                                                                            if (
                                                                                state ==
                                                                                null
                                                                            )
                                                                                return null
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
                                                                        },
                                                                    )
                                                                    break
                                                                case "comida":
                                                                    const comida =
                                                                        achado
                                                                            .item
                                                                            .comida
                                                                    setState(
                                                                        (
                                                                            state,
                                                                        ) => {
                                                                            if (
                                                                                state ==
                                                                                null
                                                                            )
                                                                                return null
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
                                                                        },
                                                                    )
                                                                    break
                                                            }
                                                            await delay(1000)
                                                            break
                                                        case "inimigo":
                                                            setState(
                                                                (state) => {
                                                                    if (
                                                                        state ==
                                                                        null
                                                                    )
                                                                        return null
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
                                                                },
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
                                        <IconBrandSafari className="h-4 w-4" />{" "}
                                        Iniciar passeio
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
                                        <IconHome className="h-4 w-4" /> Voltar
                                        para casa
                                    </Button>
                                )}
                                <Button variant="secondary" className="gap-2">
                                    <IconBuildingStore className="h-4 w-4" />{" "}
                                    Visitar comerciante
                                </Button>
                                <Button variant="secondary" className="gap-2">
                                    <IconBong className="h-4 w-4" /> Visitar
                                    alquimista
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="flex h-[300px] flex-col border-slate-800 bg-slate-900">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800 px-6 py-1">
                            <CardTitle className="text-sm font-medium tracking-wider text-slate-400 uppercase">
                                Log de Registro
                            </CardTitle>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-500 hover:text-red-400"
                                onClick={(_) =>
                                    setState((state) => {
                                        if (state == null) return null
                                        return { ...state, logs: [] }
                                    })
                                }
                            >
                                <IconTrash className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <ScrollArea className="max-h-[200px] p-4 font-mono text-sm text-slate-400">
                            {state.logs.map((log) => {
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
                                        attrs.push(
                                            "font-bold",
                                            "text-green-400",
                                        )
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
                </div>

                <div className="space-y-6 lg:col-span-6">
                    <Card className="overflow-hidden border-slate-800 bg-slate-900">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800 px-6 py-1">
                            <CardTitle className="text-sm font-medium tracking-wider text-slate-400 uppercase">
                                Inventário
                            </CardTitle>
                        </CardHeader>
                        <MochilaTable mochila={mochila} />
                    </Card>

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
