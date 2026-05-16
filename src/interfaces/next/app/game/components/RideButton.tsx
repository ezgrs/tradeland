import { AchadoPasseio } from "@/src/domain/services/passeio"
import { IconBrandSafari, IconHome } from "@tabler/icons-react"
import { Button } from "../../../components/ui/button"
import { useRef, useState } from "react"
import { Espolio } from "@/src/domain/entities/Espolio"
import { Inimigo } from "@/src/domain/entities/Inimigo"
import { JogadorMorreu } from "@/src/domain/errors/JogadorMorreu"
import { FinalBatalha } from "../models/FinalBatalha"

export interface Traveler {
    level(): number
    produceDamage(enemy: Inimigo): Promise<number>
    consumeDamage(amount: number): Promise<void>
}

interface TravelListener {
    onSomethingFound(): Promise<AchadoPasseio>
    onEnemyFound(enemy: Inimigo): Promise<void>
    onBattleFinished(reason: FinalBatalha): Promise<void>
}

type TravelArgs = {
    traveler: Traveler
    listener: TravelListener
    signal: AbortSignal
}

type DadosPasseio = {
    controller: AbortController
}

async function travel(args: TravelArgs): Promise<void> {
    const { traveler, listener } = args
    type Event =
        | { action: "walking" }
        | { action: "fighting"; reward: Espolio | null; enemy: Inimigo }

    let currentEvent: Event = { action: "walking" }
    while (!args.signal.aborted) {
        switch (currentEvent.action) {
            case "walking":
                const finding = await listener.onSomethingFound()
                switch (finding.tipo) {
                    case "bau":
                        currentEvent = { action: "walking" }
                        break
                    case "inimigo":
                        const level = traveler.level()
                        const hp = level * 20 + 50
                        const enemy = {
                            tipo: finding.tipoInimigo,
                            nivel: level,
                            hp: hp,
                            maxHp: hp,
                            forca: level + 2,
                        }
                        currentEvent = {
                            action: "fighting",
                            reward: finding.recompensa,
                            enemy: enemy,
                        }
                        await listener.onEnemyFound(enemy)
                        break
                }
                break
            case "fighting":
                const enemy: Inimigo = currentEvent.enemy
                const appliedDamage = await traveler.produceDamage(enemy)
                const newEnemyHp = enemy.hp - appliedDamage
                if (newEnemyHp <= 0) {
                    await listener.onBattleFinished("vitoria")
                    currentEvent = { action: "walking" }
                    break
                }

                const receivedDamage = enemy.forca
                try {
                    await traveler.consumeDamage(receivedDamage)
                } catch (e) {
                    if (e instanceof JogadorMorreu) {
                        await listener.onBattleFinished("morte")
                        return
                    }
                    throw e
                }
                currentEvent = {
                    action: "fighting",
                    reward: currentEvent.reward,
                    enemy: { ...enemy, hp: newEnemyHp },
                }
                break
        }
    }
    if (currentEvent?.action == "fighting") {
        await listener.onBattleFinished("fuga")
    }
}

type Props = {
    offLabel: string
    onLabel: string

    traveler: Traveler
    listener: TravelListener
}

export function RideButton(props: Props) {
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
                travel({
                    signal: controller.signal,
                    traveler: props.traveler,
                    listener: props.listener,
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
