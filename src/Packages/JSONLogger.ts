import { type LogLevel } from "@odg/log";

import {
    type GitLoggerInterface,
    type LoggerObjectInterface,
    type ExceptionObjectLoggerInterface,
    type LoggerObjectRequestInterface,
} from "..";

export class JSONLogger implements LoggerObjectInterface {

    public type: LogLevel;

    public index: string;

    public instance: string;

    public message: string;

    public createdAt: Date;

    public identifier?: string;

    public git?: GitLoggerInterface;

    public exception?: ExceptionObjectLoggerInterface;

    public exceptionPreview?: ExceptionObjectLoggerInterface[];

    public request?: LoggerObjectRequestInterface;

    public constructor(options: LoggerObjectInterface) {
        this.type = options.type;
        this.index = options.index;
        this.instance = options.instance;
        this.message = options.message;
        this.createdAt = options.createdAt;
        this.identifier = options.identifier;
        this.git = options.git;
        this.exception = options.exception;
        this.exceptionPreview = options.exceptionPreview;
        this.request = options.request;
    }

}
