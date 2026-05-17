import { useState } from "react"

export function useSacola<K extends string, V>(): [
    Record<K, V[]>,
    (k: K, v: V) => void,
    (k: K) => V,
] {
    const [sacola, setSacola] = useState<Record<string, V[]>>({})
    function addItem(key: K, value: V) {
        setSacola((sacola) => ({
            ...sacola,
            [key]: [...(sacola[key] ?? []), value],
        }))
    }
    function consumeItem(key: K): V {
        const [value, ...itens] = [...sacola[key]]
        setSacola((sacola) => {
            if (itens.length > 0) {
                return { ...sacola, [key]: itens }
            }
            const sacola2 = { ...sacola }
            delete sacola2[key]
            return sacola2
        })
        return value
    }
    return [sacola, addItem, consumeItem]
}
