import { produce } from "immer"
import { AtributosPocao, atributosPocoes } from "../data/pocoes"
import { TipoPocao } from "./Pocao"

type TipoElixir = "forca" | "vida" | "sagacidade"

export interface Bebida {
    calculaTipo(): TipoPocao
    calculaTipoElixir(): TipoElixir | null
    calculaAtributos(): AtributosPocao
}

export class Pocao implements Bebida {
    constructor(private tipo: TipoPocao) {}

    calculaTipo(): TipoPocao {
        return this.tipo
    }

    calculaTipoElixir(): TipoElixir | null {
        return null
    }

    calculaAtributos(): AtributosPocao {
        return atributosPocoes[this.tipo]
    }
}

export class ElixirForca implements Bebida {
    constructor(private bebida: Bebida) {}

    calculaTipo(): TipoPocao {
        return this.bebida.calculaTipo()
    }

    calculaTipoElixir(): TipoElixir | null {
        return "forca"
    }

    calculaAtributos(): AtributosPocao {
        return produce(this.bebida.calculaAtributos(), (draft) => {
            draft.forca += 20
        })
    }
}

export class ElixirSagacidade implements Bebida {
    constructor(private bebida: Bebida) {}

    calculaTipo(): TipoPocao {
        return this.bebida.calculaTipo()
    }

    calculaTipoElixir(): TipoElixir | null {
        return "sagacidade"
    }

    calculaAtributos(): AtributosPocao {
        return produce(this.bebida.calculaAtributos(), (draft) => {
            draft.sagacidade += 20
        })
    }
}

export class ElixirVida implements Bebida {
    constructor(private bebida: Bebida) {}

    calculaTipo(): TipoPocao {
        return this.bebida.calculaTipo()
    }

    calculaTipoElixir(): TipoElixir | null {
        return "vida"
    }

    calculaAtributos(): AtributosPocao {
        return produce(this.bebida.calculaAtributos(), (draft) => {
            draft.hp += 20
        })
    }
}
