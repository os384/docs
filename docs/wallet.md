# Wallets

## Introduction

An `SB384` wallet is a set of cryptographic keys designed to securely bootstrap an `SB384` object using simple, human-friendly methods such as paper, pencil, or memory. The wallet consists primarily of two components:

1. [**Strongpin**](/glossary#strongpin): A 16-character [Base62](/glossary#base62)-encoded string containing 76 bits of entropy.
2. **Passphrase**: A randomly generated phrase, recommended to contain three or more words. Each word provides approximately 13 bits of entropy, adding to the security and resilience of the wallet.

## Creating a Wallet

The wallet is generated entirely within the client using the provided passphrase and an automatically generated strongpin. The recommended baseline is a three-word phrase (totaling approximately 39 bits of entropy), combined with the 76-bit strongpin for a substantial security baseline. Additional words enhance security further, though memorization practicality should be balanced against added complexity. Three-word phrases already offer significantly higher security than typical human-created passwords.

Upon clicking **"Create a Wallet"**:

- The client generates a matching strongpin.
- Both strongpin and passphrase are combined using [PBKDF2](/glossary#pbkdf2-password-based-key-derivation-function-2) with 10 million iterations, enhancing brute-force attack resistance.
- A unique elliptic curve ([P-384](/glossary#p-384-secp384r1)) private key is derived from this combination.
- The public key is subsequently derived from the private key.
- A [Channel ID](/glossary#channel-id) (`channelId`) is derived from the public key, and the private key is used to prove ownership of the channel.

All these processes occur exclusively on the client side, with no network communication.

## Wallet and Vault Concepts

In the sb384 system, the following terms share the same underlying `SB384` object but differ based on their context:

- **Wallet**: Refers to the set of entropy (strongpin and passphrase) necessary to regenerate an `SB384` object entirely from non-digital means.
- [**Vault**](/glossary#vault): A wallet authorized (registered) on a server to host and operationalize a channel. The vault retains ownership by securely holding the private key. The owner, via the vault, controls communication and policies associated with the channel.

## Channels and Storage Tokens

A **channel** is a central concept within sb384. Channels exist both abstractly (independent of servers) and concretely (hosted by servers). Creating a channel can occur via:

- [**"Budding"**](/glossary#budd): Spinning off a channel from an existing one.
- [**Storage Tokens**](/glossary#storage-token): Special tokens printed from an existing channel’s [storage budget](/glossary#storage-budget).

### Storage Tokens:
- Temporary carriers of storage budget recognized only by the server on which they are printed.
- Track metadata, including the originating channel's identity.
- Ephemeral in nature and expire after use.
- Required minimum size for channel creation: 8MB.

To create a vault:
1. Obtain a storage token.
2. Register (authorize) your abstract wallet on the server using this token.

This process transitions the wallet from an abstract concept into a functional vault capable of operational activity.

## Logging In

To access your vault (channel) later, you need only two pieces of information:
- Your strongpin
- Your passphrase

When logging in, the wallet is regenerated cryptographically (again using PBKDF2 with 10 million iterations). The regenerated private key and channel ID are validated against the server-stored keys, confirming successful recovery.

For ease of access, the strongpin is typically stored locally on your browser, while the passphrase is expected to be memorized or securely stored.

## Security Considerations

The wallet’s security comes from three elements:

1. **Strongpin** (76 bits of entropy)
2. **Passphrase** (approximately 39 bits of entropy baseline, expandable by adding more words)
3. **PBKDF2 stretching** (10 million iterations)

While the generated elliptic curve key ideally would have close to 384 bits of entropy, practicality demands a compromise. The chosen security measures significantly exceed typical industry standards (e.g., a major compromised password manager from 2022 used only 100,000 iterations of PBKDF2).

Developers can easily enhance security further:
- Each additional strongpin segment adds 19 bits of entropy.
- Each additional passphrase word adds 13 bits of entropy.
- PBKDF2 iteration count can be adjusted to balance security and usability.
- Per-wallet random salts can also be incorporated for additional security if storage allows.

## Practical Usage

- The strongpin should ideally be written down or safely stored digitally.
- The passphrase should be memorized or stored in a highly secure manner.
- Your vault (channel) provides private, secure storage for personal data, metadata of other channels, and installed applications.

### Additional Notes

- All cryptographic processes and wallet creation occur locally in your browser; no sensitive information leaves your client.
- Channel registration is the only operation involving server communication, confirming channel functionality.

This documentation outlines secure, practical methods for creating, managing, and accessing wallets and vaults within the sb384 ecosystem.

