import { TipoInimigo } from "./Inimigo"

type ClasseEspolio = "a" | "b" | "c"

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

type T_ = keyof typeof espolios

type Espolio = {
    [E in T_]: {
        [C in keyof (typeof espolios)[E]]: {
            enemy: E
            type: C
            name: ElementOf<(typeof espolios)[E][C]>
        }
    }[keyof (typeof espolios)[E]]
}[T_]
