import { useEffect, useState } from "react"

type Efeito = {
    forca: number
    sagacidade: number
    tempo: number
}

export function useEfeitos<T>(): [
    Map<T, Efeito>,
    (value: T, efeito: Efeito) => void,
] {
    const [efeitos, setEfeitos] = useState<Map<T, Efeito>>(new Map())
    const hasEfeitos = efeitos.size > 0
    useEffect(() => {
        if (!hasEfeitos) return
        const id = setInterval(() => {
            setEfeitos((efeitos) => {
                const updatedEfeitos = new Map(efeitos)
                for (const [tipoEfeito, efeito] of efeitos.entries()) {
                    const novoTempo = efeito.tempo - 1
                    if (novoTempo <= 0) {
                        updatedEfeitos.delete(tipoEfeito)
                    } else {
                        updatedEfeitos.set(tipoEfeito, {
                            ...efeito,
                            tempo: novoTempo,
                        })
                    }
                }
                return updatedEfeitos
            })
        }, 1_000)
        return () => clearInterval(id)
    }, [hasEfeitos])

    function addEfeito(value: T, efeito: Efeito) {
        setEfeitos((efeitos) => new Map(efeitos).set(value, efeito))
    }

    return [efeitos, addEfeito]
}
