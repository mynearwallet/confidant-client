declare type Options = {
    body?: Record<string, any>;
    responseType?: 'blob' | 'json';
};
export declare const createRequest: (address: string) => (path: string, options?: Options) => Promise<any>;
export {};
