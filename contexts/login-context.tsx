"use client"
import { useRouter, usePathname } from "next/navigation"
import { createContext, useState, ReactNode, useEffect, useContext } from "react"

type LoginContextType = {
    logout: () => void
    setUser: (v:number) => void
    user: () => void
}

const LoginContext = createContext<LoginContextType | undefined>(undefined)

export function LoginProvider({ children }: { children: ReactNode }) {
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

    // Sincronizar com localStorage
    useEffect(() => {
        if (!isLoading) {
            if(user)localStorage.setItem("user", user.toString())
        }
    }, [isLoading])

    const logout = () => {
        setUser(undefined)
        localStorage.removeItem("user")
        router.push("/login")
    }

    const value: LoginContextType = {
        logout,
        setUser,
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