import { atributosAlimentos } from "../data/alimentos"
import { TipoAlimento } from "./Alimento"

type TipoTempero = "amargo" | "doce"

export interface Comida {
    calculaTipo(): TipoAlimento
    calculaTempero(): TipoTempero | null
    calculaFomeRestaurada(): number
}

export class Alimento implements Comida {
    constructor(private tipo: TipoAlimento) {}

    calculaTipo(): TipoAlimento {
        return this.tipo
    }

    calculaTempero(): TipoTempero | null {
        return null
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

    calculaTempero(): TipoTempero | null {
        return "amargo"
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

    calculaTempero(): TipoTempero | null {
        return "doce"
    }

    calculaFomeRestaurada(): number {
        return this.comida.calculaFomeRestaurada() * 2
    }
}
