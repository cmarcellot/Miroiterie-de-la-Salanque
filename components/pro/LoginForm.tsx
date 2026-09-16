"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LoginModalCard from "@/components/pro/LoginModalCard";

function Form() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/pro";

  return (
    <LoginModalCard
      onClose={() => router.push("/")}
      onSuccess={() => {
        // Navigation complète (pas router.push) : le cookie de session tout
        // juste posé par signIn() doit être présent dès la première requête
        // vue par le middleware, sinon il rebondit sur /pro/login et il
        // faut cliquer une seconde fois.
        window.location.href = callbackUrl;
      }}
    />
  );
}

export default function LoginForm() {
  return (
    <Suspense>
      <Form />
    </Suspense>
  );
}
