import { JSONLoggerPlugin } from "../../../../src";
import exceptionsCascade from "../../Helpers/exceptionsCascade";

describe("Test Previous Exception Parser", () => {
    test("Test Base Exception Limit 3", async () => {
        const logger = new JSONLoggerPlugin("", 3);
        const lastExceptionBaseObject = exceptionsCascade[exceptionsCascade.length - 1];
        const exceptionObjects = await logger["parseExceptionPrevious"](lastExceptionBaseObject.exception);

        expect(exceptionObjects).toBeDefined();
        expect(exceptionObjects?.length).toEqual(3);

        return true;
    });

    let currentException = -1;
    test.each(exceptionsCascade)("Test Base Exception Limit 10", async (exceptionCascade) => {
        ++currentException;
        const logger = new JSONLoggerPlugin("", 10);
        const exceptionObjects = await logger["parseExceptionPrevious"](exceptionCascade.exception);

        if (currentException === 0) {
            expect(exceptionCascade.exception.getPrevious()).toBeUndefined();

            return;
        }

        expect(exceptionObjects).toBeDefined();
        expect(exceptionObjects?.length).toEqual(currentException);
    });
});
