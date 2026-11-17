import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import type { ApiClient } from "./api";
import { API_URL } from "./config";

/** A file name that is safe to write in the app's cache. */
export function cacheFileName(id: string, name: string): string {
  return `${id}-${name.replace(/[^\w.\- ]+/g, "_")}`.slice(0, 120);
}

/**
 * Downloads a page of the Kendra's server that needs the person's sign-in (an invoice, a ticket, a
 * Vault file) into the app's cache and hands it to the phone's own viewer or share sheet.
 */
export async function downloadAndShare(api: ApiClient, path: string, fileName: string, mimeType: string, dialogTitle: string): Promise<void> {
  await api.me(); // refreshes the sign-in first if it has expired
  const token = await api.accessToken();
  if (!token) throw new Error("Please sign in again.");
  const destination = new File(Paths.cache, fileName);
  const saved = await File.downloadFileAsync(`${API_URL}${path}`, destination, {
    headers: { Authorization: `Bearer ${token}` },
    idempotent: true,
  });
  if (!(await Sharing.isAvailableAsync())) throw new Error("This phone cannot open the file.");
  await Sharing.shareAsync(saved.uri, { mimeType, dialogTitle });
}
