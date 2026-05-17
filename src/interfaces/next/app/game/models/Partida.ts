import { Dificuldade } from "@/src/domain/entities/Dificuldade"
import { Classe } from "@/src/domain/entities/Classe"

export type Partida = {
    nomePersonagem: string
    classePersonagem: Classe
    dificuldade: Dificuldade
}
