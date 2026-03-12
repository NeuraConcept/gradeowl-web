"use client";

import { useState } from "react";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();
  const router = useRouter();

  async function exchangeToken(
    idToken: string,
  ): Promise<{ id: number; email: string; name: string }> {
    const res = await fetch("/api/auth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_token: idToken }),
      credentials: "include",
    });
    if (!res.ok) throw new Error("Token exchange failed");
    return res.json();
  }

  async function handleAuth(
    firebaseAuth: () => Promise<{
      idToken: string;
      displayName: string | null;
      email: string | null;
    }>,
  ) {
    setLoading(true);
    try {
      const {
        idToken,
        displayName,
        email: firebaseEmail,
      } = await firebaseAuth();
      const userData = await exchangeToken(idToken);
      setUser({
        id: userData.id,
        email: userData.email || firebaseEmail || "user",
        name: userData.name || displayName || firebaseEmail || "user",
      });
      router.push("/");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Authentication failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    await handleAuth(async () => {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      return {
        idToken,
        displayName: result.user.displayName,
        email: result.user.email,
      };
    });
  }

  async function handleEmail() {
    if (!email || !password) {
      toast.error("Email and password required");
      return;
    }
    await handleAuth(async () => {
      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password,
        );
      } catch (err: unknown) {
        const firebaseError = err as { code?: string };
        if (firebaseError.code === "auth/user-not-found") {
          userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password,
          );
        } else {
          throw err;
        }
      }
      const idToken = await userCredential.user.getIdToken();
      return {
        idToken,
        displayName: userCredential.user.displayName,
        email: userCredential.user.email,
      };
    });
  }

  async function handleReset() {
    if (!email) {
      toast.error("Enter your email first");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent");
    } catch {
      toast.error("Failed to send reset email");
    }
  }

  return (
    <Card className="w-[400px]">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-coral">
          GradeOwl
        </CardTitle>
        <CardDescription>AI-powered grading for teachers</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full bg-[#4285f4] hover:bg-[#3574d4]"
        >
          Sign in with Google
        </Button>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">or</span>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="teacher@school.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button onClick={handleEmail} disabled={loading} className="w-full">
          {loading ? "Signing in..." : "Sign In"}
        </Button>
        <button
          onClick={handleReset}
          className="w-full text-center text-sm text-coral hover:underline"
        >
          Forgot password?
        </button>
      </CardContent>
    </Card>
  );
}
