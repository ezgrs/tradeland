import { TipoPocao } from "../entities/Pocao"

export type AtributosPocao = {
    preco: number
    hp: number
    forca: number
    inteligencia: number
}

export const atributosPocoes: Record<TipoPocao, AtributosPocao> = {
    vida: {
        preco: 20,
        hp: 30,
        forca: 0,
        inteligencia: 0,
    },
    inteligencia: {
        preco: 30,
        hp: 0,
        forca: 0,
        inteligencia: 30,
    },
    forca: {
        preco: 50,
        hp: 0,
        forca: 20,
        inteligencia: 0,
    },
}
