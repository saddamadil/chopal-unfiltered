"use client";
import { useActionState } from "react";
import { login } from "@/app/login/actions";
export default function LoginForm() {
  const [state, action, pending] = useActionState(login, { error: "" });
  return (
    <form action={action} className="form-stack">
      <label>
        ईमेल
        <input name="email" type="email" autoComplete="username" required />
      </label>
      <label>
        पासवर्ड
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </label>
      {state?.error && (
        <p className="error" role="alert">
          {state.error}
        </p>
      )}
      <button className="button" disabled={pending}>
        {pending ? "लॉगिन हो रहा है…" : "न्यूज़रूम में प्रवेश करें"}
      </button>
      <p className="muted">
        केवल अधिकृत संपादकीय टीम के लिए। पासवर्ड सहायता के लिए अपने व्यवस्थापक
        से संपर्क करें।
      </p>
    </form>
  );
}
