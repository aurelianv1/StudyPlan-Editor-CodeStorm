import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiError, compareDocuments, readErrorMessage, streamChat } from "./api";

function streamOf(...chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      chunks.forEach((chunk) => controller.enqueue(encoder.encode(chunk)));
      controller.close();
    },
  });
}

function mockFetch(response: Response | Error) {
  const fetchMock = vi.fn(async () => {
    if (response instanceof Error) throw response;
    return response;
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => vi.unstubAllGlobals());

describe("readErrorMessage", () => {
  it("uses FastAPI's detail string", async () => {
    const response = new Response('{"detail":"Fișier prea mare"}', { status: 413 });
    expect(await readErrorMessage(response)).toBe("Fișier prea mare");
  });

  it("joins validation errors", async () => {
    const body = JSON.stringify({ detail: [{ msg: "Field required" }, { msg: "Too short" }] });
    expect(await readErrorMessage(new Response(body, { status: 422 }))).toBe(
      "Field required; Too short",
    );
  });

  it("falls back to the raw text, then to the status code", async () => {
    expect(await readErrorMessage(new Response("Bad Gateway", { status: 502 }))).toBe(
      "Bad Gateway",
    );
    expect(await readErrorMessage(new Response("", { status: 500 }))).toContain("500");
  });
});

describe("requests", () => {
  const file = new File(["x"], "fisa.docx");

  it("posts the files under the field names the backend expects", async () => {
    const fetchMock = mockFetch(Response.json({ sections: [] }));
    await compareDocuments(file, file);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("http://localhost:8000/upload");
    expect(Array.from((init.body as FormData).keys())).toEqual(["old_doc", "new_template"]);
  });

  it("turns an error response into an ApiError with the server's message", async () => {
    mockFetch(new Response('{"detail":"Format neacceptat"}', { status: 415 }));
    await expect(compareDocuments(file, file)).rejects.toMatchObject({
      name: "ApiError",
      status: 415,
      message: "Format neacceptat",
    });
  });

  it("explains when the server cannot be reached", async () => {
    mockFetch(new TypeError("Failed to fetch"));
    const error = await compareDocuments(file, file).catch((caught) => caught);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(0);
  });
});

describe("streamChat", () => {
  const request = { messages: [{ role: "user" as const, content: "Salut" }], document: "" };

  it("reassembles an answer whose events are split across chunks", async () => {
    mockFetch(
      new Response(
        streamOf('data: {"text":"Bu', 'nă"}\n\ndata: {"text":" ziua"}\n\n', "data: [DONE]\n\n"),
      ),
    );
    const pieces: string[] = [];
    const answer = await streamChat(request, (text) => pieces.push(text));
    expect(answer).toBe("Bună ziua");
    expect(pieces).toEqual(["Bună", " ziua"]);
  });

  it("rejects when the stream carries an error event", async () => {
    mockFetch(new Response(streamOf('data: {"error":"cheie invalidă"}\n\ndata: [DONE]\n\n')));
    await expect(streamChat(request, () => {})).rejects.toThrow("cheie invalidă");
  });
});
