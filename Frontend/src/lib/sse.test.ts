import { describe, expect, it } from "vitest";

import { createSseParser } from "./sse";

describe("createSseParser", () => {
  it("returns the data payload of every complete line", () => {
    const parser = createSseParser();
    expect(parser.push('data: {"text":"a"}\n\ndata: [DONE]\n\n')).toEqual([
      '{"text":"a"}',
      "[DONE]",
    ]);
  });

  it("keeps a line that was cut by the network until the rest arrives", () => {
    const parser = createSseParser();
    expect(parser.push('data: {"text":"Bu')).toEqual([]);
    expect(parser.push('nă"}\n\n')).toEqual(['{"text":"Bună"}']);
  });

  it("ignores comments and other fields", () => {
    const parser = createSseParser();
    expect(parser.push(": keep-alive\nevent: ping\ndata: x\r\n")).toEqual(["x"]);
  });
});
