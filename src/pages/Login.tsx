import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { Mail, Lock, User, IdCard, Loader2, Store, GraduationCap } from "lucide-react";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();

  const [loginType, setLoginType] = useState<"student" | "shop_owner">("student");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerSinNumber, setRegisterSinNumber] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);

  const from = (location.state as any)?.from || "/";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    const success = await login(loginEmail, loginPassword);
    if (success) {
      // Redirect based on role - shop owners go to dashboard
      if (loginType === "shop_owner") {
        navigate("/shop-dashboard");
      } else {
        navigate(from === "/" ? "/dashboard" : from);
      }
    }
    setLoginLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterLoading(true);
    const success = await register(registerName, registerEmail, registerPassword, registerSinNumber);
    if (success) {
      navigate("/dashboard");
    }
    setRegisterLoading(false);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Welcome to <span className="gradient-text">Zappadu</span>
            </h1>
            <p className="text-muted-foreground">
              Choose your login type to continue
            </p>
          </div>

          {/* Login Type Selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => setLoginType("student")}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                loginType === "student"
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <GraduationCap className={`h-8 w-8 mx-auto mb-2 ${loginType === "student" ? "text-primary" : "text-muted-foreground"}`} />
              <div className={`font-semibold text-sm ${loginType === "student" ? "text-primary" : ""}`}>Student</div>
            </button>
            <button
              onClick={() => setLoginType("shop_owner")}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                loginType === "shop_owner"
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <Store className={`h-8 w-8 mx-auto mb-2 ${loginType === "shop_owner" ? "text-primary" : "text-muted-foreground"}`} />
              <div className={`font-semibold text-sm ${loginType === "shop_owner" ? "text-primary" : ""}`}>Shop Owner</div>
            </button>
          </div>

          {loginType === "student" ? (
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      Student Login
                    </CardTitle>
                    <CardDescription>Enter your credentials to access your account</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="login-email" type="email" placeholder="student@college.edu" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="pl-10" required />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="login-password" type="password" placeholder="Enter your password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="pl-10" required />
                        </div>
                      </div>
                      <Button type="submit" className="w-full" disabled={loginLoading}>
                        {loginLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Logging in...</> : "Login"}
                      </Button>
                    </form>
                    <div className="mt-6 p-4 bg-muted rounded-lg">
                      <p className="text-sm font-medium mb-1">Demo Student:</p>
                      <p className="text-xs text-muted-foreground">student@college.edu / student123</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="register">
                <Card>
                  <CardHeader>
                    <CardTitle>Create Student Account</CardTitle>
                    <CardDescription>Register with your college email and SIN number</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-name">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="register-name" type="text" placeholder="John Doe" value={registerName} onChange={(e) => setRegisterName(e.target.value)} className="pl-10" required />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-sin">SIN Number</Label>
                        <div className="relative">
                          <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="register-sin" type="text" placeholder="SIN001" value={registerSinNumber} onChange={(e) => setRegisterSinNumber(e.target.value)} className="pl-10" required />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-email">College Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="register-email" type="email" placeholder="yourname@college.edu" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} className="pl-10" required />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input id="register-password" type="password" placeholder="Create a strong password" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} className="pl-10" required minLength={6} />
                        </div>
                      </div>
                      <Button type="submit" className="w-full" disabled={registerLoading}>
                        {registerLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account...</> : "Create Account"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5 text-primary" />
                  Shop Owner Login
                </CardTitle>
                <CardDescription>Access your shop dashboard to manage orders</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="shop-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="shop-email" type="email" placeholder="shop@zappadu.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="pl-10" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shop-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="shop-password" type="password" placeholder="Enter your password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="pl-10" required />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loginLoading}>
                    {loginLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Logging in...</> : "Login to Dashboard"}
                  </Button>
                </form>
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Demo Shop Owners:</p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p><strong>Annapurna:</strong> annapurna@zappadu.com / shop123</p>
                    <p><strong>Spice Junction:</strong> spicejunction@zappadu.com / shop123</p>
                    <p><strong>Quick Bites:</strong> quickbites@zappadu.com / shop123</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Login;
