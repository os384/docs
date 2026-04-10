# What About Session?

Session is a fork of Signal that removed the phone number requirement
and replaced Signal's centralized server infrastructure with a
decentralized network. On paper, this addresses two of Signal's most
significant weaknesses. In practice, the solution introduces its own
problems.

## The Phone Number Fix

Session does not require a phone number, email, or any personally
identifiable information to register. Users get a randomly generated
Session ID — a long numeric string — that serves as their identity.
This is a genuine improvement over Signal and addresses one of os384's
core requirements: no PII in the protocol.

## Decentralized — Via Blockchain

Session's decentralization is built on the Oxen blockchain (formerly
Loki), a Monero fork. Messages are routed through a network of "service
nodes" — servers operated by people who have staked OXEN cryptocurrency
tokens. The service node network provides onion routing (similar to
Tor) for message delivery.

This means Session's decentralization depends on a cryptocurrency
economy. The service nodes must be economically incentivized to
participate, which requires the OXEN token to have value, which
requires a functioning market, which requires ongoing demand. If the
token economy fails, the network loses nodes. If the network loses
enough nodes, messages stop being delivered.

This is a fragile foundation for a communication system. os384 takes
the position that infrastructure should be funded by the people who use
it — through direct hosting, cooperative arrangements, or
straightforward payment — not through speculative token economics.

## Modified Signal Protocol

Session uses a modified version of the Signal Protocol that removes the
central server dependency. However, the modifications include removing
perfect forward secrecy for group chats — a significant security
regression. In Signal's original protocol, compromising a session key
does not compromise past messages. Session's group chat implementation
does not provide this guarantee.

The justification is that decentralized message delivery makes the
Signal Protocol's ratcheting mechanism difficult to implement. This
may be true, but it means Session has traded one of the Signal
Protocol's most important security properties for decentralization.

## Closed-Source Components

Session's client applications are open source (GPL). However, the
service node software and the Oxen blockchain infrastructure include
proprietary components and the overall system's auditability is
limited by the complexity of the blockchain layer.

The server-side story is more nuanced than Signal's — the "server"
is a decentralized network of nodes, which is architecturally better
than a single point of control. But the individual node software and
the blockchain consensus mechanism represent a significant amount of
code that most users will never audit.

## Metadata and Onion Routing

Session uses onion routing to obscure message metadata, which is a
meaningful improvement over Signal (where the server sees sender and
recipient metadata). The design goal is that no single service node
knows both the sender and recipient of a message.

This is good. However, onion routing's effectiveness depends on the
size and diversity of the network. A small network with concentrated
node ownership can be de-anonymized through traffic analysis. The Oxen
service node network is substantially smaller than Tor's relay network,
which raises questions about the practical strength of the anonymity
guarantee.

## What Session Gets Right

- Removing the phone number requirement is the right call.
- Decentralized message routing eliminates the single-server trust
  dependency.
- Onion routing for metadata protection is the right approach.
- The project demonstrates that Signal's core protocol can be adapted
  for decentralized delivery.

Session is an interesting experiment in addressing Signal's most
obvious weaknesses. But the blockchain dependency introduces fragility
and complexity, the security regression on forward secrecy is
significant, and the token economics create a different kind of
centralization risk — not in a server, but in a market. By os384's
criteria, it partially passes on privacy (no phone number, onion
routing) but raises concerns on security (weakened forward secrecy),
simplicity (blockchain dependency), and long-term viability
(cryptocurrency-dependent infrastructure).
