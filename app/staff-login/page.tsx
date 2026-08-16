"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StaffLoginPage() {
  const router = useRouter();

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function login() {
    if (!username.trim()) {
      alert("Enter username.");
      return;
    }

    if (!password) {
      alert("Enter password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/staff/login",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            username:
              username.trim(),
            password,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        alert(
          result.message ||
            "Unable to login."
        );
        return;
      }

      /*
       * Temporary client-side session.
       *
       * We will replace this with a
       * secure HttpOnly cookie/session
       * before production deployment.
       */

      localStorage.setItem(
        "staffSession",
        JSON.stringify(result.staff)
      );

      router.push(
        "/staff-dashboard"
      );
    } catch (error) {
      console.error(error);

      alert(
        "Unable to connect to server."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">

      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8">

        <div className="text-center mb-8">

          <h1 className="text-3xl font-bold text-blue-900">
            Atulyam Hospital
          </h1>

          <p className="text-gray-500 mt-2">
            Staff Login
          </p>

        </div>

        <div className="space-y-5">

          <div>
            <label className="block font-medium mb-2">
              Username
            </label>

            <input
              value={username}
              onChange={(e) =>
                setUsername(
                  e.target.value
                )
              }
              className="border rounded-lg p-3 w-full"
              placeholder="Enter username"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block font-medium mb-2">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  login();
                }
              }}
              className="border rounded-lg p-3 w-full"
              placeholder="Enter password"
              autoComplete="current-password"
            />
          </div>

          <button
            type="button"
            onClick={login}
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold"
          >
            {loading
              ? "Signing in..."
              : "Staff Login"}
          </button>

        </div>

      </div>

    </main>
  );
}