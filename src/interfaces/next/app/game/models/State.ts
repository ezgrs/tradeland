import { Carteira } from "@/src/domain/entities/Carteira"
import { Dificuldade } from "@/src/domain/entities/Dificuldade"
import { Jogador } from "@/src/domain/entities/Jogador"
import { Mochila } from "@/src/domain/entities/Mochila"
import { TipoPersonagem } from "@/src/domain/entities/Personagem"
import { Log } from "./Log"

export type State = {
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
