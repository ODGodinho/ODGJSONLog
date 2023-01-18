import { exec } from "node:child_process";
import util, { promisify } from "node:util";

import { Exception } from "@odg/exception";
import {
    type LogLevel,
    type LoggerParserInterface,
    type LoggerPluginInterface,
} from "@odg/log";
import { MessageException, type ResponseInterface, type RequestInterface } from "@odg/message";
import ErrorStackParser from "error-stack-parser";

import { JSONParserUnknownException } from "../Exceptions/JSONParserUnknownException";
import {
    type LoggerObjectRequestInterface,
    type ExceptionObjectLoggerInterface,
} from "../Interfaces";

import { JSONLogger } from "./JSONLogger";

export class JSONLoggerPlugin implements LoggerPluginInterface {

    /**
     * Identifier for the current log
     *
     * @type {string}
     */
    protected identifier?: string;

    public constructor(
        protected readonly appName: string,
        protected readonly maxExceptionPreview: number = 10,
        protected readonly instanceId?: string,
    ) { }

    /**
     * Plugin parser Function return new message with JSON format
     *
     * @param {LoggerParserInterface} data Received Data params
     * @returns {Promise<LoggerParserInterface>}
     */
    public async parser(data: LoggerParserInterface): Promise<LoggerParserInterface> {
        try {
            return {
                ...data,
                message: await this.logJSON(data.level, data.message),
            };
        } catch (error) {
            throw new JSONParserUnknownException("JSON Plugin Parser exception", error);
        }
    }

    public async logJSON(level: LogLevel, message: unknown): Promise<JSONLogger> {
        return new JSONLogger(
            level,
            this.appName,
            this.getInstance(),
            JSON.stringify(message) || util.format(message),
            new Date(),
            this.identifier,
            await this.getGitRelease().catch(() => void 0),
            await this.getGitBranch().catch(() => void 0),
            await this.parseException(message),
            await this.parseExceptionPreview(message),
            await this.parseRequest(message),
        );
    }

    /**
     * Define a unique identifier for the current request, for
     * Example: Request ID, Transaction ID, Crawler Process, etc
     *
     * @param {string} identifier Unique identifier
     * @memberof JSONLoggerPlugin
     */
    public setIdentifier(identifier: string): void {
        this.identifier = identifier;
    }

    /**
     * Return instance HostName, identifier
     *
     * @returns {string}
     */
    protected getInstance(): string {
        return this.instanceId!
            || process.env.HOSTNAME!
            || process.env.CONTAINER_ID!
            || "unknown";
    }

    /**
     * Return git tag name
     *
     * @returns {Promise<string>}
     */
    protected async getGitRelease(): Promise<string> {
        const command = promisify(exec);
        const gitVersion = await command("git describe --tags --abbrev=41");

        return gitVersion.stdout.trim();
    }

    /**
     * Return git tag name
     *
     * @returns {Promise<string>}
     */
    protected async getGitBranch(): Promise<string> {
        const command = promisify(exec);
        const gitVersion = await command("git rev-parse --abbrev-ref HEAD");

        return gitVersion.stdout.trim();
    }

    /**
     * If Message is a Exception, parse to ExceptionObjectLoggerInterface
     *
     * @param {unknown} exception Possible Exception
     * @returns {Promise<ExceptionObjectLoggerInterface | undefined>}
     */
    protected async parseException(exception: unknown): Promise<ExceptionObjectLoggerInterface | undefined> {
        if (!(exception instanceof Error)) return;
        const trace = exception.stack ? ErrorStackParser.parse(exception) : undefined;

        return {
            "type": exception.name,
            "message": exception.message,
            "fileException": trace?.[0]?.getFileName(),
            "functionName": trace?.[0]?.getFunctionName(),
            "fileLine": trace?.[0]?.getLineNumber(),
            "fileColumn": trace?.[0]?.getColumnNumber(),
            "stack": exception.stack,
        };
    }

