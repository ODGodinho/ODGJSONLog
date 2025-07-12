import { Exception, UnknownException } from "@odg/exception";
import { LogLevel } from "@odg/log";
import { type RequestInterface, MessageException } from "@odg/message";
import { vi } from "vitest";

import { JSONLoggerPlugin, JSONParserUnknownException } from "../../../src";

describe("Test Log Json", () => {
    const logger = new JSONLoggerPlugin("");
    vi.spyOn(logger, "logJSON").mockImplementation(async () => {
        throw new UnknownException("Anything");
    });

    test("Log Json Exception", async () => {
        await expect(logger.parser({
            original: {
                level: LogLevel.DEBUG,
                message: "test",
                context: {},
            },
            level: LogLevel.DEBUG,
            message: "test",
            context: {},
        })).rejects.toThrowError(new JSONParserUnknownException("JSON Plugin Parser exception"));
    });

    test("Log Json not Exception", async () => {
        const logger2 = new JSONLoggerPlugin("");
        await expect(logger2.parser({
            original: {
                level: LogLevel.DEBUG,
                message: "test",
                context: {},
            },
            level: LogLevel.DEBUG,
            message: "test",
            context: {},
        })).resolves.not.toThrow();
    });

    test("Log Json Message Exception", async () => {
        const logger2 = new JSONLoggerPlugin("");
        const request = {
            url: "/my-test-url",
        };
        await expect(logger2["getMessage"](new MessageException("teste", undefined, undefined, request, {
            data: "", headers: {}, status: 200,
        }))).resolves.toBe("/my-test-url");
    });

    test("Log Json Recursive", async () => {
        const logger2 = new JSONLoggerPlugin("");
        const log = { test: 1, log: {}};
        log.log = log;
        await expect(logger2["getMessage"](log)).resolves.not.toThrow();
    });

    test("Log Json Request", async () => {
        const logger2 = new JSONLoggerPlugin("");
        const log: RequestInterface<unknown> = { url: "/url", method: "GET", baseURL: "http://localhost:8000" };
        await expect(logger2["getMessage"](log)).resolves.toBe("http://localhost:8000/url");
    });

    test("Log Json Request Only BaseURL", async () => {
        const logger2 = new JSONLoggerPlugin("");
        const log: RequestInterface<unknown> = { method: "GET", baseURL: "http://localhost" };
        await expect(logger2["getRequestUrl"](log)).resolves.toBe("http://localhost");
    });

    test("Log Json Request", async () => {
        const logger2 = new JSONLoggerPlugin("");
        await expect(logger2["getMessage"](new Exception("Example"))).resolves.toBe("Example");
    });
});
