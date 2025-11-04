"use client"
import {usePathname, useRouter} from "next/navigation"
import {createContext, ReactNode, useContext, useEffect, useState} from "react"

type LoginContextType = {
    logout: () => void
    HandleChangeUser: (v: number) => void
    user: () => void
}

const LoginContext = createContext<LoginContextType | undefined>(undefined)

export function LoginProvider({children}: { children: ReactNode }) {
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [user, setUser] = useState<number | undefined>(undefined)
    const router = useRouter()
    const pathname = usePathname()

    // Carregar estado do localStorage na montagem
    useEffect(() => {
        const localUser = localStorage.getItem("user")
        setUser(Number(localUser))
        setIsLoading(false)
    }, [])

    // Redirecionar se não estiver logado
    useEffect(() => {
        if (isLoading) return // Espera carregar do localStorage

        const isLoginPage = pathname === "/login"

        if (!user && !isLoginPage) {
            router.push("/login")
        }
    }, [user, pathname, router, isLoading])

    function HandleChangeUser(v: number) {
        setUser(v)
        localStorage.setItem("user", v.toString())
        window.location.href = "http://localhost:3000"
    }

    const logout = () => {
        setUser(undefined)
        localStorage.removeItem("user")
        router.push("/login")
    }

    const value: LoginContextType = {
        logout,
        HandleChangeUser,
        //@ts-expect-error user exists?
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