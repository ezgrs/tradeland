import { ClasseGolpe } from "../entities/Golpe"
import { TipoPersonagem } from "../entities/Personagem"

export const tiposGolpes: Record<
    TipoPersonagem,
    Record<ClasseGolpe, string>
> = {
    curandeiro: {
        2: "claraoLuz",
        4: "nevoaLacrimejante",
        8: "rajadaFogo",
        16: "penitencia",
        32: "choqueSagrado",
        64: "curaReversa",
    },
    gladiador: {
        2: "socoParalisante",
        4: "picadaAbelha",
        8: "avalancheManual",
        16: "golpeCauterizador",
        32: "murroAflicao",
        64: "apunhaladaMortal",
    },
    mago: {
        2: "raioEnergia",
        4: "espinhosMagicos",
        8: "rajadaFogo",
        16: "trovaoIncandescente",
        32: "explosaoMistica",
        64: "soproDragao",
    },
}
