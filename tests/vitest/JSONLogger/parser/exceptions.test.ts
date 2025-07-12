import { Exception } from "@odg/exception";

import { type ExceptionType } from "../../../../@types/Exceptions";
import { JSONLoggerPlugin } from "../../../../src";
import exceptionsCascade from "../../Helpers/exceptionsCascade";
import { functionException } from "../../Helpers/functionException";
import { globalException } from "../../Helpers/globalException";

const exceptionCases: ExceptionType[] = [
    functionException(),
    globalException,
    ...exceptionsCascade,
];

describe("Test Exception Parser", () => {
    const logger = new JSONLoggerPlugin("");
    test.each(exceptionCases)("Teste Exception match", async (exception) => {
        const exceptionObject = await logger["parseException"](exception.exception);
        delete exceptionObject?.stack;
        expect(exceptionObject).toMatchObject({
            ...exception.data,
        });
    });

    test("Test Exception Without Stack", async () => {
        const exception = new Exception("Teste Exception");
        exception.stack = undefined;

        const exceptionObject = await logger["parseException"](exception);
        expect(exceptionObject).toEqual(
            expect.objectContaining({
                stack: undefined,
            }),
        );

        return true;
    });
});
