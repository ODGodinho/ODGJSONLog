import { MessageResponse } from "@odg/message";

import { JSONLoggerPlugin } from "~";

const headers = {
    "Content-Type": "application/html",
};

describe("Testis  Message Response", () => {
    const logger = new JSONLoggerPlugin("");

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
        const response: MessageResponse = new MessageResponse(
            {
                url: "null",
                method: "GET",
            },
            {
                data: null,
                status: 200,
                headers: headers,
            },
        );

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
