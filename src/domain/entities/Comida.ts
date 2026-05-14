import { atributosAlimentos } from "../data/alimentos"
import { TipoAlimento } from "./Alimento"

export interface Comida {
    calculaTipo(): TipoAlimento
    calculaFomeRestaurada(): number
}

export class Alimento implements Comida {
    constructor(private tipo: TipoAlimento) {}

    calculaTipo(): TipoAlimento {
        return this.tipo
    }

    calculaFomeRestaurada(): number {
        return atributosAlimentos[this.tipo].fome
    }
}

export class TemperoAmargo implements Comida {
    constructor(private comida: Comida) {}

    calculaTipo(): TipoAlimento {
        return this.comida.calculaTipo()
    }

    calculaFomeRestaurada(): number {
        return this.comida.calculaFomeRestaurada() * -2
    }
}

export class TemperoDoce implements Comida {
    constructor(private comida: Comida) {}

    calculaTipo(): TipoAlimento {
        return this.comida.calculaTipo()
    }

    calculaFomeRestaurada(): number {
        return this.comida.calculaFomeRestaurada() * 2
    }
}
