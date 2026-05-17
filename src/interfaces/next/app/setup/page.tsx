"use client"

import { Button } from "../../components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
} from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/ui/select"
import { Dificuldade } from "@/src/domain/entities/Dificuldade"
import { useState } from "react"
import { useRouter } from "next/navigation"

const tiposPersonagens = ["curandeiro", "gladiador", "mago"] as const
type TipoPersonagem = (typeof tiposPersonagens)[number]

type Estado = {
    nome: string | undefined
    classe: TipoPersonagem | undefined
    dificuldade: Dificuldade
}

export default function SetupPage() {
    const labelClasses: Record<TipoPersonagem, string> = {
        curandeiro: "Curandeiro",
        gladiador: "Gladiador",
        mago: "Mago",
    }
    const labelDificuldades: Record<Dificuldade, string> = {
        facil: "Fácil",
        normal: "Normal",
        dificil: "Difícil",
    }
    const [formData, setFormData] = useState<Estado>({
        nome: undefined,
        classe: undefined,
        dificuldade: "normal",
    })
    const router = useRouter()
    return (
        <main className="flex min-h-screen w-full items-center justify-center bg-background p-6">
            <Card className="w-full max-w-lg shadow-lg">
                <CardHeader className="py-4 text-center">
                    <CardTitle className="text-3xl font-bold">
                        criação de personagem
                    </CardTitle>
                    <CardDescription>
                        Configure os detalhes antes de iniciar sua jornada.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-8">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome do herói</Label>
                        <Input
                            id="name"
                            placeholder="Ex: Artorias"
                            className="h-12"
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    nome: e.target.value,
                                })
                            }
                            value={formData.nome ?? ""}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Classe</Label>
                        <Select
                            onValueChange={(value) =>
                                setFormData({
                                    ...formData,
                                    classe: value as TipoPersonagem,
                                })
                            }
                        >
                            <SelectTrigger className="h-12">
                                <SelectValue placeholder="Selecione uma classe" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(labelClasses).map(
                                    ([value, label]) => {
                                        return (
                                            <SelectItem
                                                key={value}
                                                value={value}
                                            >
                                                {label}
                                            </SelectItem>
                                        )
                                    },
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-3">
                        <Label>Dificuldade</Label>
                        <RadioGroup
                            defaultValue="normal"
                            className="flex justify-between gap-4"
                        >
                            {Object.entries(labelDificuldades).map(
                                ([value, label]) => (
                                    <div
                                        key={value}
                                        className="flex flex-1 cursor-pointer items-center space-x-2 rounded-lg border p-3 transition-colors hover:bg-accent"
                                    >
                                        <RadioGroupItem
                                            value={value}
                                            id={value}
                                        />
                                        <Label
                                            htmlFor={value}
                                            className="flex-1 cursor-pointer"
                                        >
                                            {label}
                                        </Label>
                                    </div>
                                ),
                            )}
                        </RadioGroup>
                    </div>
                </CardContent>

                <CardFooter>
                    <Button
                        onClick={() => {
                            sessionStorage.setItem(
                                "userData",
                                JSON.stringify({
                                    nome: formData.nome,
                                    classe: formData.classe,
                                    dificuldade: formData.dificuldade,
                                }),
                            )
                            router.push("/game")
                        }}
                        className="h-14 w-full text-xl font-bold tracking-widest uppercase shadow-xl shadow-primary/20"
                    >
                        INICIAR
                    </Button>
                </CardFooter>
            </Card>
        </main>
    )
}
