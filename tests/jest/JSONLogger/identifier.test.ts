import { randomUUID } from "node:crypto";

import { LogLevel } from "@odg/log";

import { JSONLoggerPlugin, JSONLogger } from "../../../src";

describe("Test Identifier log fill", () => {
    const logger = new JSONLoggerPlugin("");
    const identifier = randomUUID();

    test("Identifier Not Init", () => {
        expect(logger["identifier"]).toBeUndefined();
    });

    test("Identifier Init", () => {
        logger.setIdentifier(identifier);

        expect(logger["identifier"]).toBe(identifier);
    });

    test("Test Log Identifier JSON", async () => {
        const logData = await logger.logJSON(LogLevel.DEBUG, "");

        expect(logData.identifier).toBe(identifier);
    });

    test("Test Log instanceof", async () => {
        const logData = logger.logJSON(LogLevel.DEBUG, "");

        await expect(logData).resolves.toBeInstanceOf(JSONLogger);
    });
});
