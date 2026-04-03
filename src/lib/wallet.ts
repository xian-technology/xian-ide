/**
 * Wallet integration via window.xian provider (injected by the browser extension).
 */

export interface WalletInfo {
  connected: boolean;
  locked: boolean;
  accounts: string[];
  selectedAccount?: string;
  chainId?: string;
}

export function isWalletAvailable(): boolean {
  return typeof window !== "undefined" && "xian" in window;
}

async function request(method: string, params?: unknown[]): Promise<unknown> {
  if (!isWalletAvailable()) {
    throw new Error("Xian wallet extension not detected. Install it and reload.");
  }
  return (window as any).xian.request({ method, params: params ?? [] });
}

export async function connect(): Promise<string[]> {
  const accounts = (await request("xian_requestAccounts")) as string[];
  return accounts;
}

export async function getWalletInfo(): Promise<WalletInfo> {
  const info = (await request("xian_getWalletInfo")) as WalletInfo;
  return info;
}

export async function getAccounts(): Promise<string[]> {
  return (await request("xian_accounts")) as string[];
}

export async function sendTransaction(payload: {
  contract: string;
  function: string;
  kwargs: Record<string, unknown>;
  stamps: number;
}): Promise<unknown> {
  return request("xian_sendTransaction", [payload]);
}

export async function signMessage(message: string): Promise<string> {
  return (await request("xian_signMessage", [{ message }])) as string;
}

// Listen for account/chain changes
export function onAccountsChanged(cb: (accounts: string[]) => void): () => void {
  if (!isWalletAvailable()) return () => {};
  const handler = (accounts: string[]) => cb(accounts);
  (window as any).xian.on("accountsChanged", handler);
  return () => (window as any).xian.removeListener("accountsChanged", handler);
}

export function onChainChanged(cb: (chainId: string) => void): () => void {
  if (!isWalletAvailable()) return () => {};
  const handler = (chainId: string) => cb(chainId);
  (window as any).xian.on("chainChanged", handler);
  return () => (window as any).xian.removeListener("chainChanged", handler);
}
