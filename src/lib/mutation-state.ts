export type MutationState = {
  type?: "success" | "error";
  message?: string;
  nonce?: number;
};

export function mutationSuccess(message: string): MutationState {
  return { type: "success", message, nonce: Date.now() };
}

export function mutationError(message: string): MutationState {
  return { type: "error", message, nonce: Date.now() };
}
