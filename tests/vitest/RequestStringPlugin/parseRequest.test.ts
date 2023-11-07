import { Exception } from "@odg/exception";
import { type LoggerParserInterface } from "@odg/log";
import { LogLevel } from "@odg/log";
import { vi } from "vitest";

import { JSONParserException, JSONParserUnknownException, type LoggerStringInterface } from "src";
import { JSONLogger } from "src";
import { JSONLoggerString } from "src/Packages/JSONLoggerString";
import { RequestStringPlugin } from "src/Packages/RequestStringPlugin";

describe("Test parse request", async () => {
    const headers = {
        example: "header-example",
    };
    let plugin: RequestStringPlugin;
    let parser: Omit<LoggerParserInterface, "message"> & { message: LoggerStringInterface };
    beforeAll(async () => {
        plugin = new RequestStringPlugin();
        parser = await plugin.parser({
            level: LogLevel.INFO,
            message: new JSONLogger({
                index: "example",
                createdAt: new Date(),
                instance: "unknown",
                message: "request",
                type: LogLevel.INFO,
                request: {
                    url: "http://localhost:3000",
                    headers: headers,
                    response: {
                        status: 200,
                        data: {
                            "ok": "response json example",
                        },
                        headers: {
                            "content-type": "json",
                        },
                    },
                },
            }),
            original: {
                message: "",
                level: LogLevel.INFO,
            },
        }) as Omit<LoggerParserInterface, "message"> & { message: LoggerStringInterface };
    });

    test("Test parse body", () => {
        expect(parser.message.request).toMatchObject({
            "url": "http://localhost:3000",
            "headers": JSON.stringify(headers),
        });

        expect(parser.message.request?.response?.status).toBe(200);
        expect(parser.message.request?.response?.data).toBe("{\"ok\":\"response json example\"}");
        expect(parser.message.request?.response?.headers).toBe("{\"content-type\":\"json\"}");
    });

    test("Throw not JSONLogger", async () => {
        await expect(plugin.parser({
            message: "",
            level: LogLevel.INFO,
            original: {
                message: "",
                level: LogLevel.INFO,
            },
        })).rejects.toThrow(JSONParserException);
    });

    test("Throw not JSONLogger", async () => {
        const pluginTest = new RequestStringPlugin();
        const spy = vi.spyOn(pluginTest, "requestToString" as keyof typeof pluginTest);
        spy.mockImplementation(() => {
            throw new Exception("test");
        });
        await expect(pluginTest.parser({
            message: new JSONLogger({
                index: "example",
                createdAt: new Date(),
                instance: "unknown",
                message: "request",
                type: LogLevel.INFO,
            }),
            level: LogLevel.INFO,
            original: {
                message: "",
                level: LogLevel.INFO,
            },
        })).rejects.toThrow(JSONParserUnknownException);
        spy.mockReset();
    });

    test("Test without with empty response", async () => {
        const newParser = await plugin.parser({
            message: new JSONLogger({
                index: "example",
                createdAt: new Date(),
                instance: "unknown",
                message: "request",
                type: LogLevel.INFO,
                request: {
                    url: "https://test",
                    response: undefined,
                },
            }),
            level: LogLevel.INFO,
            original: {
                message: "",
                level: LogLevel.INFO,
            },
        });
        expect(newParser.message).toBeInstanceOf(JSONLoggerString);
        expect((newParser.message as JSONLoggerString).request).toMatchObject({
            url: "https://test",
            response: undefined,
        });
    });

    test("Test without request", async () => {
        const newParser = await plugin.parser({
            message: new JSONLogger({
                index: "example",
                createdAt: new Date(),
                instance: "unknown",
                message: "request",
                type: LogLevel.INFO,
            }),
            level: LogLevel.INFO,
            original: {
                message: "",
                level: LogLevel.INFO,
            },
        });
        expect(newParser.message).toBeInstanceOf(JSONLoggerString);
        expect(newParser.message).toMatchObject({
            request: undefined,
        });
    });
});
