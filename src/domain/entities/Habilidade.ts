import { ClasseGolpe } from "./Golpe"

export interface Habilidade {
    calculaDanoInfligido(): number
}

export class Ataque implements Habilidade {
    constructor(private classe: ClasseGolpe) {}

    calculaDanoInfligido(): number {
        return {
            2: 20,
            4: 30,
            8: 40,
            16: 50,
            32: 60,
            64: 70,
        }[this.classe]
    }
}