    /**
     * If Message is a Exception, get All Exception Preview and parse to ExceptionObjectLoggerInterface
     *
     * @param {unknown} exception Possible Exception
     * @returns {Promise<ExceptionObjectLoggerInterface | undefined>}
     */
    protected async parseExceptionPreview(exception: unknown): Promise<ExceptionObjectLoggerInterface[] | undefined> {
        if (!(exception instanceof Exception)) return;

        const exceptionCollection: ExceptionObjectLoggerInterface[] = [];
        let exceptionBase = exception.preview;
        let exceptionCount = 0;

        do {
            const parsedException = await this.parseException(exceptionBase);
            if (parsedException) exceptionCollection.push(parsedException);
            exceptionBase = exceptionBase?.preview;
        } while (exceptionBase && ++exceptionCount < this.maxExceptionPreview);

        return exceptionCollection;
    }

    /**
     * Parser Request and Response
     *
     * @protected
     * @param {unknown} message Possible Message/Request
     * @returns {Promise<LoggerObjectRequestInterface | undefined>}
     * @memberof JSONLoggerPlugin
     */
    protected async parseRequest(message: unknown): Promise<LoggerObjectRequestInterface | undefined> {
        if (!await this.isRequestOrResponseMessage(message)) return;
        const request = await this.getRequestMessage(message);
        const response = await this.getResponseMessage(message);

        return {
            ...request,
            response: response && {
                ...(Object.fromEntries(
                    Object.entries(response).filter(([ key ]) => key !== "request"),
                ) as Omit<ResponseInterface<unknown, unknown>, "request">),
            },
        };
    }

    /**
     * Get Response
     *
     * @protected
     * @param {unknown} message Possible Request/Message
     * @returns {Promise<ResponseInterface<unknown, unknown> | undefined>}
     * @memberof JSONLoggerPlugin
     */
    protected async getResponseMessage(message: unknown): Promise<ResponseInterface<unknown, unknown> | undefined> {
        if (message instanceof MessageException) return message.response;
        if (this.isResponseMessage(message)) return message;

        return undefined;
    }

    /**
     * Get Request
     *
     * @protected
     * @param {unknown} message Possible Request/Message
     * @returns {Promise<ResponseInterface<unknown, unknown> | undefined>}
     * @memberof JSONLoggerPlugin
     */
    protected async getRequestMessage(message: unknown): Promise<RequestInterface<unknown> | undefined> {
        if (message instanceof MessageException) return message.request;
        if (this.isRequestMessage(message)) return message;
        if (this.isResponseMessage(message)) return message.request;

        return undefined;
    }

    /**
     * Check Is Message Response or Request or Exception Message
     *
     * @protected
     * @param {unknown} message Possible Message/Request
     * @returns {Promise<boolean>}
     * @memberof JSONLoggerPlugin
     */
    protected async isRequestOrResponseMessage(message: unknown): Promise<boolean> {
        return message instanceof MessageException
            || this.isResponseMessage(message)
            || this.isRequestMessage(message);
    }

    /**
     * Check is Response Message
     *
     * @param {unknown} message Possible Response/Message
     * @returns {boolean}
     */
    protected isResponseMessage(message: unknown): message is ResponseInterface<unknown, unknown> {
        return Object.prototype.hasOwnProperty.call(message, "data")
            && Object.prototype.hasOwnProperty.call(message, "status")
            && Object.prototype.hasOwnProperty.call(message, "headers")
            && Object.prototype.hasOwnProperty.call(message, "request");
    }

    /**
     * Check is Request Message
     *
     * @param {unknown} message Possible Request/Message
     * @returns {boolean}
     */
    protected isRequestMessage(message: unknown): message is RequestInterface<unknown> {
        return Object.prototype.hasOwnProperty.call(message, "url")
            && Object.prototype.hasOwnProperty.call(message, "method");
    }

}
