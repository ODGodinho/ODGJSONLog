import { type RequestInterface } from "@odg/message";

import { JSONLoggerPlugin } from "../../../../src";

describe("Test Is Message Request", () => {
    const logger = new JSONLoggerPlugin("");
    test("Test valid message request", async () => {
        const request: RequestInterface<unknown> = {
            url: "null",
            method: "GET",
        };

        const isMessageRequest = logger["isRequestMessage"](request);

        expect(isMessageRequest).toEqual(true);
    });

    test("Test is invalid message request", async () => {
        const request: RequestInterface<unknown> = {
            url: undefined,
        };

        const isMessageResponse = logger["isRequestMessage"](request);

        expect(isMessageResponse).toEqual(false);
    });
});

describe("Test Parser Request", () => {
    test("Parser Request Message", async () => {
        const logger = new JSONLoggerPlugin("");
        const request: RequestInterface<unknown> = {
            url: "null",
            method: "GET",
        };

        const requestParsed = await logger["parseRequest"](request);

        expect(requestParsed).toMatchObject(request);
    });
});
