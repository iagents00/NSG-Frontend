"use client";
import { useRouter } from "next/navigation";
import { useAppStore, Role } from "@/store/useAppStore";

export default function LoginPage() {
  const router = useRouter();
  const setRole = useAppStore((state) => state.setRole);

  const handleLogin = (role: Role) => {
    // 1. Perform actual authentication logic (API call) here
    // 2. Set the role based on the response
    setRole(role); 
    // 3. Redirect to the Dashboard Dispatcher
    router.push("/dashboard");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1>Sign In to NSG Intelligence</h1>
      <button onClick={() => handleLogin('manager')}>Login as CEO</button>
      <button onClick={() => handleLogin('patient')}>Login as Patient</button>
    </div>
  );
}