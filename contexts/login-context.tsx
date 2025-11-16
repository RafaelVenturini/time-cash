"use client"
import {usePathname, useRouter} from "next/navigation"
import {createContext, ReactNode, useContext, useEffect, useState} from "react"

type LoginContextType = {
    logout: () => void
    HandleChangeUser: (v: number) => void
    user: number | undefined
}

const LoginContext = createContext<LoginContextType | undefined>(undefined)

export function LoginProvider({children}: { children: ReactNode }) {
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [user, setUser] = useState<number | undefined>(undefined)
    const router = useRouter()
    const pathname = usePathname()

    // Carregar estado do localStorage na montagem
    useEffect(() => {
        try {
            const localUser = localStorage.getItem("user")
            if (localUser) {
                const parsedUser = JSON.parse(localUser)
                setUser(Number(parsedUser))
            }
        } catch (e) {
            console.error("Erro ao carregar usuário do localStorage:", e)
            localStorage.removeItem("user")
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Redirecionar se não estiver logado ou se estiver logado e na página de login
    useEffect(() => {
        if (isLoading) return // Espera carregar do localStorage

        const isLoginPage = pathname === "/login"

        if (!user && !isLoginPage) {
            router.push("/login")
        } else if (user && isLoginPage) {
            // Se já estiver logado e estiver na página de login, redirecionar para a página principal
            router.push("/")
        }
    }, [user, pathname, router, isLoading])

    function HandleChangeUser(v: number) {
        setUser(v)
        localStorage.setItem("user", JSON.stringify(v))
        // Redirecionar para a página principal após login
        router.push("/")
    }

    const logout = () => {
        setUser(undefined)
        localStorage.removeItem("user")
        router.push("/login")
    }

    const value: LoginContextType = {
        logout,
        HandleChangeUser,
        user
    }

    if (isLoading) {
        return <div>Carregando...</div>
    }

    return (
        <LoginContext.Provider value={value}>
            {children}
        </LoginContext.Provider>
    )
}

export function useLogin() {
    const context = useContext(LoginContext)
    if (!context) {
        throw new Error('useLogin must be used within a LoginProvider')
    }
    return context
}

export default LoginContext