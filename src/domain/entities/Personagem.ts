import { Jogador } from "./Jogador"

export interface ComportamentoPersonagem {
    quandoEhCriado(jogador: Jogador): Jogador
    quandoSobeNivel(jogador: Jogador, nivel: number): Jogador
    quandoVenceBatalha(jogador: Jogador): Jogador
    calculaDano(jogador: Jogador, dano: number): number
    listaGolpes(): readonly string[]
}

export const comportamentosPersonagens = {
    curandeiro: {
        quandoEhCriado(jogador: Jogador): Jogador {
            return {
                ...jogador,
                maxHp: jogador.maxHp + 20,
                hp: jogador.maxHp + 20,
            }
        },
        quandoSobeNivel(jogador: Jogador, nivel: number): Jogador {
            const maxHp = Math.min(jogador.maxHp + nivel * 19, nivel * 100)
            return {
                ...jogador,
                hp: Math.min(maxHp, jogador.hp + nivel * 3),
                maxHp: maxHp,
                forca: jogador.forca + 10,
                inteligencia: jogador.inteligencia + 10,
            }
        },
        quandoVenceBatalha(jogador: Jogador): Jogador {
            return {
                ...jogador,
                hp: Math.min(jogador.maxHp, jogador.hp + 3),
                forca: jogador.forca + 1,
            }
        },
        calculaDano(jogador: Jogador, dano: number): number {
            return dano + jogador.forca + jogador.hp / 10
        },
        listaGolpes() {
            return [
                "claraoLuz",
                "nevoaLacrimejante",
                "raioFogo",
                "penitencia",
                "choqueSagrado",
                "curaReversa",
            ] as const
        },
    },
    gladiador: {
        quandoEhCriado(jogador: Jogador): Jogador {
            return {
                ...jogador,
                forca: jogador.forca + 20,
            }
        },
        quandoSobeNivel(jogador: Jogador, nivel: number): Jogador {
            return {
                ...jogador,
                maxHp: Math.min(jogador.maxHp + nivel * 19, nivel * 100),
                forca: jogador.forca + nivel * 3,
                inteligencia: jogador.inteligencia + 10,
            }
        },
        quandoVenceBatalha(jogador: Jogador): Jogador {
            return {
                ...jogador,
                forca: jogador.forca + 3,
            }
        },
        calculaDano(jogador: Jogador, dano: number): number {
            return dano + jogador.forca + jogador.forca / 10
        },
        listaGolpes() {
            return [
                "socoParalisante",
                "picadaAbelha",
                "avalancheManual",
                "golpeCauterizador",
                "murroAflicao",
                "apunhaladaMortal",
            ] as const
        },
    },
    mago: {
        quandoEhCriado(jogador: Jogador): Jogador {
            return {
                ...jogador,
                inteligencia: jogador.inteligencia + 20,
            }
        },
        quandoSobeNivel(jogador: Jogador, nivel: number): Jogador {
            return {
                ...jogador,
                maxHp: Math.min(jogador.maxHp + nivel * 19, nivel * 100),
                forca: jogador.forca + 10,
                inteligencia: jogador.inteligencia + nivel * 3,
            }
        },
        quandoVenceBatalha(jogador: Jogador): Jogador {
            return {
                ...jogador,
                forca: jogador.forca + 1,
                inteligencia: jogador.inteligencia + 3,
            }
        },
        calculaDano(jogador: Jogador, dano: number): number {
            return dano + jogador.forca + jogador.inteligencia / 10
        },
        listaGolpes() {
            return [
                "raioEnergia",
                "espinhosMagicos",
                "rajadaFogo",
                "trovaoIncandescente",
                "explosaoMistica",
                "soproDragao",
            ] as const
        },
    },
} as const satisfies Record<string, ComportamentoPersonagem>

export type TipoPersonagem = keyof typeof comportamentosPersonagens
export type TipoGolpe<T extends TipoPersonagem> = ReturnType<
    (typeof comportamentosPersonagens)[T]["listaGolpes"]
>[number]
