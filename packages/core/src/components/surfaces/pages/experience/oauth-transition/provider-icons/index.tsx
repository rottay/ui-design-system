import type { JSX } from 'react';
import type { OAuthProvider } from '../types';

function GoogleIcon(): JSX.Element {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function GitHubIcon(): JSX.Element {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.111.793-.261.793-.577v-2.169c-3.338.727-4.033-1.416-4.033-1.416-.546-1.387-1.334-1.756-1.334-1.756-1.089-.744.084-.729.084-.729 1.205.084 1.838 1.237 1.838 1.237 1.07 1.833 2.808 1.304 3.493.997.107-.775.419-1.305.762-1.604-2.665-.304-5.467-1.333-5.467-5.93 0-1.311.469-2.381 1.236-3.221-.124-.303-.536-1.524.117-3.176 0 0 1.009-.322 3.301 1.229A11.5 11.5 0 0 1 12 5.8c1.02.005 2.047.138 3.006.404 2.291-1.551 3.297-1.229 3.297-1.229.653 1.653.242 2.874.118 3.176.769.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.48 5.921.431.372.824 1.103.824 2.222v3.293c0 .318.192.694.8.576C20.565 21.797 24 17.3 24 12 24 5.373 18.627 0 12 0Z" />
    </svg>
  );
}

function LinkedInIcon(): JSX.Element {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#0A66C2"
        d="M20.447 20.452H16.89v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.137 1.445-2.137 2.939v5.667H9.35V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433A2.066 2.066 0 0 1 3.27 5.37a2.063 2.063 0 1 1 4.126 0 2.065 2.065 0 0 1-2.059 2.063ZM7.12 20.452H3.555V9H7.12v11.452ZM22.225 0H1.77A1.77 1.77 0 0 0 0 1.73v20.54A1.77 1.77 0 0 0 1.77 24h20.451A1.777 1.777 0 0 0 24 22.27V1.73A1.777 1.777 0 0 0 22.222 0h.003Z"
      />
    </svg>
  );
}

function MicrosoftIcon(): JSX.Element {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#F25022" d="M1 1h10v10H1z" />
      <path fill="#7FBA00" d="M13 1h10v10H13z" />
      <path fill="#00A4EF" d="M1 13h10v10H1z" />
      <path fill="#FFB900" d="M13 13h10v10H13z" />
    </svg>
  );
}

export function renderOAuthProviderIcon(provider: OAuthProvider): JSX.Element {
  switch (provider) {
    case 'google':
      return <GoogleIcon />;
    case 'github':
      return <GitHubIcon />;
    case 'linkedin':
      return <LinkedInIcon />;
    case 'azure-ad':
    case 'microsoft':
      return <MicrosoftIcon />;
    default:
      return <MicrosoftIcon />;
  }
}
