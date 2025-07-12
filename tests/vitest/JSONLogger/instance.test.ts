import { LogLevel } from "@odg/log";

import { JSONLoggerPlugin } from "../../../src";

describe("Test InstanceId", () => {
    const logger = new JSONLoggerPlugin("", 10, "instanceTest");

    test("Test Filled InstanceId", async () => {
        const logData = await logger.logJSON(LogLevel.DEBUG, "");

        expect(logData.instance).toBe("instanceTest");
    });

    test("Test Filled InstanceId", async () => {
        logger.setInstance("Change");
        const logData = await logger.logJSON(LogLevel.DEBUG, "");

        expect(logData.instance).toBe("Change");
    });
});
