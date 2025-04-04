export const errors = {
    // Token errors
    TOKEN_EXPIRED: "The token has expired.",
    TOKEN_NOT_FRESH: "The token is not fresh. Please use a fresh token.",
    INVALID_TOKEN: "Invalid token. Signature verification failed.",
    TOKEN_REVOKED: "The token has been revoked.",
    MISSING_TOKEN: "Request does not contain an access token."

} as const;