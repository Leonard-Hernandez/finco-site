/** What survives the round trip to authco: the request parameters only this tab knows. */
export interface PendingLogin {
  state: string;
  nonce: string;
  codeVerifier: string;
  returnUrl: string;
}

/** Query parameters authco sends back to the redirect_uri. */
export interface AuthorizationResponse {
  code: string | null;
  state: string | null;
  error: string | null;
  error_description: string | null;
}

export interface TokenResponse {
  access_token: string;
  id_token?: string;
  token_type: string;
  /** Seconds. Optional (RFC 6749 5.1): the access token `exp` claim is used instead. */
  expires_in?: number;
}

/** The session persisted in sessionStorage. */
export interface TokenSet {
  accessToken: string;
  idToken: string | null;
  /** Epoch millis after which the access token must not be used. */
  expiresAt: number;
}

export class OAuthError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
  }
}
