import { UpdatePasswordForm } from "@/app/auth/update-password/update-password-form";

export default function UpdatePasswordPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-[var(--primary)]">Nova senha</h1>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        Defina uma nova senha para voltar ao Finnext.
      </p>
      <UpdatePasswordForm />
    </div>
  );
}
