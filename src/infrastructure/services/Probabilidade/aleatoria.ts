import { Probabilidade } from "@/src/domain/entities/Probabilidade"

export class ProbabilidadeAleatoria implements Probabilidade {
    porChaves<T extends string>(pesos: Record<T, number>): T {
        const entries = Object.entries(pesos) as [T, number][]
        return this.porItens(entries.map(([valor, peso]) => ({ valor, peso })))
    }

    porItens<T>(pesos: { valor: T; peso: number }[]): T {
        const total = pesos.reduce((sum, p) => sum + p.peso, 0)

        if (total <= 0) {
            throw new Error("Total de pesos deve ser maior que zero")
        }

        let random = Math.random() * total
        for (const item of pesos) {
            random -= item.peso
            if (random <= 0) {
                return item.valor
            }
        }
        return pesos[pesos.length - 1].valor
    }

    porIntervaloNumerico(min: number, max: number): number {
        if (max < min) {
            throw new Error("max deve ser >= min")
        }
        return Math.floor(Math.random() * (max - min + 1)) + min
    }
}
