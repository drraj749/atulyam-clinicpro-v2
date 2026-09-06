"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type LoginStaff = {
  id: number;
  staffCode: string;
  name: string;
  role: string;
};

type LoginResponse = {
  success?: boolean;
  message?: string;
  staff?: LoginStaff;
};

export default function StaffLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!username.trim()) {
      alert("Please enter username.");
      return;
    }

    if (!password) {
      alert("Please enter password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/staff/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim().toLowerCase(),
          password,
        }),
      });

      const result: LoginResponse = await response.json();

      if (!response.ok || !result.staff) {
        alert(result.message || "Login failed.");
        return;
      }

      // The secure HTTP-only staff_session cookie is created by the API.
      // localStorage is used only by the client dashboard for UI bootstrapping.
      localStorage.setItem("staffSession", JSON.stringify(result.staff));

      router.replace("/staff-dashboard");
      router.refresh();
    } catch (error) {
      console.error("STAFF LOGIN ERROR:", error);
      alert("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-md">
        <div className="bg-blue-900 text-white rounded-t-2xl p-7 text-center shadow-lg">
          <div className="text-4xl mb-2">🏥</div>
          <h1 className="text-3xl font-bold">Atulyam Hospital</h1>
          <p className="mt-2 text-blue-100">Staff Login</p>
        </div>

        <form
          onSubmit={handleLogin}
          className="bg-white rounded-b-2xl shadow-xl p-7"
        >
          <div className="mb-5">
            <label className="block font-semibold mb-2 text-gray-800">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              autoComplete="username"
              autoFocus
              disabled={loading}
              className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          <div className="mb-6">
            <label className="block font-semibold mb-2 text-gray-800">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoComplete="current-password"
              disabled={loading}
              className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition"
          >
            {loading ? "Signing in..." : "Staff Login"}
          </button>

          <p className="text-center text-sm text-gray-500 mt-6">
            Atulyam Hospital • Born To Serve
          </p>
        </form>
      </div>
    </main>
  );
}
