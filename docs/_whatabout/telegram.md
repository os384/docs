# What About Telegram?

Telegram has over 950 million users and is frequently described in the
press as an "encrypted messaging app." This description is, to put it
charitably, misleading.

## Encryption Is Not the Default

Telegram's regular chats — the ones everyone uses — are not end-to-end
encrypted. They use client-server encryption, which means Telegram's
servers hold the decryption keys and can read message content.[^default]

E2E encryption is available only through "Secret Chats," which must be
manually activated for each conversation. Secret Chats are limited to
one-on-one conversations — group chats cannot be end-to-end encrypted
at all. The UX for activating Secret Chats is, as cryptographer Matthew
Green has noted, "oddly difficult for non-expert users."[^green]

The practical result is that the vast majority of Telegram
conversations — and every single group chat — are readable by Telegram's
servers.

[^default]: See [Telegram's own documentation on Secret Chats](https://core.telegram.org/api/end-to-end): E2E encryption is explicitly described as a separate, opt-in feature.
[^green]: Matthew Green, quoted in [Schneier on Security](https://www.schneier.com/blog/archives/2024/08/matthew-green-on-telegrams-encryption.html), August 2024.

## Homegrown Cryptography

Telegram uses MTProto, a custom cryptographic protocol designed
in-house rather than building on established standards like TLS or the
Signal Protocol. This is a red flag in applied cryptography — the field
has learned, painfully, that designing your own crypto protocol is
almost always a mistake.

Peer-reviewed security analyses have identified concrete vulnerabilities
in MTProto: both versions 1.0 and 2.0 have IND-CPA weaknesses, and the
protocol does not satisfy standard definitions of authenticated
encryption.[^mtproto] Green's assessment of MTProto's use of IGE
(Infinite Garble Extension), a non-standard cipher mode, was blunt:
"The crypto is like being stabbed in the eye with a fork."

[^mtproto]: See Albrecht et al., ["Four Attacks and a Proof for Telegram,"](https://eprint.iacr.org/2025/451.pdf) and the earlier [CCA analysis of MTProto](https://eprint.iacr.org/2015/1177.pdf).

## Server Is Closed Source

Telegram's server code is proprietary and has never been published.
The client apps are open source under GPL v2/v3, but the server — the
part that actually handles your messages and holds the encryption keys
for non-Secret-Chat conversations — is a black box.

Telegram has argued that publishing server code provides no security
benefit since there is no way to verify that published code matches
what runs on their servers. This argument is technically correct but
strategically self-serving: it is an argument against transparency
itself, not a justification for opacity.

## Phone Number Required

Telegram requires a phone number for registration. There is a
workaround involving anonymous blockchain-based phone numbers purchased
through Telegram's Fragment platform, but this is a cryptocurrency
transaction, not a practical alternative for most users.

## Metadata Collection

Telegram collects and retains IP addresses, device information, phone
numbers, contact lists, and interaction timestamps for up to 12 months.
This data can be shared with authorities if legally required.

## The Durov Arrest

In August 2024, Telegram CEO Pavel Durov was arrested at Paris-Le
Bourget Airport and indicted on 12 charges related to Telegram's
platform governance. Whatever one thinks of the legal merits, the
episode illustrates the risks of a centralized, personality-driven
platform: a single arrest created existential uncertainty for a service
used by nearly a billion people.

## What Telegram Gets Right

- The UX is polished and the feature set is extensive.
- The platform has demonstrated willingness to resist government
  pressure in some jurisdictions.
- Client-side code is open source.
- The scale demonstrates demand for messaging outside Big Tech.

But Telegram is not an encrypted messaging platform in any meaningful
sense. It is a cloud messaging platform with an optional, limited
encryption feature that most users never activate. By os384's criteria,
it fails on privacy (phone number required, metadata collected), on
security (E2E not default, homegrown crypto), on open source (server
is closed), and on sovereignty (centralized, single point of control).
