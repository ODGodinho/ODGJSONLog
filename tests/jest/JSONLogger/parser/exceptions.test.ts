import { JSONLoggerPlugin } from "../../../../src";
import exceptionsCascade from "../../Helpers/exceptionsCascade";
import { functionException } from "../../Helpers/functionException";
import { globalException } from "../../Helpers/globalException";

const exceptionCases = [
    functionException(),
    globalException,
    ...exceptionsCascade,
];

describe("Test Exception Parser", () => {
    const logger = new JSONLoggerPlugin("");
    test.each(exceptionCases)("Teste Exception match", async (exception) => {
        const exceptionObject = await logger["parseException"](exception.exception);
        expect(exceptionObject).toMatchObject({
            ...exception.data,
        });

        return true;
    });
});
