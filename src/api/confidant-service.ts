import { createRequest } from './lib/request';

export type HandshakeResponse = {
  combinedKey: string;
}

export type AuthData = {
  goog: string
};

export type AuthStatus = {
  goog: boolean;
}

export type GetCombinedKeyResponse = {
  combinedKey: string;
}

export type SignTransactionResponse = {
  data: string|null;
  success: boolean;
  reason?: string;
}

export default class ConfidantService {
  private request: ReturnType<typeof createRequest>;

  constructor(address: string) {
    this.request = createRequest(address);
  }

  public handshake = (
      publicKey: string,
      pkhash: string,
  ): Promise<HandshakeResponse> => {
    return this.request('/api/handshake', {
      body: {
        publicKey,
        pkhash,
      },
    });
  };

  public getCombinedKey = (publicKey: string): Promise<GetCombinedKeyResponse> => {
    return this.request('/api/key', {
      body: { clientPublicKey: publicKey }
    });
  };

  public signTransaction = (
      message: string,
      data: string,
      clientPublicKey: string,
      auth?: AuthData,
  ): Promise<SignTransactionResponse> => {
    return this.request('/api/sign', {
      body: {
        message: message,
        data,
        clientPublicKey,
        auth,
      }
    });
  };

  public qrCode = (url: string): Promise<Blob> => {
    return this.request('/api/qrcode', {
      body: { url },
      responseType: 'blob',
    });
  };

  public hasAuth = (publicKey: string): Promise<AuthStatus> => {
    return this.request('/api/2fa/enabled', {
      body: { publicKey }
    });
  };

  public createGoogTwoFA = (
      accountId: string,
      publicKey: string
  ): Promise<Blob> => {
    return this.request('/api/2fa/goog/create', {
      body: { accountId, publicKey },
      responseType: 'blob',
    });
  };

  public activateGoogTwoFA = (publicKey: string, token: string): Promise<{
    success: boolean;
    reason?: string;
  }> => {
    return this.request('/api/2fa/goog/activate', {
      body: { publicKey, token },
    });
  };

  public deactivateGoogTwoFA = (pkhash: string): Promise<{
    success: boolean
  }> => {
    return this.request('/api/2fa/goog/deactivate', {
      body: { pkhash },
    });
  };
}
