import { type ExceptionType } from "../../../@types/Exceptions";
import { JSONParserUnknownException } from "../../../src";

export const globalException: ExceptionType = {
    exception: new JSONParserUnknownException("anything"),
    data: {
        type: "JSONParserUnknownException", // Exception Name
        message: "anything",
        functionName: "Object.<anonymous>",
        fileLine: 5, // Top line number
        fileColumn: 16, // Top column number
    },
};
