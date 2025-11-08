Title: Authentication & Authorization Flow with SSO (OIDC)

Flow (SPA + API)

1. User -> SPA (React). SPA starts OIDC Authorization Code with PKCE to IdP.
2. IdP authenticates user (SSO) and returns code to SPA.
3. SPA exchanges code+PKCE for tokens at IdP (via backend-for-frontend or token endpoint with CORS).
4. SPA stores access token (short-lived) in memory; refresh via silent refresh/ROT.
5. API (Node) validates access token (JWT signature + claims) and enforces scopes/roles.
6. Authorization: RBAC/ABAC based on scopes/claims; enforce at API and UI feature gates.

Tokens

- Access Token (OAuth2): audience = API. Short TTL (5–15m). No long-lived tokens in browser.
- ID Token (OIDC): user identity for the client; do not send to resource APIs.
- Refresh Token: rotation + binding; store HttpOnly same-site cookie if using BFF.

Best practices

- Use OIDC provider (Auth0/Okta/Cognito/Keycloak). Use PKCE, state, nonce.
- Clock skew handling; key rotation (JWKS). Centralized logout and session management.
- Principle of least privilege; per-resource scopes; audit logs.

End-to-end diagram (OIDC + OAuth2 Authorization Code with PKCE)

```mermaid
sequenceDiagram
    autonumber
    actor U as User
    participant SPA as React SPA (Client)
    participant IdP as IdP (Entra ID/Auth0/Keycloak)
    participant BFF as Backend-for-Frontend (optional)
    participant API as Resource API (Node.js)
    participant RS as Resource (DB/Service)

    Note over SPA,IdP: OIDC = authentication (ID Token); OAuth2 = authorization (Access Token)

    U->>SPA: Open app
    SPA->>IdP: 1) /authorize (response_type=code, scope=openid profile email, PKCE challenge)
    U->>IdP: Authenticate + (optional) consent
    IdP-->>SPA: 2) Redirect with authorization code

    alt Token exchange via SPA (CORS allowed by IdP)
        SPA->>IdP: 3) /token (code + PKCE verifier)
        IdP-->>SPA: 4) ID Token + Access Token (+ Refresh Token)
    else Token exchange via BFF (recommended for SPAs)
        SPA->>BFF: 3) Send code (secure cookie/session)
        BFF->>IdP: /token (code + client secret/PKCE if public)
        IdP-->>BFF: ID Token + Access Token (+ Refresh Token)
        BFF-->>SPA: Session established (HttpOnly cookie) or short-lived token
    end

    Note over SPA: Uses ID Token to identify user (client-side session)

    SPA->>API: 5) Call API with Access Token (Authorization: Bearer ...)
    API->>IdP: 6) Validate via JWKS (cached) / introspect if opaque
    API->>RS: 7) Execute business logic (enforce scopes/roles)
    RS-->>API: Data
    API-->>SPA: 8) Response

    opt Get more user claims
        SPA->>IdP: /userinfo (with Access Token, if needed)
        IdP-->>SPA: User claims
    end

    loop Token refresh (when Access Token near expiry)
        SPA->>IdP: /token (grant_type=refresh_token)
        IdP-->>SPA: New Access Token (and rotated Refresh Token)
    end

    Note over API,SPA: Authorization gates at API (scopes/roles) and UI (feature flags)
```
