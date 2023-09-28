import { type LogLevel } from "@odg/log";

import {
    type LoggerStringInterface,
    type LoggerRequestStringInterface,
    type GitLoggerInterface,
    type ExceptionObjectLoggerInterface,
} from "..";

export class JSONLoggerString {

    public type: LogLevel;

    public index: string;

    public instance: string;

    public message: string;

    public createdAt: Date;

    public identifier?: string;

    public git?: GitLoggerInterface;

    public exception?: ExceptionObjectLoggerInterface;

    public exceptionPreview?: ExceptionObjectLoggerInterface[];

    public declare request?: LoggerRequestStringInterface;

    // eslint-disable-next-line max-statements
    public constructor(options: LoggerStringInterface) {
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
