import { Habilidade } from "./Habilidade"
import { Bebida } from "./Bebida"
import { Comida } from "./Comida"
import { TipoAlimento } from "./Alimento"
import { TipoPocao } from "./Pocao"

type Item =
    | { tipo: "alimento"; valor: Comida }
    | { tipo: "bebida"; valor: Bebida }

export class Mochila {
    private comidas: Map<TipoAlimento, Comida[]>
    private bebidas: Map<TipoPocao, Bebida[]>
    private habilidades: Array<Habilidade>

    constructor() {
        this.comidas = new Map()
        this.bebidas = new Map()
        this.habilidades = []
    }

    adicionaItem(item: Item) {
        switch (item.tipo) {
            case "alimento":
                const tipoAlimento = item.valor.calculaTipo()
                const comidas = this.comidas.get(tipoAlimento) ?? []
                this.comidas.set(tipoAlimento, [...comidas, item.valor])
                break
            case "bebida":
                const tipoPocao = item.valor.calculaTipo()
                const bebidas = this.bebidas.get(tipoPocao) ?? []
                this.bebidas.set(tipoPocao, [...bebidas, item.valor])
                break
        }
    }
}
