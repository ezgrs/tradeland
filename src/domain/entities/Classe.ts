import { Bebida, ElixirForca, ElixirSagacidade, ElixirVida } from "./Bebida"
import { Golpe } from "./Golpe"
import { Jogador } from "./Jogador"

export interface Classe {
    criaJogador(): Jogador
    calculaDano(jogador: Jogador, danoGolpe: number): number
    evoluiNivel(jogador: Jogador): Jogador
    evoluiBatalha(jogador: Jogador): Jogador
    criaElixir(bebida: Bebida): Bebida
    nomeiaGolpe(golpe: Golpe): string
}

export class ClassePadrao implements Classe {
    criaJogador(): Jogador {
        const maxHp = 100
        return {
            hp: maxHp,
            maxHp: maxHp,
            forca: 10,
            sagacidade: 0,
            nivel: 1,
            fome: 0,
            xp: 0,
            resistencias: {},
        }
    }

    calculaDano(_: Jogador, danoGolpe: number): number {
        return danoGolpe
    }

    evoluiNivel(jogador: Jogador): Jogador {
        const nivel = jogador.nivel
        return {
            ...jogador,
            maxHp: Math.min(jogador.maxHp + nivel * 19, nivel * 100),
        }
    }

    evoluiBatalha(jogador: Jogador): Jogador {
        return { ...jogador, forca: jogador.forca + 1 }
    }

    criaElixir(bebida: Bebida): Bebida {
        return bebida
    }

    nomeiaGolpe(_: Golpe): string {
        return "Ataque padrão"
    }
}

export class ClasseCurandeiro implements Classe {
    constructor(private classe: Classe) {}

    criaJogador(): Jogador {
        const jogador = this.classe.criaJogador()
        return {
            ...jogador,
            maxHp: jogador.maxHp + 20,
            hp: jogador.maxHp + 20,
        }
    }

    calculaDano(jogador: Jogador, danoGolpe: number): number {
        return (
            this.classe.calculaDano(jogador, danoGolpe) +
            jogador.forca / 10 +
            jogador.hp / 3
        )
    }

    evoluiNivel(jogador_: Jogador): Jogador {
        const jogador = this.classe.evoluiNivel(jogador_)
        return {
            ...jogador,
            maxHp: jogador.maxHp,
            forca: jogador.forca + 10,
            sagacidade: jogador.sagacidade + 10,
        }
    }

    evoluiBatalha(jogador_: Jogador): Jogador {
        const jogador = this.classe.evoluiBatalha(jogador_)
        return { ...jogador, hp: Math.min(jogador.maxHp, jogador.hp + 3) }
    }

    criaElixir(bebida: Bebida): Bebida {
        return new ElixirVida(bebida)
    }

    nomeiaGolpe(golpe: Golpe): string {
        return {
            lvl1: "Clarão de luz",
            lvl2: "Névoa lacrimejante",
            lvl3: "Raio de fogo",
            lvl4: "Penitência",
            lvl5: "Choque sagrado",
            lvl6: "Cura reversa",
        }[golpe]
    }
}

export class ClasseGladiador implements Classe {
    constructor(private classe: Classe) {}

    criaJogador(): Jogador {
        const jogador = this.classe.criaJogador()
        return {
            ...jogador,
            forca: jogador.forca + 20,
        }
    }

    calculaDano(jogador: Jogador, danoGolpe: number): number {
        return (
            this.classe.calculaDano(jogador, danoGolpe) +
            jogador.forca / 10 +
            jogador.forca / 5
        )
    }

    evoluiNivel(jogador_: Jogador): Jogador {
        const jogador = this.classe.evoluiNivel(jogador_)
        return {
            ...jogador,
            forca: jogador.forca + jogador.nivel * 3,
            sagacidade: jogador.sagacidade + 10,
        }
    }

    evoluiBatalha(jogador_: Jogador): Jogador {
        const jogador = this.classe.evoluiBatalha(jogador_)
        return { ...jogador, forca: jogador.forca + 2 }
    }

    criaElixir(bebida: Bebida): Bebida {
        return new ElixirForca(bebida)
    }

    nomeiaGolpe(golpe: Golpe): string {
        return {
            lvl1: "Soco paralisante",
            lvl2: "Picada de abelha",
            lvl3: "Avalanche manual",
            lvl4: "Golpe cauterizador",
            lvl5: "Murro da aflição",
            lvl6: "Apunhalada mortal",
        }[golpe]
    }
}

export class ClasseMago implements Classe {
    constructor(private classe: Classe) {}

    criaJogador(): Jogador {
        const jogador = this.classe.criaJogador()
        return {
            ...jogador,
            sagacidade: jogador.sagacidade + 20,
        }
    }

    calculaDano(jogador: Jogador, danoGolpe: number): number {
        return (
            this.classe.calculaDano(jogador, danoGolpe) +
            jogador.forca / 10 +
            jogador.sagacidade / 3
        )
    }

    evoluiNivel(jogador_: Jogador): Jogador {
        const jogador = this.classe.evoluiNivel(jogador_)
        return {
            ...jogador,
            forca: jogador.forca + 10,
            sagacidade: jogador.sagacidade + jogador.nivel * 3,
        }
    }

    evoluiBatalha(jogador_: Jogador): Jogador {
        const jogador = this.classe.evoluiBatalha(jogador_)
        return { ...jogador, sagacidade: jogador.sagacidade + 3 }
    }

    criaElixir(bebida: Bebida): Bebida {
        return new ElixirSagacidade(bebida)
    }

    nomeiaGolpe(golpe: Golpe): string {
        return {
            lvl1: "Raio de energia",
            lvl2: "Espinhos mágicos",
            lvl3: "Rajada de fogo",
            lvl4: "Trovão incandescente",
            lvl5: "Explosão mística",
            lvl6: "Sopro do dragão",
        }[golpe]
    }
}
