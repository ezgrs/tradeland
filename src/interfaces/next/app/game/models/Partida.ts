import { Dificuldade } from "@/src/domain/entities/Dificuldade"
import { TipoPersonagem } from "@/src/domain/entities/Personagem"

export type Partida = {
    nomePersonagem: string
    tipoPersonagem: TipoPersonagem
    dificuldade: Dificuldade
}
