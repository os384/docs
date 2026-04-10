# What About Solid?

Solid is Tim Berners-Lee's attempt to fix what went wrong with the web.
The project, launched at MIT in 2016 and now developed through
[Inrupt](https://www.inrupt.com/) (the commercial entity Berners-Lee
co-founded), proposes a re-decentralization of the web based on personal
data stores called "pods." Users own their data in their pod; apps
request access to it.

The motivation is exactly right. The execution, os384 believes, is
built on the wrong foundation.

## The Right Problem, the Wrong Layer

Solid's architecture is built on top of existing web standards: HTTP,
RDF, Linked Data, WebID, and access control lists (ACLs). The idea is
that you can retrofit data sovereignty onto the current web by giving
users a pod (essentially a personal web server) and making applications
ask for permission to read and write data.

The problem is that this approach inherits all the trust assumptions of
the web. Your pod is a web server. It requires a domain name, TLS
certificates, and an always-on host. The data in your pod is stored
in cleartext — the pod operator (or hosting provider) can read
everything. Access control is enforced by the server, not by
cryptography.

os384 takes a fundamentally different approach: data is encrypted
before it leaves the client. The server is a dumb storage layer that
cannot inspect what it holds. Access control is enforced by who has
the decryption keys, not by server-side ACLs that the server operator
can override.

## No Encryption by Default

Solid pods store data in the clear. The specification does not include
end-to-end encryption. Encryption can be added at the application
layer, but it is not part of the protocol, not part of the data model,
and not part of the identity system.

This means that self-hosting a Solid pod gives you control over where
your data lives, but not over who can read it. If your pod provider is
compromised, or if a government compels access, the data is available
in plaintext.

## Identity Model

Solid uses WebID for identity — a URI (typically a URL) that points
to a profile document on the web. This is an improvement over
email-and-password authentication, but it ties your identity to a
domain name and a web server. If the server hosting your WebID goes
down, your identity becomes unresolvable.

os384's identity is derived from a cryptographic keypair generated
locally. It does not depend on any server, any domain name, or any
external infrastructure. You can prove you are you with nothing but
your keys.

## Complexity and Adoption

Solid requires applications to be rewritten to use its data model (RDF
and Linked Data). This is a significant barrier. RDF is powerful but
notoriously difficult to work with, and the developer tooling has
historically been challenging. The result is a small ecosystem of
Solid-compatible apps compared to the mainstream web.

The bet is that developers will rewrite their apps to respect user data
sovereignty. History suggests this bet is optimistic — developers
follow users, users follow convenience, and convenience currently lives
in centralized platforms.

## Inrupt and Commercialization

Berners-Lee co-founded Inrupt to commercialize Solid, which is a
reasonable approach to sustainability. But it creates the familiar
tension: the company that controls the reference implementation and the
specification has commercial interests that may diverge from the
community's interests over time. The Solid specification is developed
under the W3C, which provides some governance structure, but Inrupt's
influence on the direction is significant.

## What Solid Gets Right

- The diagnosis is correct: users should own their data.
- Building on web standards means broad potential compatibility.
- The W3C governance model provides community input.
- Berners-Lee's personal commitment lends credibility.
- The pod concept — personal data stores — is the right abstraction.

Solid is an important intellectual contribution to the data sovereignty
conversation, and the pod model influenced thinking across the field.
But by os384's criteria, it falls short on security (no encryption),
privacy (data stored in cleartext), and sovereignty (identity tied to
a web server, access control enforced by server-side policy rather than
cryptography). The foundation — the existing web — is precisely what
needs to be replaced, not extended.
