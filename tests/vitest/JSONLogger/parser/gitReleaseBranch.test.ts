import { UnknownException } from "@odg/exception";
import { LogLevel } from "@odg/log";
import { type MockInstance, vi } from "vitest";

import { JSONLoggerPlugin } from "../../../../src";

interface LoggerGithubType {
    getGitRelease(): Promise<string>;
    getGitBranch(): Promise<string>;
}

describe("Test Git Release/Branch", () => {
    let logger: JSONLoggerPlugin;
    let spyRelease: MockInstance<[], Promise<string>>;
    let spyBranch: MockInstance<[], Promise<string>>;

    beforeEach(() => {
        logger = new JSONLoggerPlugin("appName");
        spyRelease = vi.spyOn(logger as unknown as LoggerGithubType, "getGitRelease");
        spyBranch = vi.spyOn(logger as unknown as LoggerGithubType, "getGitBranch");
        const spyList = [ spyRelease, spyBranch ];
        for (const spy of spyList) {
            spy.mockImplementation(async (): Promise<never> => {
                throw new UnknownException("Anything");
            });
        }
    });

    test("Test Mock Exception", async () => {
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

    test("Set Git Release", async () => {
        logger.setGitRelease("1.0.0");
        await expect(logger.logJSON(LogLevel.DEBUG, "test")).resolves.toEqual(
            expect.objectContaining({
                "index": "appName",
                "git": {
                    "branch": undefined,
                    "release": "1.0.0",
                },
            }),
        );
    });

    test("Set Git Release", async () => {
        logger.setGitBranch("1.0.0");
        await expect(logger.logJSON(LogLevel.DEBUG, "test")).resolves.toEqual(
            expect.objectContaining({
                "index": "appName",
                "git": {
                    "branch": "1.0.0",
                    "release": undefined,
                },
            }),
        );
    });
});
