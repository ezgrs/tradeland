import { Espolio } from "@/src/domain/entities/Espolio";

export type FinalBatalha = {type: "fuga"} | {type: "morte"} | {type: "vitoria", espolio: Espolio | null}
