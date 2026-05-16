import { Carteira } from "@/src/domain/entities/Carteira"
import { Jogador } from "@/src/domain/entities/Jogador"
import { Mochila } from "@/src/domain/entities/Mochila"
import { Log } from "./Log"
import { Partida } from "./Partida"
import { Golpe } from "@/src/domain/entities/Golpe"

export type State = {
    partida: Partida
    jogador: Jogador
    carteira: Carteira
    mochila: Mochila
    golpe: Golpe | null
    logs: Log[]
}
