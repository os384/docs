# Shoulders of Giants

::: tip A note on how this page came about
This section was written mostly by Claude. I asked it to read everything
about os384 and then tell the story of where I probably got all these
ideas and concepts from. It did a remarkably good job — it only needed
a few tweaks. These various giants have in fact been the ones shaping
my journey. /psm
:::

os384 did not emerge from a vacuum.
It draws on decades of thinking — sometimes visionary, sometimes hard-won — about
what it means to be free in a networked world. This page traces the
intellectual lineage: the ideas, the people, the papers, and the systems
that shaped the design choices behind os384. It is intended both as a
guide for anyone who wants to understand *why* os384 works the way it
does, and as a reading list for anyone who wants to go deeper.

## The Original Vision of the Web

The story starts with Tim Berners-Lee's 1989 proposal at CERN,[^berners-lee]
which envisioned the World Wide Web as a fundamentally peer-to-peer
system. Any computer could serve pages; any person could link to any
other. There was no center. The key insight was that a global hypertext
system could work without centralized control — that the value of the
network came from its participants, not from a gatekeeper.

That vision held for roughly a decade. Then, as described in the
[Background](/background), the economics of scale intervened. Running a
server became hard. Maintaining software became a job. Big Tech offered a
bargain: hand us your data, and we'll handle the complexity. The web
that was born decentralized was gradually re-centralized into a handful of
platforms.

