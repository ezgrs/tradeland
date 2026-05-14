import { TipoArmadura } from "./Armadura"
import { Bebida } from "./Bebida"
import { Comida } from "./Comida"
import { JogadorMorreu } from "../errors/JogadorMorreu"
import { atributosArmaduras } from "../data/armaduras"

type EstadoArmadura = { montada: boolean; hp: number }

export class Jogador {
    #hp: number
    #maxHp: number

    #xp: number
    #nivel: number

    #forca: number
    #inteligencia: number

    #fome: number

    #resistencias: Map<TipoArmadura, EstadoArmadura>

    constructor() {
        this.#hp = 100
        this.#xp = 0
        this.#maxHp = 100
        this.#forca = 10
        this.#inteligencia = 0
        this.#nivel = 1
        this.#fome = 0

        this.#resistencias = new Map()
    }

    get hp(): number {
        return this.#hp
    }

    get maxHp(): number {
        return this.#maxHp
    }

    get xp(): number {
        return this.#xp
    }

    get fome(): number {
        return this.#fome
    }

    get forca(): number {
        return this.#forca
    }

    get inteligencia(): number {
        return this.#inteligencia
    }

    get nivel(): number {
        return this.#nivel
    }

    get resistencias(): Map<TipoArmadura, EstadoArmadura> {
        return new Map(this.#resistencias)
    }

    private alteraHp(valor: number) {
        let novoHp = this.#hp + valor
        if (novoHp <= 0) {
            throw new JogadorMorreu()
        }
        if (novoHp > this.#maxHp) {
            novoHp = this.#maxHp
        }
        this.#hp = novoHp
    }

    private alteraFome(valor: number) {
        let novaFome = this.#fome + valor
        if (novaFome >= 100) {
            throw new JogadorMorreu()
        }
        if (novaFome < 0) {
            novaFome = 0
        }
        this.#fome = novaFome
    }

    private alteraXp(valor: number) {
        let novoXp = this.#xp + valor
        if (novoXp < 0) {
            novoXp = 0
        } else if (novoXp >= 100) {
            novoXp %= 100
            this.#nivel += 1
        }
        this.#xp = novoXp
    }

    aumentaXp(valor: number) {
        this.alteraXp(valor)
    }

    recebeDano(dano: number) {
        let danoFinal = dano

        const resistencias = new Map(this.#resistencias)
        for (const [tipoArmadura, estadoArmadura] of this.#resistencias) {
            // Foi adquirida mas não está montada
            if (!estadoArmadura.montada) continue

            const danoArmadura =
                atributosArmaduras[tipoArmadura].protecao * dano
            const novoHpArmadura = estadoArmadura.hp - danoArmadura
            if (novoHpArmadura <= 0) {
                resistencias.delete(tipoArmadura)
            } else {
                resistencias.set(tipoArmadura, {
                    montada: estadoArmadura.montada,
                    hp: novoHpArmadura,
                })
            }
            danoFinal -= danoArmadura
        }
        this.#resistencias = resistencias

        this.alteraHp(-danoFinal)
    }

    come(comida: Comida) {
        this.alteraFome(comida.calculaFomeRestaurada())
    }

    bebe(bebida: Bebida) {
        this.alteraHp(bebida.calculaHPRestaurado())
        this.#forca += bebida.calculaForcaRestaurada()
        this.#inteligencia += bebida.calculaInteligenciaRestaurada()
    }
}
