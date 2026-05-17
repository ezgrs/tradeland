import { useState } from "react"

export function useCarteira(): [number, (amount: number) => void] {
    const [carteira, setCarteira] = useState(0)
    function addAmount(value: number) {
        setCarteira((carteira) => carteira + value)
    }
    return [carteira, addAmount]
}
