export interface Probabilidade {
    porChaves<T extends string>(pesos: Record<T, number>): T
    porItens<T>(pesos: { valor: T; peso: number }[]): T
    porIntervaloNumerico(min: number, max: number): number
}
