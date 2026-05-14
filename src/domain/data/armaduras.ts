import { TipoArmadura } from "../entities/Armadura"

type AtributosArmadura = {
    durabilidade: number
    preco: number
    protecao: number
}

export const atributosArmaduras: Record<TipoArmadura, AtributosArmadura> = {
    elmo: {
        durabilidade: 40,
        preco: 400,
        protecao: 0.15,
    },
    peitoral: {
        durabilidade: 100,
        preco: 1000,
        protecao: 0.35,
    },
    calcas: {
        durabilidade: 40,
        preco: 400,
        protecao: 0.15,
    },
    botas: {
        durabilidade: 20,
        preco: 200,
        protecao: 0.5,
    },
}
