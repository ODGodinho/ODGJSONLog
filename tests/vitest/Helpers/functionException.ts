import { type ExceptionType } from "../../../@types/Exceptions";
import { JSONParserUnknownException } from "../../../src";

export function functionException(): ExceptionType {
    const exception = new JSONParserUnknownException("functionExample");

    return {
        exception: exception,
        data: {
            type: "JSONParserUnknownException", // Exception Name
            message: "functionExample",
            functionName: "Module.functionException",
            fileLine: 5, // Top line number
            fileColumn: 23, // Top column number
            fileException: `${process.cwd()}\\tests\\vitest\\Helpers\\functionException.ts`,
        },
    };
}
