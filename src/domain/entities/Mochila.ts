import { Bebida } from "./Bebida"
import { Comida } from "./Comida"
import { TipoAlimento } from "./Alimento"
import { TipoPocao } from "./Pocao"
import { Espolio } from "./Espolio"

export type Mochila = {
    comidas: Partial<Record<TipoAlimento, Comida[]>>
    bebidas: Partial<Record<TipoPocao, Bebida[]>>
    espolios: Partial<Record<Espolio["id"], Espolio[]>>
}
