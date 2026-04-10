# What About IPFS?

IPFS (the InterPlanetary File System) is a content-addressed,
peer-to-peer protocol for storing and sharing data. It is
philosophically adjacent to os384's storage layer — both use
content-addressing, both aim to decentralize data storage, and both
draw on the Merkle tree lineage that runs from Git through to modern
distributed systems.

But IPFS solves a different problem than os384, and it has fundamental
limitations in the areas os384 cares most about.

## No Encryption

IPFS stores data in cleartext by default. Any node that hosts or
relays content can read it. Content-addressing means that anyone who
knows (or guesses) the CID of a piece of data can retrieve it from
any node that has it.

This is by design — IPFS is a distribution protocol, not a privacy
protocol. But it means that IPFS alone is unsuitable for private
communication or private storage. You can encrypt data before putting
it on IPFS, but the protocol provides no encryption primitives, no
key management, and no access control. That is left entirely to the
application layer.

os384's storage layer, by contrast, encrypts all data before it reaches
the server. The server holds encrypted shards and cannot inspect their
contents. Encryption is not optional — it is the only mode of operation.

## No Privacy

IPFS's DHT (Distributed Hash Table) is a public record of who is
requesting what content. Any participant in the network can observe
which nodes are requesting which CIDs. This is a significant metadata
leak — it reveals not just what data exists, but who is interested
in it.

The peer-to-peer architecture means your IP address is visible to other
nodes. There is no anonymity layer built into the protocol. Tools like
IPFS over Tor exist but are not standard and introduce significant
performance penalties.

Content pinning — the mechanism for ensuring data persists — creates
a public record of which nodes are hosting which content. This is
useful for content distribution but devastating for privacy.

## Content Addressing — A Shared Ancestor

Where IPFS and os384 genuinely share intellectual lineage is in
content-addressing itself. The idea that data should be named by *what
it is* (its hash) rather than *where it is* (a URL) is powerful and
important. IPFS popularized this concept beyond the Git community and
demonstrated that it could work at scale.

os384's shard IDs are content addresses — the ID is derived from a
hash of the encrypted data. But os384 adds encryption before hashing,
privacy-preserving deduplication, and a storage budget system that
decouples hosting from content knowledge. These are the properties
IPFS does not provide.

## Filecoin and the Incentive Layer

Filecoin, the incentive layer built on top of IPFS, introduces a
blockchain-based market for storage. Miners are paid to host data,
and cryptographic proofs verify that they are actually storing it.

This solves a real problem — IPFS has no built-in incentive for nodes
to host other people's data — but it introduces blockchain complexity,
cryptocurrency dependencies, and a cost model that is difficult to
predict. The proof-of-storage mechanism requires significant
computational resources, and the economics have not proven stable.

os384 takes a simpler approach: storage is budgeted through channels,
tokens are issued and consumed, and the cost model is direct and
predictable. No blockchain required.

## What IPFS Gets Right

- Content-addressing is the right foundation for distributed storage.
- The protocol is genuinely decentralized and permissionless.
- The ecosystem has driven significant research in distributed
  systems, CRDTs, and peer-to-peer networking.
- The project is open source (MIT/Apache 2.0).

But IPFS is a content distribution protocol, not a privacy or security
system. By os384's criteria, it fails on privacy (no encryption, public
DHT, IP exposure), security (no built-in encryption or key management),
and — for Filecoin — on simplicity (blockchain dependency). IPFS and
os384 share a philosophical ancestor in content-addressing, but they
diverge on everything that follows from it.
