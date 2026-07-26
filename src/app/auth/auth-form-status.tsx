"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

type AuthFormSubmitProps = {
  children: string;
};

export function AuthFormSubmit({ children }: AuthFormSubmitProps) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Processando..." : children}
    </Button>
  );
}
