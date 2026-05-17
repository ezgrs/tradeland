import { TipoAlimento } from "../entities/Alimento"
import {
    Bebida,
    ElixirForca,
    ElixirSagacidade,
    ElixirVida,
    Pocao,
} from "../entities/Bebida"
import { Probabilidade } from "../entities/Probabilidade"
import {
    Alimento,
    Comida,
    TemperoAmargo,
    TemperoDoce,
} from "../entities/Comida"
import { ClasseEspolio, Espolio, espolios } from "../entities/Espolio"
import { TipoInimigo } from "../entities/Inimigo"
import { TipoPocao } from "../entities/Pocao"
import { Classe } from "../entities/Classe"

type AchadoBau = { tipo: "bau"; item: ItemBau }
type AchadoInimigo = {
    tipo: "inimigo"
    tipoInimigo: TipoInimigo
    recompensa: Espolio | null
}
export type AchadoPasseio = AchadoBau | AchadoInimigo

type ComidaBau = { tipo: "comida"; comida: Comida }
type BebidaBau = { tipo: "bebida"; bebida: Bebida }
type DinheiroBau = { tipo: "dinheiro"; moedas: number }
type ItemBau = ComidaBau | BebidaBau | DinheiroBau

export function executaPasseio(
    probabilidade: Probabilidade,
    classe: Classe,
): AchadoPasseio {
    const tipoAchado = probabilidade.porChaves<AchadoPasseio["tipo"]>({
        bau: 3,
        inimigo: 1,
    })
    switch (tipoAchado) {
        case "bau":
            const tipoItemBau = probabilidade.porChaves<ItemBau["tipo"]>({
                comida: 10,
                bebida: 7,
                dinheiro: 7,
            })
            switch (tipoItemBau) {
                case "comida":
                    const comida: Comida = new Alimento(
                        probabilidade.porChaves<TipoAlimento>({
                            uva: 6,
                            maca: 5,
                            banana: 4,
                            cenoura: 3,
                            ensopado: 2,
                            frango: 1,
                        }),
                    )
                    const onTempero = probabilidade.porItens<
                        (comida: Comida) => Comida
                    >([
                        { peso: 2, valor: (comida) => comida },
                        {
                            peso: 1,
                            valor: (comida) => new TemperoAmargo(comida),
                        },
                        { peso: 1, valor: (comida) => new TemperoDoce(comida) },
                    ])
                    return {
                        tipo: tipoAchado,
                        item: { tipo: tipoItemBau, comida: onTempero(comida) },
                    }
                case "bebida":
                    const bebida: Bebida = new Pocao(
                        probabilidade.porChaves<TipoPocao>({
                            vida: 3,
                            sagacidade: 1,
                            forca: 1,
                        }),
                    )
                    const onElixir = probabilidade.porItens<
                        (comida: Bebida) => Bebida
                    >([
                        { peso: 2, valor: (bebida) => bebida },
                        {
                            peso: 1,
                            valor: classe.criaElixir,
                        },
                    ])
                    return {
                        tipo: tipoAchado,
                        item: { tipo: tipoItemBau, bebida: onElixir(bebida) },
                    }
                case "dinheiro":
                    return {
                        tipo: tipoAchado,
                        item: {
                            tipo: tipoItemBau,
                            moedas: probabilidade.porIntervaloNumerico(1, 30),
                        },
                    }
            }
        case "inimigo":
            const tipoInimigo = probabilidade.porChaves<TipoInimigo>({
                dragao: 1,
                trasgo: 1,
                ogro: 1,
                gigante: 1,
                bruxa: 1,
                vampiro: 1,
            })
            const possuiRecompensa = probabilidade.porItens<boolean>([
                { valor: true, peso: 1 },
                { valor: false, peso: 1 },
            ])
            let recompensa: Espolio | null = null
            if (possuiRecompensa) {
                const classeEspolio = probabilidade.porChaves<ClasseEspolio>({
                    c: 3,
                    b: 2,
                    a: 1,
                })
                const espoliosPossiveis = espolios[tipoInimigo][classeEspolio]
                const nomeEspolio = probabilidade.porItens(
                    espoliosPossiveis.map((nomeEspolio) => ({
                        peso: 1,
                        valor: nomeEspolio,
                    })),
                )
                const dadosRecompensa: Omit<Espolio, "id"> = {
                    tipoInimigo: tipoInimigo,
                    classe: classeEspolio,
                    tipo: nomeEspolio,
                }
                recompensa = {
                    ...dadosRecompensa,
                    id:
                        nomeEspolio +
                        tipoInimigo.charAt(0).toUpperCase() +
                        tipoInimigo.slice(1),
                } as Espolio
            }
            return {
                tipo: tipoAchado,
                tipoInimigo: tipoInimigo,
                recompensa: recompensa,
            }
    }
}
