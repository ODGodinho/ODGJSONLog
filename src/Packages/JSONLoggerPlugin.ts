import { exec } from "node:child_process";
import util, { promisify } from "node:util";

import { Exception } from "@odg/exception";
import {
    type LogLevel,
    type LoggerParserInterface,
    type LoggerPluginInterface,
} from "@odg/log";
import {
    type ResponseInterface, type RequestInterface, MessageResponse, ODGMessage,
} from "@odg/message";
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
        return new JSONLogger({
            type: level,
            index: this.appName,
            instance: this.getInstance(),
            message: await this.getMessage(message),
            createdAt: new Date(),
            identifier: this.identifier,
            git: {
                release: await this.getGitRelease().catch(() => void 0),
                branch: await this.getGitBranch().catch(() => void 0),
            },
            exception: await this.parseException(message),
            exceptionPreview: await this.parseExceptionPreview(message),
            request: await this.parseRequest(message),
        });
    }

    /**
     * Define a unique identifier for the current request, for
     * Example: Request ID, Transaction ID, Crawler Process, etc
     *
     * @param {string} identifier Unique identifier
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
        const instanceProperty = this.instanceId ?? "";

        return instanceProperty
            || process.env.HOSTNAME!
            || process.env.CONTAINER_ID!
            || process.env.DOCKER_CONTAINER_UUID!
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
     * @returns {Promise<ExceptionObjectLoggerInterface[] | undefined>}
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
     * @memberof JSONLoggerPlugin
     * @protected
     * @param {unknown} message Possible Message/Request
     * @returns {Promise<LoggerObjectRequestInterface | undefined>}
     */
    protected async parseRequest(message: unknown): Promise<LoggerObjectRequestInterface | undefined> {
        if (!await this.isRequestOrResponseMessage(message)) return;
        const request = await this.getRequestMessage(message);
        const response = await this.getResponseMessage(message);

        return {
            ...request,
            response: response,
        };
    }

    /**
     * Get Response
     *
     * @memberof JSONLoggerPlugin
     * @protected
     * @param {unknown} message Possible Request/Message
     * @returns {Promise<ResponseInterface<unknown> | undefined>}
     */
    protected async getResponseMessage(message: unknown): Promise<ResponseInterface<unknown> | undefined> {
        if (ODGMessage.isMessageError(message) || message instanceof MessageResponse) return message.response;

        return undefined;
    }

    /**
     * Get Request
     *
     * @memberof JSONLoggerPlugin
     * @protected
     * @param {unknown} message Possible Request/Message
     * @returns {Promise<RequestInterface<unknown> | undefined>}
     */
    protected async getRequestMessage(message: unknown): Promise<RequestInterface<unknown> | undefined> {
        if (ODGMessage.isMessageError(message) || message instanceof MessageResponse) return message.request;
        if (this.isRequestMessage(message)) return message;

        return undefined;
    }

    /**
     * Check Is Message Response or Request or Exception Message
     *
     * @memberof JSONLoggerPlugin
     * @protected
     * @param {unknown} message Possible Message/Request
     * @returns {Promise<boolean>}
     */
    protected async isRequestOrResponseMessage(message: unknown): Promise<boolean> {
        return ODGMessage.isMessageError(message)
            || message instanceof MessageResponse
            || this.isRequestMessage(message);
    }

    protected isRequestMessage(message: unknown): message is RequestInterface<unknown> {
        return Object.prototype.hasOwnProperty.call(message, "url")
            && Object.prototype.hasOwnProperty.call(message, "method");
    }

    private async getMessage(message: unknown): Promise<string> {
        if (message instanceof MessageResponse || ODGMessage.isMessageError(message)) {
            return this.getRequestUrl(message.request);
        }

        if (this.isRequestMessage(message)) {
            return this.getRequestUrl(message);
        }

        if (message instanceof Error) return message.message;
        try {
            if (typeof message === "string") return message;

            return JSON.stringify(message) || util.format(message);
        } catch {
            return util.format(message);
        }
    }

    private async getRequestUrl(request?: RequestInterface<unknown>): Promise<string> {
        return `${request?.baseURL ?? ""}${request?.url ?? ""}`;
    }

}
