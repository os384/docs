# What About Matrix?

Matrix is the most serious attempt at a federated, open protocol for
encrypted communication. It is a genuine effort to solve many of the
same problems os384 addresses, and it deserves careful analysis rather
than dismissal.

That said, when we apply our criteria, Matrix falls short in ways that
are structural — not bugs to be fixed, but consequences of fundamental
design decisions.

## Licensing — Recently Improved

In December 2023, the Matrix reference implementations (Synapse and
Dendrite) moved from Apache 2.0 to AGPL-3.0.[^license] This was a
significant and welcome change. For years, the permissive license meant
that companies could take the Matrix server code, modify it, run it as
a service, and never contribute back — exactly the problem AGPL was
designed to prevent.

The move to AGPL addresses this, though it comes with a dual-licensing
arrangement where Element (the primary commercial entity) offers a
commercial license as an alternative. This is a common pattern and not
inherently problematic, but it means that Element retains a privileged
position in the ecosystem.

[^license]: See [Element's AGPL announcement](https://element.io/blog/element-to-adopt-agplv3/) and [TechCrunch coverage](https://techcrunch.com/2023/11/06/decentralized-communication-protocol-matrix-shifts-to-less-permissive-agpl-open-source-license/).

## Server Complexity

A Matrix homeserver is a large, complex piece of software. Synapse is
written in Python with Rust components and is substantially more code
than os384's entire backend. For comparison, os384's channel server is
fewer than 2,500 lines of TypeScript and the storage server is under
500 lines.

This matters because complexity is the enemy of auditability. The
smaller a system's codebase, the more feasible it is for an independent
party to review it for security vulnerabilities, backdoors, or
unintended behavior. Matrix's server complexity also makes self-hosting
significantly more demanding — it requires PostgreSQL, meaningful RAM,
and ongoing maintenance.

The promise of federation is that anyone can run a server. The reality
is that the barrier is high enough that most users end up on matrix.org
or a handful of large homeservers — recreating the centralization the
protocol was designed to avoid.

## Identity Is Bound to a Server

Matrix user IDs follow the format `@username:homeserver.tld`. Your
identity is permanently tied to the domain of the homeserver where you
registered. You cannot change it. If your homeserver goes down, your
identity goes with it.

This is a fundamental departure from sovereignty. In os384, identity
is derived from a locally generated cryptographic keypair. It exists
independently of any server and can be migrated between servers at
will. In Matrix, your identity is a gift from your homeserver operator,
and they can revoke it.

## Metadata Leakage

Matrix's federated architecture means that homeserver operators can see
significant metadata: which rooms exist, room membership lists, message
timestamps, and who is communicating with whom. The federation protocol
requires this metadata to be shared across all servers participating in
a room.

E2E encryption protects message *contents*, but the metadata —
the pattern of who talks to whom, when, and how often — is visible to
every homeserver operator in the federation. This is not a bug; it is
an inherent property of how federation works in Matrix. Metadata is
often more valuable to a surveillance operation than message content.

## Cryptographic Concerns

Matrix uses the Olm and Megolm protocols for E2E encryption. These
have been the subject of multiple security analyses that identified
significant issues:[^crypto]

- Olm lacks forward secrecy and post-compromise security in some
  configurations.
- Sender identity and device information are exposed in cleartext with
  every message.
- Protocol confusion vulnerabilities have been demonstrated that enable
  man-in-the-middle attacks on cross-signing.
- Megolm is vulnerable to unknown key-share attacks in group chats.
- The reference implementation (libolm) has been deprecated due to
  implementation-level weaknesses.

These are not theoretical concerns — they are documented vulnerabilities
in a shipping system. The Matrix team is actively working on
replacements (vodozemac), but the history illustrates the difficulty of
getting cryptography right in a complex federated system.

[^crypto]: See [Nebuchadnezzar: Cryptographic Vulnerabilities in Matrix](https://nebuchadnezzar-megolm.github.io/) and the [Wire analysis of Olm/Megolm privacy risks](https://wire.com/en/blog/olm-megolm-eu-data-privacy-risk/).

## E2E Encryption — On by Default, But…

Since May 2020, E2E encryption has been enabled by default for direct
messages and private rooms. This was a significant step. However, public
rooms remain unencrypted by default, and once E2E is enabled in a room
it cannot be disabled — which creates UX friction and leads some
communities to avoid enabling it.

## What Matrix Gets Right

- Genuine commitment to federation and interoperability.
- Move to AGPL licensing was the right call.
- Active, engaged open-source community.
- No phone number requirement (email is optional).
- The *intent* is aligned with sovereignty goals.

Matrix is the closest thing to a serious alternative in the federated
messaging space. Its limitations are not failures of effort or intent —
they are consequences of trying to build federation on top of a
traditional server architecture with traditional identity models. os384
takes a different path: instead of federating servers, it minimizes
what servers do and puts the cryptographic primitives — identity, keys,
encryption — entirely in the hands of the user.
