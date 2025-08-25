export const AuthorizedChats = new Set<number>();
export const AwaitingDate = new Set<number>();

export function addAuthorizedChat(chatId: number) {
  AuthorizedChats.add(chatId);
}
export function listAuthorizedChats(): number[] {
  return Array.from(AuthorizedChats);
}
