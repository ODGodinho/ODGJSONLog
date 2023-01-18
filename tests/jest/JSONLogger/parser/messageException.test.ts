import { MessageException } from "@odg/message";

import { JSONLoggerPlugin } from "../../../../src";

describe("Test Message Exception", () => {
    const logger = new JSONLoggerPlugin("");
    const request = {
        url: "example",
    };
    const exception = new MessageException("error", undefined, undefined, request, {
        data: null,
        status: 200,
        headers: {},
        request: request,
    });

    test("Test request message by exception", async () => {
        const requestMessage = logger["getRequestMessage"](exception);

        await expect(requestMessage).resolves.toEqual({
            url: "example",
        });
    });

    test("Test response message by exception", async () => {
        const responseMessage = logger["getResponseMessage"](exception);

        await expect(responseMessage).resolves.toEqual({
            data: null,
            status: 200,
            headers: {},
            request: {
                url: "example",
            },
        });
    });
});
