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

  async function handleLogin(
    e: React.FormEvent
  ) {
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
      const response =
        await fetch(
          "/api/staff/login",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              username:
                username.trim().toLowerCase(),

              password,
            }),
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        alert(
          result.message ||
            "Login failed."
        );

        return;
      }

      /*
       * Login successful.
       *
       * Your existing dashboard is:
       *
       * app/staff-dashboard/page.tsx
       *
       * Therefore the correct URL is:
       *
       * /staff-dashboard
       */

      router.push(
        "/staff-dashboard"
      );

      router.refresh();

    } catch (error) {
      console.error(
        "STAFF LOGIN ERROR:",
        error
      );

      alert(
        "Unable to connect to server."
      );

    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">

      <div className="w-full max-w-md">

        {/* HEADER */}

        <div className="bg-blue-900 text-white rounded-t-2xl p-7 text-center">

          <h1 className="text-3xl font-bold">
            Atulyam Hospital
          </h1>

          <p className="mt-2 text-blue-100">
            Staff Login
          </p>

        </div>

        {/* LOGIN CARD */}

        <form
          onSubmit={handleLogin}
          className="bg-white rounded-b-2xl shadow-xl p-7"
        >

          {/* USERNAME */}

          <div className="mb-5">

            <label className="block font-semibold mb-2">
              Username
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) =>
                setUsername(
                  e.target.value
                )
              }
              placeholder="Enter username"
              autoComplete="username"
              autoFocus
              disabled={loading}
              className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />

          </div>

          {/* PASSWORD */}

          <div className="mb-6">

            <label className="block font-semibold mb-2">
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
              placeholder="Enter password"
              autoComplete="current-password"
              disabled={loading}
              className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />

          </div>

          {/* LOGIN BUTTON */}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold"
          >
            {loading
              ? "Signing in..."
              : "Staff Login"}
          </button>

          {/* FOOTER */}

          <p className="text-center text-sm text-gray-500 mt-6">
            Atulyam Hospital • Born To Serve
          </p>

        </form>

      </div>

    </main>
  );
}