import { type ResponseInterface } from "@odg/message";

import { JSONLoggerPlugin } from "~";

const headers = {
    "Content-Type": "application/html",
};

describe("Testis  Message Response", () => {
    const logger = new JSONLoggerPlugin("");
    test("Test valid message response", async () => {
        const response: ResponseInterface<unknown, unknown> = {
            data: null,
            status: 200,
            headers: headers,
            request: {},
        };

        const isMessageResponse = logger["isResponseMessage"](response);

        expect(isMessageResponse).toEqual(true);
    });

    test("Test is invalid message response", async () => {
        const response = {
            data: null,
            request: {},
        };

        const isMessageResponse = logger["isRequestMessage"](response);

        expect(isMessageResponse).toEqual(false);
    });
});

describe("Test Parser Response", () => {
    const logger = new JSONLoggerPlugin("");
    test("Parser Request Message", async () => {
        const response: ResponseInterface<unknown, unknown> = {
            data: null,
            status: 200,
            headers: headers,
            request: {
                url: "null",
                method: "GET",
            },
        };

        const requestParsed = await logger["parseRequest"](response);

        expect(requestParsed).toMatchObject({
            "url": "null",
            "method": "GET",
            "response": {
                "data": null,
                "status": 200,
                "headers": headers,
            },
        });
    });

    test.each([ "getRequestMessage", "parseRequest" ])("Parser Request Invalid Message", async (parseFunction) => {
        const message = logger[parseFunction as "getRequestMessage" | "parseRequest"]({});
        await expect(message).resolves.toBeUndefined();
    });
});
