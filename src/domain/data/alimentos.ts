import { TipoAlimento } from "../entities/Alimento"

type AtributosAlimento = {
    preco: number
    fome: number
}

export const atributosAlimentos: Record<TipoAlimento, AtributosAlimento> = {
    uva: { preco: 1, fome: 3 },
    maca: { preco: 2, fome: 5 },
    banana: { preco: 5, fome: 15 },
    cenoura: { preco: 10, fome: 25 },
    ensopado: { preco: 20, fome: 45 },
    frango: { preco: 50, fome: 95 },
}
