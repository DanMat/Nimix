# Security Policy

## Supported versions

This is a small, static, client-side game with no backend and no data
collection. The latest version on the `main` branch is the only supported
version.

## Reporting a vulnerability

If you discover a security issue (for example a cross-site scripting vector in
how the board or overlays are rendered), please report it privately rather than
opening a public issue.

- Use GitHub's [private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability)
  ("Report a vulnerability" under the repository's **Security** tab), **or**
- Email the maintainer at **dannymatthew@gmail.com**.

Please include:

- A description of the issue and its potential impact.
- Steps to reproduce (a minimal example).
- The browser and version where you observed it.

You can expect an initial response within **7 days**. Once the issue is
confirmed and fixed, credit will be given in the release notes unless you prefer
to remain anonymous.

## Scope

Because Nimix runs entirely in the browser with no dependencies and no network
calls, the most relevant concerns are DOM-based issues (e.g. unsafe HTML
rendering). Reports in that area are especially appreciated.
