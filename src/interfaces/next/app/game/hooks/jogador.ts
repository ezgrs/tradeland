import { useEffect, useState } from "react"
import { Partida } from "../models/Partida"
import { useRouter } from "next/navigation"
import { produce } from "immer"
import { Efeito, useEfeitos } from "./efeitos"
import { Jogador } from "@/src/domain/entities/Jogador"

type State = {
    jogador: Jogador
    partida: Partida
}
type TipoEfeito = "forca" | "sagacidade"

type Props = {
    createPartida: () => Partida | null
}

export function useJogador(
    props: Props,
):
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
        const partida = props.createPartida()
        if (partida == null) {
            router.replace("/")
            return
        }
        setState({
            partida: partida,
            jogador: partida.personagem.classe.criaJogador(),
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
