import { type LogLevel } from "@odg/log";

import { type LoggerObjectInterface, type ExceptionObjectLoggerInterface, type LoggerObjectRequestInterface } from "..";

export class JSONLogger implements LoggerObjectInterface {

    // eslint-disable-next-line better-max-params/better-max-params
    public constructor(
        public type: LogLevel,
        public index: string,
        public instance: string,
        public message: unknown,
        public createdAt: Date,
        public identifier?: string,
        public gitRelease?: string,
        public gitBranch?: string,
        public exception?: ExceptionObjectLoggerInterface,
        public exceptionPreview?: ExceptionObjectLoggerInterface[],
        public request?: LoggerObjectRequestInterface,
    ) {
    }

}
