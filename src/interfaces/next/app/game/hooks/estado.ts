import { RefObject, useEffect, useRef, useState } from "react"
import { Estado } from "../models/Estado"
import { Jogador } from "@/src/domain/entities/Jogador"
import { Partida } from "../models/Partida"
import { useRouter } from "next/router"
import { produce } from "immer"
import { Efeito, useEfeitos } from "./efeitos"
import { createLog } from "../models/Log"
import {
    DefaultJogadorController,
    DefaultJogadorListener,
    JogadorController,
    JogadorListener,
} from "@/src/domain/services/jogador"
import {
    ClasseCurandeiro,
    ClasseGladiador,
    ClasseMago,
    ClassePadrao,
} from "@/src/domain/entities/Classe"

type TipoEfeito = "forca" | "sagacidade"

type JogadorRef = {
    controller: JogadorController<Jogador>
    listener: JogadorListener<Jogador>
}

export function useEstado():
    | [
          Estado,
          (action: (state: Estado) => Estado) => void,
          RefObject<JogadorRef>,
          Map<TipoEfeito, Efeito>,
          (value: TipoEfeito, efeito: Efeito) => void,
      ]
    | null {
    const [state, setState] = useState<Estado | null>(null)
    function setEstado(action: (state: Estado) => Estado) {
        setState((estado) => {
            if (estado == null) return null
            return action(estado)
        })
    }

    const router = useRouter()
    useEffect(() => {
        const stored = sessionStorage.getItem("userData")
        if (!stored) {
            router.replace("/")
            return
        }
        const userData = JSON.parse(stored)
        let classe = new ClassePadrao()
        switch (userData["classe"]) {
            case "curandeiro":
                classe = new ClasseCurandeiro(classe)
                break
            case "gladiador":
                classe = new ClasseGladiador(classe)
                break
            case "mago":
                classe = new ClasseMago(classe)
                break
        }
        const partida: Partida = {
            nomePersonagem: userData["nome"],
            classePersonagem: classe,
            dificuldade: userData["dificuldade"],
        }
        setState({
            partida: partida,
            jogador: classe.criaJogador(),
            carteira: {
                valor: 0,
            },
            mochila: {
                espolios: {},
                comidas: {},
                bebidas: {},
            },
            golpe: null,
            inimigo: null,
            logs: [],
        })
    }, [router])

    const jogadorRef = useRef<JogadorRef>(
        (() => {
            const controller = new DefaultJogadorController()
            return {
                controller,
                listener: new DefaultJogadorListener(controller),
            }
        })(),
    )
    useEffect(() => {
        const id = setInterval(() => {
            setEstado(
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

    const [efeitos, addEfeito] = useEfeitos<"forca" | "sagacidade">()

    const estado = produce(state, (draft) => {
        if (draft == null) return
        // Inclui efeitos ativos
        for (const [_, efeito] of efeitos.entries()) {
            draft.jogador.forca += efeito.forca
            draft.jogador.sagacidade += efeito.sagacidade
        }
    })
    const tier =
        estado == null
            ? null
            : Math.min(31 - Math.clz32(estado.jogador.nivel), 6)
    useEffect(() => {
        if (tier == null) return
        if (tier < 2) return
        setEstado(
            produce((draft) => {
                draft.logs.unshift(
                    createLog("inesperado", "Você desbloqueou um novo ataque!"),
                )
            }),
        )
    }, [tier])

    if (estado == null) return null
    return [estado, setEstado, jogadorRef, efeitos, addEfeito]
}
