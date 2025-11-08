Title: Comparing Tokens in OAuth2 vs OIDC

OAuth2

- Purpose: authorization (access to resources). Token: Access Token (opaque or JWT).
- Audience: resource server (API). Contains scopes/permissions. No standardized user identity.

OIDC (built on OAuth2)

- Purpose: authentication (who the user is). Adds ID Token (JWT) with user claims.
- Audience: client application. Includes issuer, subject, nonce, auth_time, etc.

Usage guidance

- Use Access Token to call APIs; validate signature/claims (aud, iss, exp, scope).
- Use ID Token only on the client to establish user session/identity; do not send to APIs.
- Prefer short-lived access tokens; use refresh token rotation and token binding when possible.

Security notes

- Validate nonce/state; handle key rotation (JWKS); avoid storing tokens in localStorage.
