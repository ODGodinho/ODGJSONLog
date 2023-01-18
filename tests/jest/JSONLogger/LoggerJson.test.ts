import { UnknownException } from "@odg/exception";
import { LogLevel } from "@odg/log";

import { JSONLoggerPlugin, JSONParserUnknownException } from "../../../src";

describe("Test Log Json", () => {
    const logger = new JSONLoggerPlugin("");
    jest.spyOn(logger, "logJSON").mockImplementation(async () => {
        throw new UnknownException("Anything");
    });

    test("Log Json Exception", async () => {
        await expect(logger.parser({
            level: LogLevel.DEBUG,
            message: "test",
            originalMessage: "test",
            context: {},
        })).rejects.toThrowError(new JSONParserUnknownException("JSON Plugin Parser exception"));
    });
});