Berners-Lee himself recognized what had happened. His later
[Solid](https://solidproject.org/) project (2016–present) is an explicit
attempt to re-decentralize the web by giving users control over their
own data "pods." os384 shares Solid's motivating concern but takes a
different architectural path: rather than layering access control on top
of existing web infrastructure, os384 rebuilds the stack from the
cryptographic primitives up.

[^berners-lee]: Tim Berners-Lee, ["Information Management: A Proposal,"](https://www.w3.org/History/1989/proposal.html) CERN, March 1989.

## The Cypherpunk Tradition

Running in parallel with the early web was a movement that recognized,
earlier than most, that privacy in a digital world would not be granted —
it would have to be built. The cypherpunks understood that cryptography
was not merely a tool for spies and soldiers; it was a prerequisite for
individual freedom in a networked society.

Eric Hughes articulated this in *A Cypherpunk's Manifesto* (1993):[^hughes]

> Privacy is necessary for an open society in the electronic age. …
> We cannot expect governments, corporations, or other large, faceless
> organizations to grant us privacy out of their beneficence. …
> We must defend our own privacy if we expect to have any. …
> Cypherpunks write code.

That final line — *Cypherpunks write code* — captures something that
runs through os384's design philosophy: the conviction that privacy
cannot be accomplished through policy alone, it has to be
*engineered into the system at the lowest levels*. os384's
[design principles](/background#design-principles) put
"private by design" first for precisely this reason.

John Perry Barlow's *A Declaration of the Independence of Cyberspace*
(1996)[^barlow] gave the movement its most lyrical expression, asserting
that the digital world was a new frontier beyond the jurisdiction of
existing power structures. While the decades since have tempered
that utopianism, the core aspiration — that individuals should govern
their own digital lives — remains the animating principle behind data
sovereignty, self-sovereign identity, and os384.

[^hughes]: Eric Hughes, ["A Cypherpunk's Manifesto,"](https://www.activism.net/cypherpunk/manifesto.html) March 9, 1993.
[^barlow]: John Perry Barlow, ["A Declaration of the Independence of Cyberspace,"](https://www.eff.org/cyberspace-independence) Electronic Frontier Foundation, February 8, 1996.

## Public-Key Cryptography and the Democratization of Secrecy

None of what os384 does would be possible without the revolution in
cryptography that began in 1976, when Whitfield Diffie and Martin
Hellman published "New Directions in Cryptography."[^diffie-hellman]
Before this paper, encryption was symmetric: both parties needed to share
a secret key in advance, which in practice meant that strong encryption
was limited to governments and militaries that could distribute keys
through secure physical channels.

Diffie and Hellman's insight — that two parties could establish a shared
secret over an open channel without ever having met — broke cryptography
out of the classified world and made it possible, in principle, for
anyone to communicate securely with anyone else. This is the conceptual
foundation on which every end-to-end encrypted system, including os384,
is built. In os384 specifically, ECDH (Elliptic Curve Diffie-Hellman) is
the mechanism behind the "whisper" protocol used for private one-to-one
messages between channel participants.

Phil Zimmermann carried this into practice with PGP (Pretty Good Privacy)
in 1991, and wrote one of the most compelling statements of why
cryptography matters for ordinary people in his essay "Why I Wrote
PGP":[^zimmermann]

> If privacy is outlawed, only outlaws will have privacy. …
> PGP empowers people to take their privacy into their own hands. There
> has been a growing social need for it. That's why I wrote it.

Zimmermann's work demonstrated that strong encryption could be made
accessible, and that there was massive demand for it. PGP's email-centric
model of public keys, key servers, and the "web of trust" was the first
serious attempt at decentralized identity for encrypted communication — a
direct ancestor of the problems os384's channel-based identity system
addresses.

[^diffie-hellman]: Whitfield Diffie and Martin Hellman, ["New Directions in Cryptography,"](https://ee.stanford.edu/~hellman/publications/24.pdf) *IEEE Transactions on Information Theory,* Vol. IT-22, No. 6, November 1976.
[^zimmermann]: Philip Zimmermann, ["Why I Wrote PGP,"](https://philzimmermann.com/EN/essays/WhyIWrotePGP.html) originally part of the PGP User's Guide, 1991 (updated 1999).

## Elliptic Curves: A Quiet Revolution

os384 is built on P-384 elliptic curve cryptography — the "384" in the
name comes from the curve. This choice reflects a technical shift that
fundamentally changed what is practical in applied cryptography.

The classical approach to public-key cryptography, RSA, derives its
security from the difficulty of factoring the product of two very large
prime numbers. It works, but the keys are large: a 3072-bit RSA key is
needed to achieve 128 bits of security, and a key providing 192 bits
of security would be enormous.

In 1985, Neal Koblitz[^koblitz] and Victor Miller[^miller]
independently proposed using the algebraic structure of elliptic curves
over finite fields for cryptography. The "discrete logarithm problem"
on elliptic curves turns out to be dramatically harder to solve (relative
to key size) than either integer factorization or the discrete logarithm
problem in ordinary finite fields. A 384-bit elliptic curve key
provides approximately 192 bits of security — the same as an RSA key
that would be many thousands of bits long.

The practical consequences are profound. Smaller keys mean less data
to transmit, less storage, faster key generation, faster signing, and
faster key agreement. For a system like os384 — where every channel
has its own keypair, every participant generates fresh keys, and
key agreement happens constantly — elliptic curves are not merely a
nice-to-have; they make the architecture viable. The specific choice of
P-384 (standardized by NIST as secp384r1[^nist]) provides a comfortable
security margin above the 128-bit level that most systems target,
without the performance cost of larger curves. And because P-384 is
implemented natively in the Web Crypto API available in all modern
browsers, os384 can perform all cryptographic operations client-side
without any external libraries.

[^koblitz]: Neal Koblitz, "Elliptic Curve Cryptosystems," *Mathematics of Computation,* Vol. 48, No. 177, pp. 203–209, January 1987.
[^miller]: Victor Miller, "Use of Elliptic Curves in Cryptography," *Advances in Cryptology — CRYPTO '85 Proceedings,* Lecture Notes in Computer Science, Vol. 218, pp. 417–426, 1986.
[^nist]: National Institute of Standards and Technology, ["Digital Signature Standard (DSS),"](https://csrc.nist.gov/pubs/fips/186-5/final) FIPS PUB 186-5, February 2023.

## No Personal Information. At All.

The moment a system collects private information, it is no longer
private. It doesn't matter how carefully the data is handled, how
strong the encryption is, or how thoughtful the architecture is.
If the data exists on someone else's server, it can be subpoenaed,
breached, sold, or misused. The only way to guarantee that personal
information won't be abused is to never require it in the first place.

This is os384's position, and it is non-negotiable. The system does
not collect personal information. Not your phone number. Not your
email address. Not your real name. Not your location. Not even your
IP address as a meaningful identifier — the protocol has no concept
of PII and no use for it.

It is worth being blunt about what a "privacy policy" actually is in
practice. It is not a mechanism for protecting user privacy — it is a
legal instrument for managing corporate liability while extracting as
much value from personal information as possible. The entire industry
framework of "we collect your data, here's our policy for how we
handle it" exists to define what a company can get away with, not to
protect the user. os384 does not need a privacy policy. There is
nothing to write one about.

This is not merely a design choice — it is an architectural constraint
that permeates every layer of os384. Channels are identified by the
hash of a public key generated locally; no registration is needed.
Each channel has a unique keypair, so there is no global identifier
linking your activity across conversations. The server stores encrypted
blobs it cannot read, indexed by content hashes it cannot reverse.
There is no user database, no account table, no session log. An
os384 server operator, even if compelled by a court order, could not
produce a list of users — because the system genuinely does not know
who its users are.

## Data Rights and Sovereignty

The language of "data rights" emerged as it became clear that the
centralized platforms were not merely providing a convenience — they
were accumulating power over the digital lives of their users. Several
thinkers attempted to articulate what rights individuals should have
over their data, and their formulations directly shaped os384's design
vocabulary.

Frank Karlitschek[^karlitschek] (founder of Nextcloud and ownCloud)
and Hugo Roy[^roy] authored the *User Data Manifesto* (2012, revised
2015),[^udm] which distilled data rights into three principles: control,
transparency, and freedom. os384 adopts these three principles as its
working definition of *sovereignty* and references them throughout its
documentation.

Jeffrey Wernick's *Data Manifesto*[^wernick] provides a more visceral
framing, describing the unconsented collection and sale of personal data
as a violation of property rights and, in his most pointed language,
a form of digital slavery. His argument extends the concept of
sovereignty from a technical concern to a question of human dignity.

Shoshana Zuboff's *The Age of Surveillance Capitalism*
(2019)[^zuboff] provides the most comprehensive academic analysis of
how personal data became the raw material for a new economic order —
one in which human experience is claimed as free raw material for
translation into behavioral data, which is then used to predict and
modify behavior. Zuboff's framework helps explain why the problem
os384 addresses is not merely a technical inconvenience but a structural
feature of the current digital economy.

Bruce Schneier's *Data and Goliath* (2015)[^schneier-data] bridges the
gap between the technical and the political, documenting the specific
mechanisms of mass surveillance — both governmental and corporate — and
arguing that the asymmetry of information between individuals and
institutions is fundamentally corrosive to democracy.

[^karlitschek]: Frank Karlitschek, ["The User Data Manifesto,"](https://karlitschek.de/2012/10/the-user-data-manifesto/) October 2012.
[^roy]: Hugo Roy, ["User Data Manifesto 2.0,"](https://hroy.eu/posts/UserDataManifesto2dot0/) 2015.
[^udm]: User Data Manifesto, [userdatamanifesto.org](https://userdatamanifesto.org/).
[^wernick]: Jeffrey H. Wernick, ["Data Manifesto,"](https://www.jeffreyhwernick.com/articles/data-manifesto) jeffreyhwernick.com.
[^zuboff]: Shoshana Zuboff, *The Age of Surveillance Capitalism: The Fight for a Human Future at the New Frontier of Power,* PublicAffairs, 2019.
[^schneier-data]: Bruce Schneier, *Data and Goliath: The Hidden Battles to Collect Your Data and Control Your World,* W.W. Norton, 2015.

## The Sovereign Individual

The concept of the "sovereign individual" — a person who exercises
genuine autonomy over their digital and economic life — has roots in
libertarian political philosophy. James Dale Davidson and William
Rees-Mogg's *The Sovereign Individual* (1997)[^davidson] argued that
information technology would shift power from institutions to
individuals by reducing the ability of governments and corporations to
control information flows.

Their predictions were premature in some respects and prescient in
others. What they foresaw as inevitable required, it turned out,
*deliberate engineering*. The technology does not automatically empower
individuals; it can just as easily be turned into a tool of control.
os384 represents one attempt to build the infrastructure that makes
genuine digital sovereignty technically achievable — the technology
that Davidson and Rees-Mogg assumed would simply emerge on its own.

[^davidson]: James Dale Davidson and William Rees-Mogg, *The Sovereign Individual: Mastering the Transition to the Information Age,* Simon & Schuster, 1997.

## Free Software and the AGPL

os384's insistence on Affero AGPLv3 licensing for all components
reflects a lineage that goes back to Richard Stallman's GNU Manifesto
(1985)[^stallman] and the Free Software Foundation. Stallman's core
argument — that users of software should have the freedom to study,
modify, and redistribute it — was radical at the time and remains
contested today.

The open source movement, catalyzed in part by Eric Raymond's *The
Cathedral and the Bazaar* (1997),[^raymond] demonstrated that open
development models could produce software of exceptional quality. But
as os384's [Background](/background#open-source) documents in detail,
the rise of "software as a service" created a loophole: companies
could use open source code to deliver online services without ever
"distributing" the code, thereby evading the GPL's copyleft trigger.

The Affero GPL (AGPL, or AGPLv3 with the network-use clause) closes
this loophole by extending the copyleft trigger to network delivery.
os384's position — that any communication platform claiming to be
open source *should* use an Affero-style license — is a direct
continuation of this decades-long evolution in free software licensing.

[^stallman]: Richard Stallman, ["The GNU Manifesto,"](https://www.gnu.org/gnu/manifesto.en.html) Free Software Foundation, March 1985.
[^raymond]: Eric S. Raymond, ["The Cathedral and the Bazaar,"](http://www.catb.org/~esr/writings/cathedral-bazaar/) presented at the Linux Kongress, May 1997; published by O'Reilly, 1999.

## Capability-Based Security

os384's channel design draws from the tradition of capability-based
security, which originated with Jack Dennis and Earl Van Horn's 1966
paper on programming semantics for multiprogrammed
computations.[^dennis] Their insight was that access to a resource
should be controlled by possession of a token (a "capability") rather
than by identity checks against an access control list.

This idea was further developed in operating system designs like
Mach and Chorus, where inter-process communication ports function as
capabilities: if you hold a reference to a port, you can communicate
through it, and the system enforces this without needing to know *who*
you are. os384's glossary explicitly describes a channel as
"conceptually analogous to a capability-bearing port in systems like
Mach/Chorus, but persistent and cryptographically owned."

The elegance of this approach is that it eliminates the need for a
central authority to maintain and enforce an access control list.
Possession of the private key *is* the authorization. This is what
makes os384's channels fundamentally different from traditional
client-server architectures: there is no user database, no login server,
no session management. If you have the key, you have the capability.
This maps directly to the sovereignty goals of os384.

[^dennis]: Jack B. Dennis and Earl C. Van Horn, ["Programming Semantics for Multiprogrammed Computations,"](https://dl.acm.org/doi/10.1145/365230.365252) *Communications of the ACM,* Vol. 9, No. 3, pp. 143–155, March 1966.

## Content-Addressable Storage

The idea of naming data by its content — using a cryptographic hash of
the data as its address — is one of the most powerful abstractions in
computer science. Ralph Merkle's work on hash trees (1979)[^merkle]
established the foundational data structure: a tree where each node
is identified by the hash of its children, making it possible to verify
any piece of data against a single root hash.

Git, Linus Torvalds's version control system (2005), brought
content-addressable storage to millions of developers. In Git, every
file, every directory, and every commit is identified by its SHA-1 hash.
This makes operations like deduplication, integrity verification, and
distributed replication natural properties of the system rather than
features that have to be added on.

Juan Benet's IPFS (InterPlanetary File System, 2014)[^benet] extended
content addressing into a full distributed file system, where data
can be retrieved from any node that holds it, without depending on a
specific server or URL. IPFS demonstrated that content-addressed storage
could work at internet scale.

os384's shard system is in this lineage. Every shard is identified by
a hash derived from its contents, making deduplication automatic and
integrity verification trivial. But os384 adds a critical twist: the
content is encrypted *before* the final address is computed, and the
hash used for deduplication (h1) is split from the hash used for key
derivation (h2), so that the storage server can deduplicate without
ever being able to read the data. The deep history mechanism — where
channel message logs are archived into Merkle-like trees of shards —
directly echoes Merkle's original construction.

[^merkle]: Ralph C. Merkle, ["A Certified Digital Signature,"](http://www.ralphmerkle.com/papers/Certified1979.pdf) *Advances in Cryptology — CRYPTO '89 Proceedings,* 1990 (patent filed 1979).
[^benet]: Juan Benet, ["IPFS - Content Addressed, Versioned, P2P File System,"](https://arxiv.org/abs/1407.3561) arXiv:1407.3561, July 2014.

## Privacy-Preserving Deduplication

One of os384's most original contributions is its approach to
deduplicating encrypted data — a problem that has been studied
academically but never, to our knowledge, solved in a way that works
for real cloud systems.

The core difficulty is straightforward: if data is encrypted with a
unique key before storage, identical files will produce completely
different ciphertext, making deduplication impossible. The academic
literature addressed this primarily through "message-locked encryption"
(also called "convergent encryption"), formalized by Bellare, Keelveedhi,
and Ristenpart in 2013,[^bellare] building on earlier work by
Douceur et al. (2002).[^douceur] In convergent encryption, the
encryption key is derived from the plaintext itself, so identical
plaintexts always produce identical ciphertexts, enabling server-side
deduplication.

The academic treatments, while mathematically sound, did not address
several practical realities of cloud computing. They typically assumed
symmetric network costs (upload and download being equally expensive),
which is not how cloud providers price bandwidth — inbound traffic is
typically free or cheap, while outbound is metered and expensive. They
assumed the storage server would be fully trusted for certain operations,
or they required multiple rounds of client-server interaction that
would be prohibitively expensive at scale. And they did not address the
privacy implications of allowing a server to *confirm* whether a
particular piece of data exists (the "confirmation of a file" attack),
which leaks information even if the server cannot read the data.

os384's storage protocol addresses all of these issues. The h1/h2 hash
split allows the server to recognize identical content (via h1) without
gaining any information about the content itself (h2 never leaves the
client). The server provides a salt and nonce for key derivation,
ensuring that the final encryption key incorporates server-controlled
randomness. The 14-day privacy window means that the deduplication index
entry for any given h1 is periodically discarded — the shard persists,
but the mapping that would allow the server to correlate uploads over
time does not. And the protocol is designed so that a client cannot
distinguish between "this data already exists on the server" and "this
is a new upload" — the server's response is identical in both cases.

The result is a system where two users uploading the same file will
silently share a single stored shard, neither party can detect this,
the server cannot read the data, and the server's ability to correlate
who uploaded what degrades over time by design. This is, as far as we
know, the first practical implementation of privacy-preserving
deduplication for a production cloud storage system.

[^bellare]: Mihir Bellare, Sriram Keelveedhi, and Thomas Ristenpart, ["Message-Locked Encryption and Secure Deduplication,"](https://eprint.iacr.org/2012/631.pdf) *Advances in Cryptology — EUROCRYPT 2013,* Lecture Notes in Computer Science, Vol. 7881, pp. 296–312, 2013.
[^douceur]: John R. Douceur, Atul Adya, William J. Bolosky, Dan Simon, and Marvin Theimer, ["Reclaiming Space from Duplicate Files in a Serverless Distributed File System,"](https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/tr-2002-30.pdf) *Proceedings of the 22nd IEEE International Conference on Distributed Computing Systems (ICDCS),* 2002.

## Self-Sovereign Identity

The concept of "self-sovereign identity" — the idea that individuals
should control their own digital identifiers without depending on any
external authority — was articulated most clearly by Christopher Allen
in his influential 2016 essay, "The Path to Self-Sovereign
Identity."[^allen] Allen traced the evolution of digital identity
through four stages: centralized (a single authority issues identifiers),
federated (multiple authorities interoperate), user-centric (the user
can choose among authorities), and finally self-sovereign (the user
*is* the authority).

The W3C Decentralized Identifiers (DID) specification[^did] provides
one technical approach to self-sovereign identity, using blockchain or
other distributed ledger technologies to anchor identifiers without a
central registry.

os384 takes a different and arguably simpler path to the same
destination. Every channel is identified by the hash of a P-384 public
key that is generated locally, offline, without contacting any server or
registry. The corresponding private key constitutes proof of ownership.
There is no identity provider, no login server, no username database.
Identity is purely a consequence of cryptographic key possession. And
because each channel has its own unique keypair, there is no global
identifier that links a user's activities across different channels —
providing unlinkability by default, a property that most identity systems
struggle to achieve.

[^allen]: Christopher Allen, ["The Path to Self-Sovereign Identity,"](https://www.lifewithalacrity.com/article/the-path-to-self-soverereign-identity/) *Life With Alacrity,* April 26, 2016.
[^did]: World Wide Web Consortium, ["Decentralized Identifiers (DIDs) v1.0,"](https://www.w3.org/TR/did-core/) W3C Recommendation, July 19, 2022.

## Secure Messaging Protocols

The most visible prior art in end-to-end encrypted communication is
the Signal Protocol, designed by Trevor Perrin and Moxie
Marlinspike.[^signal] The protocol's Double Ratchet algorithm provides
forward secrecy and post-compromise security: even if a key is
compromised, past messages remain protected, and the protocol
automatically recovers security for future messages.

Signal demonstrated that strong end-to-end encryption could be made
invisible to the user — that it didn't have to be the province of
technical experts manually exchanging PGP keys. This was a major
achievement in usability.

os384's approach to encryption builds on these lessons but differs in
important ways. Signal is optimized for one-to-one conversations with a
specific trust model; os384's channel architecture supports both
one-to-one (via the ECDH "whisper" protocol) and group communication
(via shared AES-GCM keys), with a flexible protocol layer that allows
different encryption schemes per message. More fundamentally, os384
addresses the question of *privacy* — unlinkable identities, no
phone number requirement, no metadata leakage — that Signal's design,
which relies on phone numbers for identity, deliberately sets aside.

os384's [discussion of end-to-end encryption](/background#on-end-to-end-encryption)
draws an important distinction between "conventional E2E" (secure
assuming you trust the provider) and "true E2E" (independently
verifiable keys and open source from top to bottom). The restricted
channel mechanism — where the owner re-generates keys that are
distributed only among participants — is os384's answer to the key
management problem that limits every other E2E system.

[^signal]: Trevor Perrin and Moxie Marlinspike, ["The Double Ratchet Algorithm,"](https://signal.org/docs/specifications/doubleratchet/) Signal Foundation, November 20, 2016.

## The Illusion of Decentralization and the App Delivery Problem

In January 2022, Moxie Marlinspike — the creator of Signal — published
"My first impressions of web3,"[^moxie-web3] a sharp critique that
resonated far beyond the blockchain community. His core observation was
that the supposedly decentralized web3 ecosystem had already
re-centralized around a few API providers. Almost no web3 application
actually talks to the blockchain directly; instead, they call centralized
services like Infura and Alchemy, which mediate access to the
distributed ledger. The distributed ledger exists, but nobody uses it
directly, because — as Marlinspike puts it — people don't want to run
their own servers, and never will.

This observation matters for os384 because it identifies the force that
recentralizes every decentralized system: *convenience*. The mere
existence of a decentralized protocol is not enough. If using it
directly is impractical, intermediaries will emerge, and those
intermediaries will consolidate into platforms. os384's architecture is
designed with this dynamic in mind. The backend services are deliberately
minimal — fewer than 2,500 lines of TypeScript for the channel server,
under 500 for the storage server — precisely so that running your own
instance remains practical rather than aspirational. And the client-side
Loader means that the heavy lifting happens in the browser, not on a
server that someone has to maintain.

But Marlinspike's critique also points to a deeper problem that applies
to every encrypted communication system, including Signal itself: the
*application delivery* trust problem. When you install Signal from the
App Store, or open ProtonMail in your browser, or launch Telegram on
your phone, you are trusting that the binary or JavaScript you received
is the code the developers intended and not a version that has been
tampered with — by the developer, by the app store, by a government, or
by an attacker anywhere along the delivery chain. This is not a
theoretical concern. Any web-based messaging system is particularly
exposed: the server delivers the application code on every page load
and could inject anything it wanted, targeted at any specific user, at
any time.

This is the problem that no current mainstream encrypted messaging system
has solved. Signal's code is open source, but the binary you download
from the App Store is not verifiably the product of that source code in
any practical sense. Reproducible builds exist as a concept, but
verifying them requires technical sophistication that virtually no end
user possesses. Proton's web client is delivered fresh from their
servers on every visit. The entire security model of these systems
ultimately rests on: *trust us.*

os384's Loader and "VMM in the browser" architecture is a direct
response to this problem. The Loader is minimal and auditable. The
applications it launches are fetched as encrypted, content-addressed
shards — their integrity can be verified against their hash before
execution. Applications run in isolated browser subdomains, separated
from the Loader and from each other. And crucially, the Loader itself
can be run locally from a static HTML file, completely independent of
384.dev infrastructure, eliminating the server-delivery trust problem
entirely for users who choose to take that step.

[^moxie-web3]: Moxie Marlinspike, ["My first impressions of web3,"](https://moxie.org/2022/01/07/web3-first-impressions.html) moxie.org, January 7, 2022.

## Applied Cryptography and Systems Engineering

Several works have shaped the practical engineering side of os384's design.

Bruce Schneier's *Applied Cryptography* (1994; second edition
1996)[^schneier-applied] was for many years the standard reference for
anyone implementing cryptographic systems. It remains valuable for its
emphasis on the gap between theoretical security and practical
implementation — the recognition that a system is only as strong as
its weakest component, and that most failures happen in the plumbing
rather than the mathematics.

Lawrence Lessig's *Code and Other Laws of Cyberspace*
(1999)[^lessig] argued that the architecture of digital systems is
itself a form of regulation — that "code is law." This insight
underlies os384's conviction that privacy and sovereignty must be
architectural properties, not features that can be added or removed
by a platform operator. If the system is designed so that the server
*cannot* read your data, then no policy change, no subpoena, no rogue
employee can change that fact.

[^schneier-applied]: Bruce Schneier, [*Applied Cryptography: Protocols, Algorithms, and Source Code in C,*](https://www.schneier.com/books/applied-cryptography/) Second Edition, John Wiley & Sons, 1996.
[^lessig]: Lawrence Lessig, *Code and Other Laws of Cyberspace,* Basic Books, 1999. (Revised as *Code: Version 2.0,* Basic Books, 2006.)

## Conclusion

os384 stands at the confluence of these traditions: the cypherpunk
conviction that privacy must be engineered, not requested; the
cryptographic breakthroughs that made it practical; the systems
engineering insight that architecture is policy; the data rights
movement that articulated what we are fighting for; and the open
source tradition that ensures the tools remain in the hands of
their users.

None of these ideas alone is sufficient. The cypherpunks had the
philosophy but not the infrastructure. The open source movement built
the infrastructure but didn't enforce privacy. The encrypted messaging
apps got the encryption right but compromised on privacy and
sovereignty. The academic researchers formalized the problems but
their solutions assumed away the practical constraints of real cloud
systems.

os384 is an attempt to bring all of these threads together into a
single, coherent, working system — one where privacy, security,
sovereignty, and open source are not competing priorities but
mutually reinforcing properties of the architecture.

The work is far from done. But the shoulders are broad, and the
direction is clear.
