import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { useRegisterMutation } from "@/store/authSlice";
import { useForm } from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod"; 
import {registerSchema, type RegisterSchema} from "@/schema/auth.schema";

export default function Signup() {


    const { 
        register, handleSubmit, formState: { errors }
    } = useForm<RegisterSchema>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            username: "",
            email: "",
            password: ""
        }
    });

    const [signUp, { isLoading, data }] = useRegisterMutation();
    const navigate = useNavigate();

    useEffect(() => {
        if (data) navigate("/login", { replace: true });
    }, [data, navigate]);

    const onSubmit = async (values: RegisterSchema) => {
        signUp(values);
    };

    const rawBackendUrl = import.meta.env.VITE_BACKEND_URL;
    const backendUrl = (rawBackendUrl && rawBackendUrl !== '/') 
        ? rawBackendUrl.trim().replace(/\/+$/, '') 
        : (import.meta.env.PROD ? "" : "http://localhost:8000");

    const handleGoogle = () => {
        window.location.href = `${backendUrl}/api/auth/google`;
    };

    const handleGithub = () => {
        window.location.href = `${backendUrl}/api/auth/github`;
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <Link to="/" className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl overflow-hidden shadow-md">
                        <img src="/logo.webp" alt="Nova AI Logo" className="h-full w-full object-contain" />
                    </Link>
                    <CardTitle className="font-display text-2xl">Join your team</CardTitle>
                    <CardDescription>Create an account to start creating with AI</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full cursor-pointer hover:bg-white/5" onClick={handleGoogle} type="button">
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                        Continue with Google
                    </Button>
                    <Button variant="outline" className="w-full cursor-pointer hover:bg-white/5" onClick={handleGithub} type="button">
                        <svg className="mr-2 h-4 w-4 fill-current" viewBox="0 0 24 24">
                            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                        </svg>
                        Continue with GitHub
                    </Button>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">or</span></div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input id="username" type="text" placeholder="Enter your username" {...register("username")} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="you@company.com" {...register("email")} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" placeholder="Min. 6 characters" {...register("password")} required />
                        </div>
                        {/* show errors */}

                        {errors.username || errors.email || errors.password ? (
                            <div className="text-sm text-red-500">
                                {errors.username && <p>{errors.username.message}</p>}
                                {errors.email && <p>{errors.email.message}</p>}
                                {errors.password && <p>{errors.password.message}</p>}
                            </div>
                        ) : null}

                        <Button type="submit" className="w-full" disabled={(errors.username || errors.email || errors.password) ? true : isLoading}>
                            {isLoading ? "Creating account..." : "Create account"}
                        </Button>

                    </form>
                    
                    <p className="text-center text-sm text-muted-foreground">
                        Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
