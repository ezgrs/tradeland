import { Jogador } from "@/src/domain/entities/Jogador"
import { Partida } from "./Partida"
import { Golpe } from "@/src/domain/entities/Golpe"
import { Inimigo } from "@/src/domain/entities/Inimigo"

export type Estado = {
    partida: Partida
    jogador: Jogador
    golpe: Golpe | null
    inimigo: Inimigo | null
}
