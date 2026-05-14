import Link from "next/link"
import { Button } from "../components/ui/button"

export default function Page() {
    return (
        <main className="flex h-screen w-full items-center justify-center bg-background p-4">
            <div className="flex w-full max-w-md flex-col items-center gap-12 text-center">
                <h1 className="text-4xl font-extrabold tracking-tight text-foreground lg:text-5xl">
                    tradeland.
                </h1>
                <div className="flex w-full flex-col gap-4">
                    <Link href="/setup" className="w-full">
                        <Button
                            size="lg"
                            className="w-full py-6 text-lg font-semibold"
                        >
                            JOGAR
                        </Button>
                    </Link>
                    <Button
                        variant="outline"
                        size="lg"
                        className="w-full py-6 text-lg"
                    >
                        SOBRE
                    </Button>
                </div>
            </div>
        </main>
    )
}
