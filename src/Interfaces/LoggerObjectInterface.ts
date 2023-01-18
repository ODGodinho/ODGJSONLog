import { type LogLevel } from "@odg/log";
import { type RequestInterface } from "@odg/message";
import { type ResponseInterface } from "@odg/message/dist/interfaces/response";

export interface ExceptionObjectLoggerInterface {
    "type": string;
    "message": string;
    "fileException"?: string;
    "functionName"?: string;
    "fileLine"?: number;
    "fileColumn"?: number;
    "stack"?: string;
}

export type LoggerObjectRequestInterface = RequestInterface<unknown> & {
    response?: Omit<ResponseInterface<unknown, unknown>, "request">;
};

export interface LoggerObjectInterface {
    type: LogLevel;
    index: string;
    instance: string;
    identifier?: string;
    gitRelease?: string;
    gitBranch?: string;
    exception?: ExceptionObjectLoggerInterface;
    exceptionPreview?: ExceptionObjectLoggerInterface[];
    request?: LoggerObjectRequestInterface;
    createdAt: Date;
}
