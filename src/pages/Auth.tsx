import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/src/lib/auth";
import { db } from "@/src/lib/db";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Plane } from "lucide-react";
import { motion } from "motion/react";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (isLogin) {
        const user = await db.users.where("email").equals(email).first();
        if (user && user.password === password) {
          login(user.id!);
          navigate("/");
        } else {
          setError("Invalid email or password");
        }
      } else {
        const existing = await db.users.where("email").equals(email).first();
        if (existing) {
          setError("Email already in use");
        } else {
          const id = await db.users.add({
            email,
            password,
            name,
            preferences: { currency: "INR", language: "en" }
          });
          login(id);
          navigate("/");
        }
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-[#0A0A0B] relative overflow-hidden">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#141417] via-[#0A0A0B] to-[#0A0A0B]"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="z-10 w-full max-w-md"
      >
        <div className="flex justify-center mb-8">
           <div className="flex items-center space-x-2">
             <Plane className="w-6 h-6 text-emerald-500" />
             <h1 className="text-2xl tracking-tight font-light font-serif italic text-white flex items-center">
               Traveloop
             </h1>
           </div>
        </div>
        <Card className="border border-[#1F1F23] bg-[#141417]/50 backdrop-blur-sm shadow-2xl">
          <form onSubmit={handleSubmit}>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{isLogin ? "Welcome back" : "Create an account"}</CardTitle>
              <CardDescription>
                {isLogin ? "Enter your details to sign in to your account" : "Start planning your next adventure"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Input 
                    type="text" 
                    placeholder="Full Name" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    required 
                  />
                </div>
              )}
              <div className="space-y-2">
                <Input 
                  type="email" 
                  placeholder="Email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Input 
                  type="password" 
                  placeholder="Password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                />
              </div>
              {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full">
                {isLogin ? "Sign In" : "Sign Up"}
              </Button>
              <div className="text-sm text-center text-[#636366]">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button 
                  type="button" 
                  onClick={() => setIsLogin(!isLogin)} 
                  className="text-white hover:text-emerald-400 font-medium hover:underline transition-colors tracking-widest uppercase text-[10px]"
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
