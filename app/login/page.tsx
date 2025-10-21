"use client"

import {useState} from "react"
import {useRouter} from "next/navigation"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {Calendar, Lock, Mail, User} from "lucide-react"
import {useLogin} from "@/contexts/login-context"
import {headers} from "next/headers"

export default function LoginPage() {
    const {HandleChangeUser} = useLogin()
    const router = useRouter()
    const [loginForm, setLoginForm] = useState({
        email: "",
        password: "",
    })
    const [signupForm, setSignupForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    })
    const [resetEmail, setResetEmail] = useState("")
    const [showResetPassword, setShowResetPassword] = useState(false)

    const handleLogin = () => {
        fetch(`/api/users?email=${loginForm.email}&password=${loginForm.password}`)
            .then(r => r.json())
            .then(r => {
                const user = r.user
                HandleChangeUser(user)

            })
            .catch(e => console.log(e))
    }

    const handleSignup = () => {
        const opt = {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                email: signupForm.email,
                password: signupForm.password
            })
        }
        fetch(`/api/users`, opt)
            .then(r => r.json())
            .then(r => {
                console.log("data: ", r)
                if (r.status == 200) {
                    HandleChangeUser(r.user)
                }
            })
    }

    const handleResetPassword = () => {
        // Por enquanto apenas mostra mensagem de sucesso
        alert("Um link de recuperação foi enviado para seu e-mail!")
        setShowResetPassword(false)
        setResetEmail("")
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-4">
                <div className="text-center space-y-2 mb-6">
                    <div className="flex justify-center mb-4">
                        <div className="h-16 w-16 bg-primary rounded-lg flex items-center justify-center">
                            <Calendar className="h-10 w-10 text-primary-foreground"/>
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-foreground">Calendário de Eventos</h1>
                    <p className="text-muted-foreground">Gerencie seus eventos e gastos</p>
                </div>

                {!showResetPassword ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Bem-vindo</CardTitle>
                            <CardDescription>Entre na sua conta ou crie uma nova</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="login" className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="login">Entrar</TabsTrigger>
                                    <TabsTrigger value="signup">Criar Conta</TabsTrigger>
                                </TabsList>

                                <TabsContent value="login" className="space-y-4 mt-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="login-email">E-mail</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
                                            <Input
                                                id="login-email"
                                                type="email"
                                                placeholder="seu@email.com"
                                                value={loginForm.email}
                                                onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="login-password">Senha</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
                                            <Input
                                                id="login-password"
                                                type="password"
                                                placeholder="••••••••"
                                                value={loginForm.password}
                                                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        variant="link"
                                        className="px-0 text-sm text-muted-foreground hover:text-foreground"
                                        onClick={() => setShowResetPassword(true)}
                                    >
                                        Esqueceu sua senha?
                                    </Button>

                                    <Button onClick={handleLogin} className="w-full">
                                        Acessar Conta
                                    </Button>
                                </TabsContent>

                                <TabsContent value="signup" className="space-y-4 mt-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-name">Nome</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
                                            <Input
                                                id="signup-name"
                                                type="text"
                                                placeholder="Seu nome completo"
                                                value={signupForm.name}
                                                onChange={(e) => setSignupForm({...signupForm, name: e.target.value})}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="signup-email">E-mail</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
                                            <Input
                                                id="signup-email"
                                                type="email"
                                                placeholder="seu@email.com"
                                                value={signupForm.email}
                                                onChange={(e) => setSignupForm({...signupForm, email: e.target.value})}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="signup-password">Senha</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
                                            <Input
                                                id="signup-password"
                                                type="password"
                                                placeholder="••••••••"
                                                value={signupForm.password}
                                                onChange={(e) => setSignupForm({
                                                    ...signupForm,
                                                    password: e.target.value
                                                })}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="signup-confirm-password">Confirmar Senha</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
                                            <Input
                                                id="signup-confirm-password"
                                                type="password"
                                                placeholder="••••••••"
                                                value={signupForm.confirmPassword}
                                                onChange={(e) => setSignupForm({
                                                    ...signupForm,
                                                    confirmPassword: e.target.value
                                                })}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>

                                    <Button onClick={handleSignup} className="w-full">
                                        Criar Conta
                                    </Button>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>Recuperar Senha</CardTitle>
                            <CardDescription>Digite seu e-mail para receber um link de recuperação</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="reset-email">E-mail</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/>
                                    <Input
                                        id="reset-email"
                                        type="email"
                                        placeholder="seu@email.com"
                                        value={resetEmail}
                                        onChange={(e) => setResetEmail(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setShowResetPassword(false)}
                                        className="flex-1">
                                    Voltar
                                </Button>
                                <Button onClick={handleResetPassword} className="flex-1" disabled={!resetEmail}>
                                    Enviar Link
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <p className="text-center text-sm text-muted-foreground">
                    Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade
                </p>
            </div>
        </div>
    )
}
