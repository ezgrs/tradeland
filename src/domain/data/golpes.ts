import { TipoPersonagem } from "../entities/Personagem"

export const tiposGolpes = {
    curandeiro: [
        "claraoLuz",
        "nevoaLacrimejante",
        "rajadaFogo",
        "penitencia",
        "choqueSagrado",
        "curaReversa",
    ],
    gladiador: [
        "socoParalisante",
        "picadaAbelha",
        "avalancheManual",
        "golpeCauterizador",
        "murroAflicao",
        "apunhaladaMortal",
    ],
    mago: [
        "raioEnergia",
        "espinhosMagicos",
        "rajadaFogo",
        "trovaoIncandescente",
        "explosaoMistica",
        "soproDragao",
    ],
} as const satisfies Record<TipoPersonagem, string[]>

export type TipoGolpe<T extends TipoPersonagem> =
    (typeof tiposGolpes)[T][number]
