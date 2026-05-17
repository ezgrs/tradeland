import { Jogador } from "@/src/domain/entities/Jogador"
import { Partida } from "./Partida"

export type Estado = {
    partida: Partida
    jogador: Jogador
}
