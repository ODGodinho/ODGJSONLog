import { UnknownException } from "@odg/exception";
import { LogLevel } from "@odg/log";
import { vi } from "vitest";

import { JSONLoggerPlugin } from "../../../../src";

interface LoggerGithubType {
    getGitRelease(): Promise<string>;
    getGitBranch(): Promise<string>;
}

describe("Test Git Release/Branch", () => {
    test("Test Mock Exception", async () => {
        const logger = new JSONLoggerPlugin("appName");
        const spyRelease = vi.spyOn(logger as unknown as LoggerGithubType, "getGitRelease");
        const spyBranch = vi.spyOn(logger as unknown as LoggerGithubType, "getGitBranch");
        const spyList = [ spyRelease, spyBranch ];
        for (const spy of spyList) {
            spy.mockImplementation(async (): Promise<never> => {
                throw new UnknownException("Anything");
            });
        }

        await expect(logger.logJSON(LogLevel.DEBUG, "test")).resolves.toEqual(
            expect.objectContaining({
                "index": "appName",
                "git": {
                    "branch": undefined,
                    "release": undefined,
                },
            }),
        );
    });

    test("Set Git Release/Branch", async () => {
        const logger = new JSONLoggerPlugin("appName");
        logger.setGitRelease("1.0.0");
        logger.setGitBranch("1.0.1");
        await expect(logger.logJSON(LogLevel.DEBUG, "test")).resolves.toEqual(
            expect.objectContaining({
                "index": "appName",
                "git": {
                    "branch": "1.0.1",
                    "release": "1.0.0",
                },
            }),
        );
    });
});
