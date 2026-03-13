"use client";

import { useState } from "react";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { getFirebaseAuth, googleProvider } from "@/lib/firebase";
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

  async function exchangeToken(idToken: string): Promise<void> {
    const res = await fetch("/api/auth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_token: idToken }),
      credentials: "include",
    });
    if (!res.ok) throw new Error("Token exchange failed");
  }

  async function handleAuth(
    firebaseAuth: () => Promise<{
      idToken: string;
      uid: string;
      displayName: string | null;
      email: string | null;
    }>,
  ) {
    setLoading(true);
    try {
      const {
        idToken,
        uid,
        displayName,
        email: firebaseEmail,
      } = await firebaseAuth();
      await exchangeToken(idToken);
      setUser({
        uid,
        email: firebaseEmail || "user",
        name: displayName || firebaseEmail || "user",
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
      const result = await signInWithPopup(getFirebaseAuth(), googleProvider);
      const idToken = await result.user.getIdToken();
      return {
        idToken,
        uid: result.user.uid,
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
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
      const idToken = await cred.user.getIdToken();
      await exchangeToken(idToken);
      setUser({
        uid: cred.user.uid,
        email: cred.user.email || "user",
        name: cred.user.displayName || cred.user.email || "user",
      });
      router.push("/");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/invalid-credential") {
        toast.error("Invalid email or password");
      } else if (code === "auth/too-many-requests") {
        toast.error("Too many attempts. Try again later.");
      } else {
        toast.error("Login failed");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleReset() {
    if (!email) {
      toast.error("Enter your email first");
      return;
    }
    try {
      await sendPasswordResetEmail(getFirebaseAuth(), email);
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
