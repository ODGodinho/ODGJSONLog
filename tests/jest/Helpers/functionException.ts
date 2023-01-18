import { type ExceptionType } from "../../../@types/Exceptions";
import { JSONParserUnknownException } from "../../../src";

export function functionException(): ExceptionType {
    return {
        exception: new JSONParserUnknownException("functionExample"),
        data: {
            type: "JSONParserUnknownException", // Exception Name
            message: "functionExample",
            functionName: "functionException",
            fileLine: 6, // Top line number
            fileColumn: 20, // Top column number
        },
    };
}
