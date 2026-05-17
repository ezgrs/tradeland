import { Dificuldade } from "@/src/domain/entities/Dificuldade"
import { Personagem } from "@/src/domain/services/Personagem"

export type Partida = {
    personagem: Personagem
    dificuldade: Dificuldade
}
