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
import {toast} from "sonner"

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
        if (!loginForm.email || !loginForm.password) {
            alert("Por favor, preencha email e senha!")
            return
        }

        fetch(`/api/users?email=${loginForm.email}&password=${loginForm.password}`)
            .then(r => r.json())
            .then(r => {
                if (r.user) {
                    HandleChangeUser(r.user)
                } else {
                    alert(r.msg || "Erro ao fazer login. Verifique suas credenciais.")
                }
            })
            .catch(e => {
                console.log(e)
                alert("Erro ao fazer login. Tente novamente.")
            })
    }

    const handleSignup = () => {
        if (!signupForm.name || !signupForm.email || !signupForm.password) {
            toast.error("Por favor, preencha todos os campos!")
            return
        }

        if (signupForm.password !== signupForm.confirmPassword) {
            toast.error("As senhas não coincidem!")
            return
        }

        if (signupForm.password.length > 20) {
            toast.error("A senha deve ter no máximo 20 caracteres")
            return
        }

        if (signupForm.password.length < 3) {
            toast.error("A senha deve ter no mínimo 3 caracteres")
            return
        }

        const opt = {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                email: signupForm.email,
                password: signupForm.password
            })
        }
        fetch(`/api/users`, opt)
            .then(async (response) => {
                const r = await response.json()
                console.log("Resposta da API:", r)
                console.log("Status HTTP:", response.status)
                
                // Verificar se foi criado com sucesso
                if (r.status === 200 && r.user_id) {
                    toast.success("Conta criada com sucesso!")
                    HandleChangeUser(r.user_id)
                } else {
                    // Mostrar mensagem de erro da API
                    const errorMsg = r.msg || `Erro ao criar conta (Status: ${response.status})`
                    console.error("Erro ao criar conta:", errorMsg)
                    toast.error(errorMsg)
                    alert(errorMsg)
                }
            })
            .catch(e => {
                console.error("Erro na requisição:", e)
                const errorMsg = "Erro ao criar conta. Verifique sua conexão e tente novamente."
                toast.error(errorMsg)
                alert(errorMsg)
            })
    }

    const handleResetPassword = () => {
        // Por enquanto apenas mostra mensagem de sucesso
        alert("Um link de recuperação foi enviado para seu e-mail!")
        setShowResetPassword(false)
        setResetEmail("")
    }

    return (
        <div className="min-h-screen gradient-bg flex items-center justify-center p-4 relative overflow-hidden">
            {/* Elementos decorativos animados */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float"></div>
                <div className="absolute top-40 right-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{animationDelay: '2s'}}></div>
                <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{animationDelay: '4s'}}></div>
            </div>

            <div className="w-full max-w-md space-y-6 relative z-10 animate-in">
                <div className="text-center space-y-4 mb-8">
                    <div className="flex justify-center mb-6">
                        <div className="h-20 w-20 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center shadow-2xl hover-lift animate-float">
                            <Calendar className="h-12 w-12 text-white"/>
                        </div>
                    </div>
                    <h1 className="text-5xl font-extrabold text-white drop-shadow-lg">
                        Time<span className="gradient-text bg-white">Cash</span>
                    </h1>
                    <p className="text-white/90 text-lg font-medium">Gerencie seus eventos e gastos com estilo</p>
                </div>

                {!showResetPassword ? (
                    <Card className="glass-dark border-white/20 shadow-2xl hover-lift backdrop-blur-xl">
                        <CardHeader className="space-y-2">
                            <CardTitle className="text-2xl font-bold text-white">Bem-vindo! 👋</CardTitle>
                            <CardDescription className="text-white/70">Entre na sua conta ou crie uma nova</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="login" className="w-full">
                                <TabsList className="grid w-full grid-cols-2 bg-white/10 backdrop-blur-sm">
                                    <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Entrar</TabsTrigger>
                                    <TabsTrigger value="signup" className="data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Criar Conta</TabsTrigger>
                                </TabsList>

                                <TabsContent value="login" className="space-y-5 mt-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="login-email" className="text-white font-semibold">E-mail</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-5 w-5 text-white/70"/>
                                            <Input
                                                id="login-email"
                                                type="email"
                                                placeholder="seu@email.com"
                                                value={loginForm.email}
                                                onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                                                className="pl-11 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 focus:border-white/40 transition-all duration-300"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="login-password" className="text-white font-semibold">Senha</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-5 w-5 text-white/70"/>
                                            <Input
                                                id="login-password"
                                                type="password"
                                                placeholder="••••••••"
                                                value={loginForm.password}
                                                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                                                className="pl-11 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 focus:border-white/40 transition-all duration-300"
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        variant="link"
                                        className="px-0 text-sm text-white/70 hover:text-white font-medium transition-all duration-300"
                                        onClick={() => setShowResetPassword(true)}
                                    >
                                        Esqueceu sua senha?
                                    </Button>

                                    <Button 
                                        onClick={handleLogin} 
                                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                                    >
                                        Acessar Conta
                                    </Button>
                                </TabsContent>

                                <TabsContent value="signup" className="space-y-5 mt-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-name" className="text-white font-semibold">Nome</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 h-5 w-5 text-white/70"/>
                                            <Input
                                                id="signup-name"
                                                type="text"
                                                placeholder="Seu nome completo"
                                                value={signupForm.name}
                                                onChange={(e) => setSignupForm({...signupForm, name: e.target.value})}
                                                className="pl-11 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 focus:border-white/40 transition-all duration-300"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="signup-email" className="text-white font-semibold">E-mail</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-5 w-5 text-white/70"/>
                                            <Input
                                                id="signup-email"
                                                type="email"
                                                placeholder="seu@email.com"
                                                value={signupForm.email}
                                                onChange={(e) => setSignupForm({...signupForm, email: e.target.value})}
                                                className="pl-11 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 focus:border-white/40 transition-all duration-300"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="signup-password" className="text-white font-semibold">Senha</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-5 w-5 text-white/70"/>
                                            <Input
                                                id="signup-password"
                                                type="password"
                                                placeholder="••••••••"
                                                value={signupForm.password}
                                                onChange={(e) => setSignupForm({
                                                    ...signupForm,
                                                    password: e.target.value
                                                })}
                                                className="pl-11 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 focus:border-white/40 transition-all duration-300"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="signup-confirm-password" className="text-white font-semibold">Confirmar Senha</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-5 w-5 text-white/70"/>
                                            <Input
                                                id="signup-confirm-password"
                                                type="password"
                                                placeholder="••••••••"
                                                value={signupForm.confirmPassword}
                                                onChange={(e) => setSignupForm({
                                                    ...signupForm,
                                                    confirmPassword: e.target.value
                                                })}
                                                className="pl-11 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 focus:border-white/40 transition-all duration-300"
                                            />
                                        </div>
                                    </div>

                                    <Button 
                                        onClick={handleSignup} 
                                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                                    >
                                        Criar Conta
                                    </Button>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="glass-dark border-white/20 shadow-2xl hover-lift backdrop-blur-xl">
                        <CardHeader className="space-y-2">
                            <CardTitle className="text-2xl font-bold text-white">🔐 Recuperar Senha</CardTitle>
                            <CardDescription className="text-white/70">Digite seu e-mail para receber um link de recuperação</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="reset-email" className="text-white font-semibold">E-mail</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-5 w-5 text-white/70"/>
                                    <Input
                                        id="reset-email"
                                        type="email"
                                        placeholder="seu@email.com"
                                        value={resetEmail}
                                        onChange={(e) => setResetEmail(e.target.value)}
                                        className="pl-11 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 focus:border-white/40 transition-all duration-300"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button 
                                    variant="outline" 
                                    onClick={() => setShowResetPassword(false)}
                                    className="flex-1 border-2 border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all duration-300"
                                >
                                    Voltar
                                </Button>
                                <Button 
                                    onClick={handleResetPassword} 
                                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100" 
                                    disabled={!resetEmail}
                                >
                                    Enviar Link
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <p className="text-center text-sm text-white/70 backdrop-blur-sm bg-white/10 rounded-lg p-3">
                    Ao continuar, você concorda com nossos <span className="text-white font-semibold underline">Termos de Serviço</span> e <span className="text-white font-semibold underline">Política de Privacidade</span>
                </p>
            </div>
        </div>
    )
}
