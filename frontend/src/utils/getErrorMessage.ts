// Extrai a mensagem de erro de uma resposta de API (axios) de forma type-safe,
// evitando o uso de `any` nos blocos catch.
export function getErrorMessage(err: unknown, fallback: string): string {
  if (typeof err === 'object' && err !== null) {
    const maybe = err as { response?: { data?: { error?: string } } };
    if (maybe.response?.data?.error) return maybe.response.data.error;
  }
  return fallback;
}
