import { IconToolsKitchen2, IconMug } from "@tabler/icons-react"
import { Button } from "../../../components/ui/button"
import { Card, CardHeader, CardTitle } from "../../../components/ui/card"
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "../../../components/ui/table"
import { TipoPocao } from "@/src/domain/entities/Pocao"
import { TipoAlimento } from "@/src/domain/entities/Alimento"
import { Espolio } from "@/src/domain/entities/Espolio"
import { Mochila } from "@/src/domain/entities/Mochila"
import { Comida } from "@/src/domain/entities/Comida"
import { Bebida } from "@/src/domain/entities/Bebida"

const labelsEspolios: Record<Espolio["id"], string> = {
    escamaDragao: "Escama de dragão",
    salivaDragao: "Saliva de dragão",
    caudaDragao: "Cauda de dragão",
    asaDragao: "Asa de dragão",
    chifreDragao: "Chifre de dragão",
    pataDragao: "Pata de dragão",
    narinaDragao: "Narina de dragão",
    coracaoTrasgo: "Coração de trasgo",
    peleTrasgo: "Pele de trasgo",
    orelhaTrasgo: "Orelha de trasgo",
    tangaTrasgo: "Tango de trasgo",
    unhaTrasgo: "Unha de trasgo",
    bastaoTrasgo: "Bastão de trasgo",
    toucaTrasgo: "Touca de trasgo",
    dedoOgro: "Dedo de ogro",
    peloOgro: "Pelo de ogro",
    carcacaOgro: "Carcaça de ogro",
    peleOgro: "Pele de ogro",
    orelhaOgro: "Orelha de ogro",
    gorduraOgro: "Gordura de ogro",
    sobrancelhaOgro: "Sobrancelha de ogro",
    olhoGigante: "Olho de gigante",
    melecaGigante: "Meleca de gigante",
    couroGigante: "Couro de gigante",
    peleGigante: "Pele de gigante",
    tangaGigante: "Tanga de gigante",
    sangueGigante: "Sangue de gigante",
    barbaGigante: "Barba de gigante",
    varinhaBruxa: "Varinha de bruxa",
    chapeuBruxa: "Chapéu de bruxa",
    cabeloBruxa: "Cabelo de bruxa",
    narizBruxa: "Nariz de bruxa",
    vassouraBruxa: "Vassoura de bruxa",
    verrugaBruxa: "Verruga de bruxa",
    colarBruxa: "Colar de bruxa",
    cabecaVampiro: "Cabeça de vampiro",
    denteVampiro: "Dente de vampiro",
    capaVampiro: "Capa de vampiro",
    peleVampiro: "Pele de vampiro",
    sangueVampiro: "Sangue de vampiro",
    pingenteVampiro: "Pingente de vampiro",
    linguaVampiro: "Língua de vampiro",
}
const labelsComidas: Record<TipoAlimento, string> = {
    uva: "Uva",
    maca: "Maçã",
    banana: "Banana",
    cenoura: "Cenoura",
    ensopado: "Ensopado",
    frango: "Frango",
}
const labelsPocoes: Record<TipoPocao, string> = {
    vida: "Vida",
    sagacidade: "Sagacidade",
    forca: "Força",
}

type Props = {
    mochila: Mochila
}

type RowValue<K, V> = { tipo: K; valores: V[] } | null

type Row = {
    espolio: RowValue<Espolio["id"], Espolio>
    comida: RowValue<TipoAlimento, Comida>
    bebida: RowValue<TipoPocao, Bebida>
}

export function InventorySection(props: Props) {
    const itensEspolios = [...Object.entries(props.mochila.espolios)]
    const itensComidas = [...Object.entries(props.mochila.comidas)]
    const itensBebidas = [...Object.entries(props.mochila.bebidas)]
    const rowCount = Math.max(
        itensEspolios.length,
        itensComidas.length,
        itensBebidas.length,
    )
    const rows: Row[] = Array.from({ length: rowCount }, (_, i) => {
        const itemEspolio = itensEspolios[i]
        const itemComida = itensComidas[i]
        const itemBebida = itensBebidas[i]
        return {
            espolio:
                itemEspolio == null
                    ? null
                    : {
                          tipo: itemEspolio[0] as Espolio["id"],
                          valores: itemEspolio[1],
                      },
            comida:
                itemComida == null
                    ? null
                    : {
                          tipo: itemComida[0] as TipoAlimento,
                          valores: itemComida[1],
                      },
            bebida:
                itemBebida == null
                    ? null
                    : {
                          tipo: itemBebida[0] as TipoPocao,
                          valores: itemBebida[1],
                      },
        }
    })
    return (
        <Card className="overflow-hidden border-slate-800 bg-slate-900">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800 px-6 py-1">
                <CardTitle className="text-sm font-medium tracking-wider text-slate-400 uppercase">
                    Inventário
                </CardTitle>
            </CardHeader>
            <Table>
                <TableHeader className="bg-slate-800/50">
                    <TableRow className="border-slate-800 hover:bg-transparent">
                        <TableHead className="pl-6 text-xs font-bold text-slate-300 uppercase">
                            Espólio
                        </TableHead>
                        <TableHead className="px-0 text-xs font-bold text-slate-300 uppercase">
                            Comida
                        </TableHead>
                        <TableHead className="px-0 text-xs font-bold text-slate-300 uppercase">
                            Poção
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((row, index) => {
                        const dadosEspolio = row.espolio
                        const dadosComida = row.comida
                        const dadosBebida = row.bebida
                        return (
                            <TableRow
                                key={index}
                                className="border-slate-800 hover:bg-slate-800/20"
                            >
                                <TableCell className="pl-6 font-medium text-slate-400">
                                    {dadosEspolio != null &&
                                        labelsEspolios[dadosEspolio.tipo]}
                                </TableCell>
                                <TableCell className="px-0">
                                    {dadosComida != null && (
                                        <div className="flex items-center gap-4">
                                            <span className="font-medium text-slate-400">
                                                {
                                                    labelsComidas[
                                                        dadosComida.tipo
                                                    ]
                                                }
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-7 border-slate-700 bg-slate-950 px-2 text-[10px] uppercase hover:bg-orange-950 hover:text-orange-400"
                                            >
                                                <IconToolsKitchen2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell className="px-0">
                                    {dadosBebida != null && (
                                        <div className="flex items-center gap-4">
                                            <span className="font-medium text-slate-400">
                                                {labelsPocoes[dadosBebida.tipo]}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-7 border-slate-700 bg-slate-950 px-2 text-[10px] uppercase hover:bg-blue-950 hover:text-blue-400"
                                            >
                                                <IconMug className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </Card>
    )
}
