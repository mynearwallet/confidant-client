declare type Options = {
    body?: Record<string, any>;
    responseType?: 'blob' | 'json';
};
export declare const createRequest: (address: string) => (path: string, options?: Options | undefined) => Promise<any>;
export {};
