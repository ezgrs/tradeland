import { RefObject, useEffect, useRef, useState } from "react"
import { Estado } from "../models/Estado"
import { Jogador } from "@/src/domain/entities/Jogador"
import { Partida } from "../models/Partida"
import { useRouter } from "next/router"
import { produce } from "immer"
import { Efeito, useEfeitos } from "./efeitos"
import { createLog } from "../models/Log"
import {
    ClasseCurandeiro,
    ClasseGladiador,
    ClasseMago,
    ClassePadrao,
} from "@/src/domain/entities/Classe"
import { Personagem } from "@/src/domain/services/Personagem"

type TipoEfeito = "forca" | "sagacidade"

export function useEstado():
    | [
          Estado,
          (action: (state: Estado) => Estado) => void,
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
            personagem: new Personagem({ nome: userData["nome"], classe }),
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

    useEffect(() => {
        const id = setInterval(() => {
            setEstado(
                produce((draft) => {
                    draft.jogador = draft.partida.personagem.diminuiFome(
                        draft.jogador,
                        -5,
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
    return [estado, setEstado, efeitos, addEfeito]
}
