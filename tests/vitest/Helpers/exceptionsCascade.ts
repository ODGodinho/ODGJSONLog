import { type ExceptionType } from "../../../@types/Exceptions";
import { JSONParserUnknownException } from "../../../src";

const exceptionsCascade = ((): ExceptionType[] => {
    const baseException1 = new JSONParserUnknownException("anything1");
    const baseException2 = new JSONParserUnknownException("anything2", baseException1);
    const baseException3 = new JSONParserUnknownException("anything3", baseException2);
    const baseException4 = new JSONParserUnknownException("anything4", baseException3);
    const baseException5 = new JSONParserUnknownException("anything5", baseException4);

    return [
        {
            exception: baseException1,
            data: {
                fileLine: 5,
                fileColumn: 28,
            },
        },
        {
            exception: baseException2,
            data: {
                fileLine: 6,
                fileColumn: 28,
            },
        },
        {
            exception: baseException3,
            data: {
                fileLine: 7,
                fileColumn: 28,
            },
        },
        {
            exception: baseException4,
            data: {
                fileLine: 8,
                fileColumn: 28,
            },
        },
        {
            exception: baseException5,
            data: {
                fileLine: 9,
                fileColumn: 28,
            },
        },
    ];
})();

export default exceptionsCascade;
