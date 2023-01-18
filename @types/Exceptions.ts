import { type JSONParserUnknownException, type ExceptionObjectLoggerInterface } from "../src";

export type ExceptionType = {
    data: Partial<ExceptionObjectLoggerInterface>;
} & { exception: JSONParserUnknownException };
