"use client";

import { useActionState } from "react";
import { Scissors } from "lucide-react";
import { loginWithEmailOnly } from "@/app/actions/auth";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginWithEmailOnly, null);

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-neutral-100 p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-black text-white p-3 rounded-xl mb-4">
            <Scissors className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold">Welcome</h1>
          <p className="text-neutral-500 text-sm mt-1">Sign in to Workspace</p>
        </div>

        {state?.error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Email Address</label>
            <input
              name="email"
              type="email"
              placeholder="name@example.com"
              className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-black text-white py-2.5 rounded-lg font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50"
          >
            {isPending ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
