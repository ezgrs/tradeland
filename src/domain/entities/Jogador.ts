import { TipoArmadura } from "./Armadura"

export type EstadoArmadura = { montada: boolean; hp: number }

export type Jogador = {
    hp: number
    maxHp: number
    xp: number
    nivel: number
    forca: number
    sagacidade: number
    fome: number
    resistencias: Partial<Record<TipoArmadura, EstadoArmadura>>
}
