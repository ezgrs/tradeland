import { useEffect, useState } from "react"
import { Estado } from "../models/Estado"
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

    if (estado == null) return null
    return [estado, setEstado, efeitos, addEfeito]
}
