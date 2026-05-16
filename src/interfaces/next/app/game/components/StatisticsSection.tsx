import {
    IconSword,
    IconBrain,
    IconWallet,
    IconTrophy,
} from "@tabler/icons-react"
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "../../../components/ui/card"
import { Jogador } from "@/src/domain/entities/Jogador"
import { Progress } from "../../../components/ui/progress"
import { Carteira } from "@/src/domain/entities/Carteira"
import { JSX } from "react"

type Props = {
    title: string

    jogador: Jogador
    carteira: Carteira

    children: JSX.Element[]
}

export function StatisticsSection(props: Props) {
    const { jogador, carteira } = props
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
                    {props.children}
                </div>
            </CardContent>
        </Card>
    )
}
