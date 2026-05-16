export type TipoInimigo =
    | "dragao"
    | "trasgo"
    | "ogro"
    | "gigante"
    | "bruxa"
    | "vampiro"

export type Inimigo = {
    tipo: TipoInimigo
    nivel: number
    hp: number
    maxHp: number
    forca: number
}
