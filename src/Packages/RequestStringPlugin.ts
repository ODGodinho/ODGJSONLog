import { type LoggerParserInterface, type LoggerPluginInterface } from "@odg/log";

import { JSONParserException, JSONParserUnknownException } from "../Exceptions";
import { type LoggerRequestStringInterface, type LoggerObjectRequestInterface } from "../Interfaces";

import { JSONLoggerString } from "./JSONLoggerString";

import { JSONLogger } from ".";

export class RequestStringPlugin implements LoggerPluginInterface {

    /**
     * Plugin parse request params Headers/Query/Body to String
     *
     * @param {LoggerParserInterface} data Received Data params
     * @returns {Promise<LoggerParserInterface>}
     */
    public async parser(data: LoggerParserInterface): Promise<LoggerParserInterface> {
        const { message } = data;
        if (!(message instanceof JSONLogger)) {
            throw new JSONParserException("Register JSONLogger before RequestStringPlugin");
        }

        try {
            return {
                ...data,
                message: new JSONLoggerString({
                    ...message,
                    request: this.requestToString(message.request),
                }),
            };
        } catch (error) {
            throw new JSONParserUnknownException("JSON String Plugin Parser exception", error);
        }
    }

    private requestToString(request?: LoggerObjectRequestInterface): LoggerRequestStringInterface | undefined {
        if (!request) return;

        return Object.fromEntries(Object.entries(request).map(([ key, value ]) => {
            if (key === "response" && value) {
                return [ key, this.recordToStringValues(request.response!) ];
            }

            return [ key, typeof value === "object" ? JSON.stringify(value) : value ];
        })) as LoggerRequestStringInterface;
    }

    private recordToStringValues(response: Record<string, unknown>): Record<string, unknown> | undefined {
        return Object.fromEntries(
            Object.entries(response)
                .map(([ key, value ]) => [ key, typeof value === "object" ? JSON.stringify(value) : value ]),
        );
    }

}
