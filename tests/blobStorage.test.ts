import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const putMock = vi.fn();
const getMock = vi.fn();

vi.mock("@vercel/blob", () => ({
  put: (...args: unknown[]) => putMock(...args),
  get: (...args: unknown[]) => getMock(...args),
}));

import {
  VercelBlobStorageProvider,
  getStorageProvider,
  LocalDiskStorageProvider,
} from "@/lib/storage";

const pdf = Buffer.from("%PDF-1.4 test document");

describe("VercelBlobStorageProvider", () => {
  beforeEach(() => {
    putMock.mockReset();
    getMock.mockReset();
  });

  afterEach(() => {
    delete process.env.BLOB_READ_WRITE_TOKEN;
  });

  it("stores files in a private store under an allowed subfolder", async () => {
    putMock.mockResolvedValue({});
    const result = await new VercelBlobStorageProvider().saveFile(pdf, "../My Kundli.pdf", "application/pdf", "vault");

    expect(result.storageKey).toMatch(/^vault\/\d+_[a-z0-9]+_My_Kundli\.pdf$/);
    expect(putMock).toHaveBeenCalledWith(
      result.storageKey,
      pdf,
      expect.objectContaining({ access: "private", addRandomSuffix: false, contentType: "application/pdf" })
    );
  });

  it("rejects non-document content and unknown subfolders", async () => {
    const provider = new VercelBlobStorageProvider();
    await expect(provider.saveFile(Buffer.from("MZ not allowed"), "a.exe", "application/pdf")).rejects.toThrow(
      "Invalid file content"
    );
    await expect(provider.saveFile(pdf, "a.pdf", "application/pdf", "secrets")).rejects.toThrow("Invalid storage subfolder");
    expect(putMock).not.toHaveBeenCalled();
  });

  it("reads files back and refuses traversal keys", async () => {
    getMock.mockResolvedValue({
      statusCode: 200,
      stream: new Response(pdf).body,
      blob: { contentType: "application/pdf", size: pdf.length },
    });
    const provider = new VercelBlobStorageProvider();

    const file = await provider.getFile("vault/123_abc_k.pdf");
    expect(file.buffer.equals(pdf)).toBe(true);
    expect(file.mimeType).toBe("application/pdf");

    await expect(provider.getFile("vault/../etc/passwd")).rejects.toThrow("Invalid storage path");
    await expect(provider.getFile("other/file.pdf")).rejects.toThrow("Invalid storage subfolder");

    getMock.mockResolvedValue(null);
    await expect(provider.getFile("vault/missing.pdf")).rejects.toThrow("File not found");
  });

  it("is selected only when BLOB_READ_WRITE_TOKEN is set", () => {
    process.env.BLOB_READ_WRITE_TOKEN = "vercel_blob_rw_test";
    expect(getStorageProvider()).toBeInstanceOf(VercelBlobStorageProvider);
    delete process.env.BLOB_READ_WRITE_TOKEN;
    expect(getStorageProvider()).toBeInstanceOf(LocalDiskStorageProvider);
  });
});
