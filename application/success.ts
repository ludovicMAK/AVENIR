export abstract class ApplicationSuccess<T = unknown> {
    public readonly status: number;
    public readonly code: string;
    public readonly message?: string;
    public readonly data?: T;
    public readonly headers?: Record<string, string>;

    protected constructor(status: number, code: string, message?: string, data?: T, headers?: Record<string, string>) {
        this.status = status;
        this.code = code;
        this.message = message;
        this.data = data;
        this.headers = headers;
    }

    public toPayload(): Record<string, unknown> {
        const payload: Record<string, unknown> = { ok: true, code: this.code };
        if (this.message !== undefined) payload.message = this.message;
        if (this.data !== undefined) payload.data = this.data;
        return payload;
    }
}

export class OkSuccess<T = unknown> extends ApplicationSuccess<T> {
    public constructor(message?: string, data?: T) {
        super(200, "OK", message, data);
    }
}

export class CreatedSuccess<T = unknown> extends ApplicationSuccess<T> {
    public constructor(message?: string, data?: T, location?: string) {
        super(201, "CREATED", message, data, location ? { Location: location } : undefined);
    }
}

export class AcceptedSuccess<T = unknown> extends ApplicationSuccess<T> {
    public constructor(message?: string, data?: T) {
        super(202, "ACCEPTED", message, data);
    }
}

export class NoContentSuccess extends ApplicationSuccess<void> {
    public constructor() {
        super(204, "NO_CONTENT");
    }

    public override toPayload(): Record<string, unknown> {
        return {};
    }
}
