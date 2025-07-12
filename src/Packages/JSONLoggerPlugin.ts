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
    type GitLoggerInterface,
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

    protected git: GitLoggerInterface = {};

    public constructor(
        protected readonly appName: string,
        protected readonly maxExceptionPrevious: number = 10,
        protected instanceId?: string,
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
        const [ newMessage, release, branch, exception, previousException, request ] = await Promise.all([
            this.getMessage(message),
            this.getGitRelease().catch(() => void 0),
            this.getGitBranch().catch(() => void 0),
            this.parseException(message),
            this.parseExceptionPrevious(message),
            this.parseRequest(message),
        ]);

        return new JSONLogger({
            type: level,
            index: this.appName,
            instance: this.getInstance(),
            message: newMessage,
            createdAt: new Date(),
            identifier: this.identifier,
            git: {
                release: release! || undefined,
                branch: branch! || undefined,
            },
            exception: exception,
            exceptionPrevious: previousException,
            request: request,
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
     * Define device instance name
     *
     * @param {string} instance name of instance
     */
    public setInstance(instance: string): void {
        this.instanceId = instance;
    }

    /**
     * Define current git Release
     *
     * @param {string} release name of instance
     */
    public setGitRelease(release: string): void {
        this.git.release = release;
    }

    /**
     * Define current git Branch
     *
     * @param {string} branch name of instance
     */
    public setGitBranch(branch: string): void {
        this.git.branch = branch;
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
        if (typeof this.git.release === "string") return this.git.release;

        const command = promisify(exec);
        const gitVersion = await command("git describe --tags --abbrev=41");

        return this.git.release ??= gitVersion.stdout.trim();
    }

    /**
     * Return git tag name
     *
     * @returns {Promise<string>}
     */
    protected async getGitBranch(): Promise<string> {
        if (typeof this.git.branch === "string") return this.git.branch;

        const command = promisify(exec);
        const gitVersion = await command("git rev-parse --abbrev-ref HEAD");

        return this.git.branch ??= gitVersion.stdout.trim();
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
     * If Message is a Exception, get All Exception Previous and parse to ExceptionObjectLoggerInterface
     *
     * @param {unknown} exception Possible Exception
     * @returns {Promise<ExceptionObjectLoggerInterface[] | undefined>}
     */
    protected async parseExceptionPrevious(exception: unknown): Promise<ExceptionObjectLoggerInterface[] | undefined> {
        if (!(exception instanceof Exception)) return;

        const exceptionCollection: ExceptionObjectLoggerInterface[] = [];
        let exceptionBase = exception.getPrevious();
        let exceptionCount = 0;

        do {
            const parsedException = await this.parseException(exceptionBase);
            if (parsedException) exceptionCollection.push(parsedException);
            exceptionBase = exceptionBase?.getPrevious();
        } while (exceptionBase && ++exceptionCount < this.maxExceptionPrevious);

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
        const request = Object.fromEntries(
            Object.entries(await this.getRequestMessage(message) ?? {})
                .filter(([ key ]) => !key.startsWith("$")),
        );
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
        if (ODGMessage.isMessageError(message) || MessageResponse.isMessageResponse(message)) return message.response;

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
        if (ODGMessage.isMessageError(message) || MessageResponse.isMessageResponse(message)) return message.request;
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
            || MessageResponse.isMessageResponse(message)
            || this.isRequestMessage(message);
    }

    protected isRequestMessage(message: unknown): message is RequestInterface<unknown> {
        return Object.prototype.hasOwnProperty.call(message, "url")
            && Object.prototype.hasOwnProperty.call(message, "method");
    }

    private async getMessage(message: unknown): Promise<string> {
        if (MessageResponse.isMessageResponse(message) || ODGMessage.isMessageError(message)) {
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
