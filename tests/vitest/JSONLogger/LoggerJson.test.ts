import { UnknownException } from "@odg/exception";
import { LogLevel } from "@odg/log";
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
});
