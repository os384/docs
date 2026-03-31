# What About Nextcloud?

Nextcloud is the leading open-source, self-hosted collaboration
platform. It provides file storage, calendar, contacts, document
editing, video calls, and a growing ecosystem of apps — all under your
own control, on your own server. For many organizations seeking to
escape Big Tech, Nextcloud is the first stop.

In several ways, Nextcloud gets the self-hosting story right. But when
we apply the criteria from the [Background](/background), the gaps
become clear.

## Open Source — Done Right

Nextcloud is licensed under AGPL v3. All components — server, clients,
and apps — are under this license. Development happens in the open on
GitHub. This is exactly what os384's criteria require, and Nextcloud
deserves unqualified credit for it.

This is not a trivial achievement. Nextcloud forked from ownCloud in
2016 specifically because ownCloud was moving toward a dual-license
model that prioritized commercial interests over community openness.
The fork was an act of principle, and the AGPL commitment has held.

## Self-Hosting — With Significant Effort

Nextcloud can be self-hosted, and many organizations do. But "can be
self-hosted" and "is practical to self-host" are different things.

A production Nextcloud instance requires a web server (Apache or
Nginx), PHP, a database (MySQL/MariaDB or PostgreSQL), Redis for
caching, and ongoing maintenance for updates, security patches, and
performance tuning. The documentation is good, but the operational
burden is real. Most individuals and small teams end up using a hosted
provider — which re-introduces the trust dependency that self-hosting
was supposed to eliminate.

os384's design philosophy is that a server should be small enough to
audit and simple enough to deploy without a systems administrator. The
channel server is under 2,500 lines of TypeScript; the storage server
is under 500 lines.

## Encryption Is an Afterthought

This is Nextcloud's most significant limitation for os384's purposes.

Nextcloud's server-side encryption module encrypts files at rest, but
the server holds the encryption keys. This means the server
administrator — or anyone who compromises the server — can decrypt
all stored files. The encryption protects against physical disk theft,
not against a compromised or malicious server.

Nextcloud does offer an end-to-end encryption module (introduced in
2017), but it has significant limitations: it only works on designated
folders, it is not compatible with server-side features like search
and file previews, it has had a troubled development history with
multiple rewrites, and it is not enabled by default.

The fundamental issue is architectural. Nextcloud was designed as a
file sync and sharing platform first, and encryption was added later.
In os384, encryption is the foundation — data is encrypted before it
leaves the client, and the server never has the keys. These are very
different starting points.

## No Content-Addressing

Nextcloud uses traditional file paths and server-assigned identifiers.
Files are named by where they are, not by what they contain. This
means no deduplication across users, no content-addressable integrity
verification, and no ability to verify that a file has not been
modified by the server.

## Identity Is Server-Bound

Nextcloud user accounts are local to each instance. Your identity is
`username@your-nextcloud-server.tld` — if the server goes down, your
identity goes with it. There is no portable, cryptographic identity
that exists independently of any server.

Nextcloud Talk (the video/chat feature) supports federation between
instances, which is a step in the right direction. But the identity
model remains server-bound.

## What Nextcloud Gets Right

- AGPL licensing for all components — exemplary.
- Genuine self-hosting with an active community.
- Broad feature set that covers real collaboration needs.
- Active development and regular releases.
- Federation support in some components (Talk, file sharing).
- The fork from ownCloud was a principled stand for open source.

Nextcloud is the right answer for organizations that want to self-host
a collaboration suite and are willing to invest in the operational
overhead. But by os384's criteria, it falls short on security
(encryption is not the default, server holds keys), privacy (no
content-addressing, server sees file contents), and sovereignty
(identity is server-bound, no portable cryptographic identity).
