import { type LogLevel } from "@odg/log";
import { type RequestInterface, type ResponseInterface } from "@odg/message";

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
    response?: ResponseInterface<unknown>;
};

export interface GitLoggerInterface {
    release?: string;
    branch?: string;
}

export interface LoggerObjectInterface {
    type: LogLevel;
    index: string;
    instance: string;
    message: string;
    identifier?: string;
    git?: GitLoggerInterface;
    exception?: ExceptionObjectLoggerInterface;
    exceptionPreview?: ExceptionObjectLoggerInterface[];
    request?: LoggerObjectRequestInterface;
    createdAt: Date;
}

export interface LoggerStringInterface extends Omit<LoggerObjectInterface, "request"> {
    request?: LoggerRequestStringInterface;
}

export interface LoggerRequestStringInterface extends Omit<
    LoggerObjectRequestInterface, "data" | "headers" | "params" | "proxy" | "response"
> {
    headers: string;
    data: string;
    params: string;
    proxy: string;
    response?: {
        data: string;
        status: number;
        headers: string;
    };
}
