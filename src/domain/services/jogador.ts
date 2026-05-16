import { atributosArmaduras } from "../data/armaduras"
import { TipoArmadura } from "../entities/Armadura"
import { Bebida } from "../entities/Bebida"
import { Comida } from "../entities/Comida"
import { EstadoArmadura, Jogador } from "../entities/Jogador"
import { JogadorMorreu } from "../errors/JogadorMorreu"

export interface JogadorListener<R> {
    aumentaXp(jogador: Jogador, valor: number): R
    recebeDano(jogador: Jogador, dano: number): R
    come(jogador: Jogador, comida: Comida): R
}

export interface JogadorController<R> {
    alteraHp(jogador: Jogador, valor: number): R
    alteraFome(jogador: Jogador, valor: number): R
    alteraXp(jogador: Jogador, valor: number): R
}

export class DefaultJogadorListener implements JogadorListener<Jogador> {
    constructor(private controller: JogadorController<Jogador>) {}

    aumentaXp(jogador: Jogador, valor: number): Jogador {
        return this.controller.alteraXp(jogador, valor)
    }

    recebeDano(jogador: Jogador, dano: number): Jogador {
        let danoFinal = dano
        const resistenciasMap = new Map(
            Object.entries(jogador.resistencias).filter(
                (entry): entry is [TipoArmadura, EstadoArmadura] =>
                    entry[1] !== undefined,
            ),
        )
        for (const tipoArmadura of Object.keys(
            jogador.resistencias,
        ) as TipoArmadura[]) {
            const estadoArmadura = jogador.resistencias[tipoArmadura]
            // Ainda não foi adquirida
            if (estadoArmadura == null) continue
            // Foi adquirida mas não está montada
            if (!estadoArmadura.montada) continue

            const danoArmadura =
                atributosArmaduras[tipoArmadura].protecao * dano
            const novoHpArmadura = estadoArmadura.hp - danoArmadura
            if (novoHpArmadura <= 0) {
                resistenciasMap.delete(tipoArmadura)
            } else {
                resistenciasMap.set(tipoArmadura, {
                    montada: estadoArmadura.montada,
                    hp: novoHpArmadura,
                })
            }
            danoFinal -= danoArmadura
        }
        const resistencias: Partial<Record<TipoArmadura, EstadoArmadura>> = {}
        for (const [key, value] of resistenciasMap) {
            resistencias[key] = value
        }
        return this.controller.alteraHp(
            { ...jogador, resistencias: resistencias },
            -danoFinal,
        )
    }

    come(jogador: Jogador, comida: Comida): Jogador {
        return this.controller.alteraFome(
            jogador,
            -comida.calculaFomeRestaurada(),
        )
    }
}

export class DefaultJogadorController implements JogadorController<Jogador> {
    alteraHp(jogador: Jogador, valor: number): Jogador {
        let novoHp = jogador.hp + valor
        if (novoHp <= 0) {
            throw new JogadorMorreu()
        }
        if (novoHp > jogador.maxHp) {
            novoHp = jogador.maxHp
        }
        return { ...jogador, hp: novoHp }
    }

    alteraFome(jogador: Jogador, valor: number): Jogador {
        let novaFome = jogador.fome + valor
        if (novaFome >= 100) {
            throw new JogadorMorreu()
        }
        if (novaFome < 0) {
            novaFome = 0
        }
        return { ...jogador, fome: novaFome }
    }

    alteraXp(jogador: Jogador, valor: number): Jogador {
        let novoXp = jogador.xp + valor
        let novoNivel = jogador.nivel
        if (novoXp < 0) {
            novoXp = 0
        } else if (novoXp >= 100) {
            novoXp %= 100
            novoNivel += 1
        }
        return { ...jogador, xp: novoXp, nivel: novoNivel }
    }
}
