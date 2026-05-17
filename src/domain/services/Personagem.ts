import { atributosArmaduras } from "../data/armaduras"
import { TipoArmadura } from "../entities/Armadura"
import { Classe } from "../entities/Classe"
import { EstadoArmadura, Jogador } from "../entities/Jogador"
import { JogadorMorreu } from "../errors/JogadorMorreu"

type Args = {
    nome: string
    classe: Classe
}

export class Personagem {
    public readonly nome: string
    public readonly classe: Classe

    constructor(args: Args) {
        this.nome = args.nome
        this.classe = args.classe
    }

    aumentaHp(jogador: Jogador, valor: number): Jogador {
        let novoHp = jogador.hp + valor
        if (novoHp <= 0) {
            throw new JogadorMorreu()
        }
        return { ...jogador, hp: Math.min(jogador.maxHp, novoHp) }
    }

    aumentaXp(jogador: Jogador, valor: number): Jogador {
        let novoXp = jogador.xp + valor
        if (novoXp < 0) {
            return { ...jogador, xp: 0 }
        }
        if (novoXp >= 100) {
            return this.classe.evoluiNivel({
                ...jogador,
                xp: novoXp % 100,
                nivel: jogador.nivel + 1,
            })
        }
        return { ...jogador, xp: novoXp }
    }

    diminuiFome(jogador: Jogador, valor: number): Jogador {
        let novaFome = jogador.fome - valor
        if (novaFome >= 100) {
            throw new JogadorMorreu()
        }
        return { ...jogador, fome: Math.max(0, novaFome) }
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
        return this.aumentaHp(
            { ...jogador, resistencias: resistencias },
            -danoFinal,
        )
    }
}
