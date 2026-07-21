import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { Mail, Lock, User, IdCard, Loader2, KeyRound } from "lucide-react";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
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
      const savedUser = localStorage.getItem("zappadu_user");
      const loggedUser = savedUser ? JSON.parse(savedUser) : null;

      // Auto-redirect to respective dashboards based on role
      if (loggedUser?.role === "admin") {
        navigate("/admin");
      } else if (loggedUser?.role === "shop_owner") {
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
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Welcome to <span className="gradient-text">Zappadu</span>
            </h1>
            <p className="text-muted-foreground">
              Sign in to order canteen meals or manage your stall
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Register Student</TabsTrigger>
            </TabsList>

            {/* Login Section (Unified for Student, Shop Owners, and Admin) */}
            <TabsContent value="login" className="animate-slide-up">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <KeyRound className="h-5 w-5 text-primary" />
                    Account Sign In
                  </CardTitle>
                  <CardDescription>
                    Enter your registered email and password to access your dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="e.g. student@college.edu or shop@zappadu.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="Enter password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full mt-2" disabled={loginLoading}>
                      {loginLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Logging in...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </form>

                  {/* Seeded credentials helper details */}
                  <div className="mt-8 pt-6 border-t border-border space-y-3">
                    <h4 className="text-xs font-bold text-muted-foreground tracking-wider uppercase">
                      Quick Access Credentials (Demo & Local Mode)
                    </h4>
                    <div className="text-xs text-muted-foreground space-y-1.5 bg-muted/40 p-3 rounded-lg border border-border">
                      <p>👑 <strong>Super Admin:</strong> admin@college.edu / admin123</p>
                      <p>🎓 <strong>Demo Student:</strong> student@college.edu / student123</p>
                      <p>🏪 <strong>Shop Owner (Annapurna):</strong> annapurna@zappadu.com / shop123</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Registration Section */}
            <TabsContent value="register" className="animate-slide-up">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Create Student Account</CardTitle>
                  <CardDescription>
                    Register with your college email and Student Identification Number (SIN)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="register-name"
                          type="text"
                          placeholder="e.g. John Doe"
                          value={registerName}
                          onChange={(e) => setRegisterName(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-sin">SIN / Roll Number</Label>
                      <div className="relative">
                        <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="register-sin"
                          type="text"
                          placeholder="e.g. SIN001 or e23ai036"
                          value={registerSinNumber}
                          onChange={(e) => setRegisterSinNumber(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-email">College Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="register-email"
                          type="email"
                          placeholder="yourname@college.edu"
                          value={registerEmail}
                          onChange={(e) => setRegisterEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="register-password"
                          type="password"
                          placeholder="Create a strong password"
                          value={registerPassword}
                          onChange={(e) => setRegisterPassword(e.target.value)}
                          className="pl-10"
                          required
                          minLength={6}
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full mt-2" disabled={registerLoading}>
                      {registerLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
