import { useEffect, useState } from "react"
import { Partida } from "../models/Partida"
import { useRouter } from "next/router"
import { produce } from "immer"
import { Efeito, useEfeitos } from "./efeitos"
import {
    ClasseCurandeiro,
    ClasseGladiador,
    ClasseMago,
    ClassePadrao,
} from "@/src/domain/entities/Classe"
import { Personagem } from "@/src/domain/services/Personagem"
import { Jogador } from "@/src/domain/entities/Jogador"

type State = {
    jogador: Jogador
    partida: Partida
}
type TipoEfeito = "forca" | "sagacidade"

export function useJogador():
    | [
          Partida,
          Jogador,
          (action: (state: Jogador) => Jogador) => void,
          Map<TipoEfeito, Efeito>,
          (value: TipoEfeito, efeito: Efeito) => void,
      ]
    | null {
    const [state, setState] = useState<State | null>(null)
    function setJogador(action: (jogador: Jogador) => Jogador) {
        setState((estado) => {
            if (estado == null) return null
            return { ...estado, jogador: action(estado.jogador) }
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
        })
    }, [router])

    useEffect(() => {
        const id = setInterval(() => {
            setState((state) => {
                if (state == null) return null
                return {
                    ...state,
                    jogador: state.partida.personagem.diminuiFome(
                        state.jogador,
                        -5,
                    ),
                }
            })
        }, 60_000)
        return () => clearInterval(id)
    }, [])

    const [efeitos, addEfeito] = useEfeitos<TipoEfeito>()

    const estado = produce(state, (draft) => {
        if (draft == null) return
        // Inclui efeitos ativos
        for (const [_, efeito] of efeitos.entries()) {
            draft.jogador.forca += efeito.forca
            draft.jogador.sagacidade += efeito.sagacidade
        }
    })

    if (estado == null) return null
    return [estado.partida, estado.jogador, setJogador, efeitos, addEfeito]
}
