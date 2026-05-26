export type FlashState = {
  type: "success" | "error";
  message: string;
};

export type FlashSearchParams = {
  success?: string;
  error?: string;
};

export function flashFromSearchParams(params?: FlashSearchParams): FlashState | null {
  const success = params?.success?.trim();
  const error = params?.error?.trim();
  if (error) return { type: "error", message: error };
  if (success) return { type: "success", message: success };
  return null;
}

export function flashUrl(path: string, type: FlashState["type"], message: string) {
  const params = new URLSearchParams({ [type]: message });
  return `${path}?${params.toString()}`;
}
