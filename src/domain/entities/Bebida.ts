import { atributosPocoes } from "../data/pocoes"
import { TipoPocao } from "./Pocao"

export interface Bebida {
    calculaTipo(): TipoPocao
    calculaHPRestaurado(): number
    calculaInteligenciaRestaurada(): number
    calculaForcaRestaurada(): number
}

export class Pocao implements Bebida {
    constructor(private tipo: TipoPocao) {}

    calculaTipo(): TipoPocao {
        return this.tipo
    }

    calculaHPRestaurado(): number {
        return atributosPocoes[this.tipo].hp
    }

    calculaInteligenciaRestaurada(): number {
        return atributosPocoes[this.tipo].inteligencia
    }

    calculaForcaRestaurada(): number {
        return atributosPocoes[this.tipo].forca
    }
}

export class ElixirForca implements Bebida {
    constructor(private bebivel: Bebida) {}

    calculaTipo(): TipoPocao {
        return this.bebivel.calculaTipo()
    }

    calculaHPRestaurado(): number {
        return this.bebivel.calculaHPRestaurado()
    }

    calculaInteligenciaRestaurada(): number {
        return this.bebivel.calculaInteligenciaRestaurada()
    }

    calculaForcaRestaurada(): number {
        return this.bebivel.calculaForcaRestaurada() + 20
    }
}

export class ElixirInteligencia implements Bebida {
    constructor(private bebida: Bebida) {}

    calculaTipo(): TipoPocao {
        return this.bebida.calculaTipo()
    }

    calculaHPRestaurado(): number {
        return this.bebida.calculaHPRestaurado()
    }

    calculaInteligenciaRestaurada(): number {
        return this.bebida.calculaInteligenciaRestaurada() + 20
    }

    calculaForcaRestaurada(): number {
        return this.bebida.calculaForcaRestaurada()
    }
}

export class ElixirVida implements Bebida {
    constructor(private bebida: Bebida) {}

    calculaTipo(): TipoPocao {
        return this.bebida.calculaTipo()
    }

    calculaHPRestaurado(): number {
        return this.bebida.calculaHPRestaurado() + 20
    }

    calculaInteligenciaRestaurada(): number {
        return this.bebida.calculaInteligenciaRestaurada()
    }

    calculaForcaRestaurada(): number {
        return this.bebida.calculaForcaRestaurada()
    }
}
