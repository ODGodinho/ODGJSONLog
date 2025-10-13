import { LogLevel } from "@odg/log";
import { vi } from "vitest";

import { JSONLoggerPlugin } from "../../../src";

describe("Test InstanceId", () => {
    test("Test Filled InstanceId", async () => {
        const logger = new JSONLoggerPlugin("", 10, "instanceTest");
        const logData = await logger.logJSON(LogLevel.DEBUG, "");

        expect(logData.instance).toBe("instanceTest");
    });

    test("Test Filled InstanceId", async () => {
        const logger = new JSONLoggerPlugin("", 10, "instanceTest");
        logger.setInstance("Change");
        const logData = await logger.logJSON(LogLevel.DEBUG, "");

        expect(logData.instance).toBe("Change");
    });

    test("Test instance if not nodejs", async () => {
        const loggerNotNode = new JSONLoggerPlugin("");
        vi.spyOn(loggerNotNode as unknown as { isNode(): boolean }, "isNode").mockReturnValue(false);
        await expect(loggerNotNode.logJSON(LogLevel.DEBUG, "")).resolves.toMatchObject({
            instance: "unknown",
        });
    });
});
