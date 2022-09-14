type Options = {
  // that's ok for unknown payload
  // eslint-disable-next-line
  body?: Record<string, any>;
  responseType?: 'blob'|'json';
}

const buildURL = (host: string, path: string) => `${host}${path}`;

export const createRequest = (address: string) => {
  return async (path: string, options?: Options) => {
      const response = await fetch(buildURL(address, path), options ? {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options?.body || {})
      } : undefined);

      return response[options?.responseType || 'json']();
  };
};
