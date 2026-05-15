import { TipoInimigo } from "./Inimigo"

export type ClasseEspolio = "a" | "b" | "c"

export const espolios = {
    dragao: {
        a: ["escama"],
        b: ["saliva", "cauda"],
        c: ["asa", "chifre", "pata", "narina"],
    },
    trasgo: {
        a: ["coracao"],
        b: ["pele", "orelha"],
        c: ["tanga", "unha", "bastao", "touca"],
    },
    ogro: {
        a: ["dedo"],
        b: ["pelo", "carcaca"],
        c: ["pele", "gordura", "orelha", "sobrancelha"],
    },
    gigante: {
        a: ["olho"],
        b: ["meleca", "couro"],
        c: ["sangue", "pele", "tanga", "barba"],
    },
    bruxa: {
        a: ["varinha"],
        b: ["chapeu", "cabelo"],
        c: ["nariz", "vassoura", "verruga", "colar"],
    },
    vampiro: {
        a: ["cabeca"],
        b: ["dente", "capa"],
        c: ["pingente", "lingua", "sangue", "pele"],
    },
} as const satisfies Record<
    TipoInimigo,
    Record<ClasseEspolio, readonly string[]>
>

type ElementOf<T> = T extends readonly (infer U)[] ? U : never

export type EspolioInimigoQualificado<
    E extends TipoInimigo,
    C extends ClasseEspolio,
> = {
    [N in ElementOf<(typeof espolios)[E][C]> & string]: {
        id: `${N}${Capitalize<E & string>}`
        tipoInimigo: E
        classe: C
        tipo: N
    }
}[ElementOf<(typeof espolios)[E][C]> & string]

export type EspolioInimigo<E extends TipoInimigo> = {
    [C in ClasseEspolio]: EspolioInimigoQualificado<E, C>
}[ClasseEspolio]

export type Espolio = {
    [E in TipoInimigo]: EspolioInimigo<E>
}[TipoInimigo]
