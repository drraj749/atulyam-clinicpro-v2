"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StaffLoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(
    e: React.FormEvent<HTMLFormElement>
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
      const response = await fetch(
        "/api/staff/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            username: username.trim().toLowerCase(),
            password,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        alert(
          result.message ||
            "Login failed."
        );
        return;
      }

      /*
       * IMPORTANT
       *
       * The staff dashboard currently checks
       * localStorage for "staffSession".
       *
       * Therefore we MUST save the logged-in
       * staff information before redirecting.
       */

      if (!result.staff) {
        alert(
          "Login successful, but staff information was not returned."
        );
        return;
      }

      localStorage.setItem(
        "staffSession",
        JSON.stringify(result.staff)
      );

      /*
       * Give the browser a moment to persist
       * localStorage before navigation.
       */

      router.replace(
        "/staff-dashboard"
      );

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

        {/* LOGIN FORM */}

        <form
          onSubmit={handleLogin}
          className="bg-white rounded-b-2xl shadow-xl p-7"
        >

          {/* USERNAME */}

          <div className="mb-5">

            <label
              htmlFor="username"
              className="block font-semibold mb-2"
            >
              Username
            </label>

            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
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

            <label
              htmlFor="password"
              className="block font-semibold mb-2"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
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

          <p className="text-center text-xs text-gray-400 mt-2">
            Authorized Staff Only
          </p>

        </form>

      </div>

    </main>
  );
}