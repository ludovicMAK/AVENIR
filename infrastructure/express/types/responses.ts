export type SuccessOptions<T = unknown> = {
    status?: number
    code: string
    message?: string
    data?: T
    headers?: Record<string, string>
}
