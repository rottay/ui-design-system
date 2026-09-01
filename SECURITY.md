# Security policy

## Reporting a vulnerability

Please report suspected vulnerabilities through GitHub private vulnerability reporting:
open this repository's **Security** tab and choose **"Report a vulnerability"**.

Do not open a public issue, and do not include exploit details in a pull request, until the
report has been addressed.

A useful report includes:

- the affected version or commit;
- the component, subpath or token surface involved;
- a minimal reproduction — the smallest component tree, props or theme input that triggers it;
- what an attacker gains, and under what conditions.

Updates are exchanged in the same private report thread.

## Supported versions

Only the latest release line receives fixes. The current line is **2.19.x**.

There is no separate long-term maintenance branch, and older lines are not backported by
default. If a constraint prevents you from upgrading, describe it in your report so it can
be weighed.

## Scope

In scope for a security report:

- **Cross-site scripting through component props.** Any input a consuming application
  passes to a component that reaches the DOM as markup or as an executable attribute
  rather than as text.
- **CSS injection through tenant-controlled theme input.** Theme values arrive from tenant
  configuration and are lowered into CSS custom properties. A value that escapes its
  declaration — closing a rule, injecting a selector, or smuggling a URL into a property
  that fetches — is a vulnerability, not a theming quirk.
- **Supply chain of vendored suppliers.** Some third-party code and artwork is embedded
  rather than merely depended on. Provenance is recorded in `THIRD_PARTY_NOTICES.md` and
  under `packages/core/governance/graphics/`; a discrepancy between what is recorded and
  what actually ships is in scope.

## Out of scope

- **Consuming-application misconfiguration.** Missing authentication, permissive content
  security policy, unsanitized data handed to an application's own code, or secrets
  exposed by the host application are the application's responsibility.
- **Unsupported deep imports.** Paths into `src/` or `dist/` internals are not a public
  API and carry no stability or security guarantee. Only the root barrel and the declared
  subpaths are supported — see [docs/api.md](docs/api.md).
- Findings that require an already-compromised build environment, registry credentials, or
  privileged local access.
- Vulnerabilities in peer dependencies, which should be reported to those projects; tell us
  if the library's own usage makes an upstream issue exploitable when it otherwise would
  not be.

## Distribution note

The source is public under the [MIT License](LICENSE), while package publication remains
private and controlled through a restricted registry. A vulnerability in published
artifacts therefore affects authorized consumers; report it through the channel above
rather than assuming public exposure. See [docs/releasing.md](docs/releasing.md).
