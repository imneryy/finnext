export function getFriendlyErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    if (error.message.toLowerCase().includes("fetch failed")) {
      return "Nao foi possivel conectar ao Supabase. Verifique a URL/chave no .env.local, a conexao de rede e as Redirect URLs do Auth.";
    }

    return error.message;
  }

  if (typeof error === "string" && error.trim()) {
    return error;
  }

  return "Nao foi possivel concluir a operacao. Tente novamente.";
}
