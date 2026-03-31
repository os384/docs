# What About WhatsApp?

WhatsApp uses the Signal Protocol for end-to-end encryption. This is
excellent cryptography — the same Double Ratchet mechanism that makes
Signal's encryption best-in-class. Two billion users benefit from it
every day.

But WhatsApp is owned by Meta, and that fact shapes everything else.

## Good Crypto, Bad Context

The Signal Protocol, as implemented in WhatsApp, provides genuine
end-to-end encryption for message content. Meta cannot read your
messages in transit or at rest — assuming the implementation is correct
and unmodified.

That is a significant assumption. WhatsApp's client code is proprietary
and closed source. There is no way to verify that the Signal Protocol
implementation is faithful, that it has not been modified, or that
additional data collection has not been layered on top of it.

The server is also closed source. Unlike Signal, there is not even a
nominal claim of open-source server code.

## Metadata Is the Product

WhatsApp may not read your messages, but it collects everything else:
who you talk to, when, how often, for how long, your phone number, your
contacts list, your device information, your IP address, your location
data, and your usage patterns. This metadata is shared with Meta's
broader advertising infrastructure.[^privacy]

This is not a side effect — it is the business model. Meta acquired
WhatsApp for $19 billion in 2014. The return on that investment comes
from the metadata, not from the messages.

The 2021 privacy policy update made this explicit: WhatsApp shares
data with Facebook for ad targeting, business messaging, and "product
improvement." Users who objected had no meaningful alternative — accept
the new terms or stop using the service.

Metadata is often more valuable than message content. Knowing that
someone called a divorce lawyer, a cancer clinic, and a bankruptcy
attorney tells you more than the contents of those calls.

[^privacy]: See WhatsApp's [Privacy Policy](https://www.whatsapp.com/legal/privacy-policy) and the [2021 update controversy](https://en.wikipedia.org/wiki/WhatsApp_privacy_policy_controversy).

## Phone Number Required

WhatsApp requires a phone number — it is the user's identity on the
platform. There is no username system, no alternative identifier. Your
WhatsApp identity is your phone number, which is tied to your carrier,
which is tied to your government ID in most countries.

## No Interoperability

WhatsApp is a walled garden. There is no federation, no open protocol,
no third-party clients, and no way to use WhatsApp's infrastructure
with anything other than Meta's official apps. The EU's Digital Markets
Act has forced Meta to begin work on interoperability, but the
implementation timeline is slow and the details suggest minimal
compliance rather than genuine openness.

## Backups Undermine Encryption

For years, WhatsApp's chat backups to Google Drive and iCloud were
stored unencrypted, effectively negating the end-to-end encryption for
anyone who used the backup feature — which was enabled by default.
WhatsApp introduced encrypted backups in 2021, but these are optional
and require the user to actively enable them.

The practical result is that many users' "end-to-end encrypted"
messages exist in unencrypted form on Google's or Apple's servers.

## What WhatsApp Gets Right

- The Signal Protocol implementation provides genuine E2E encryption
  for message content.
- The scale — two billion users — demonstrates that encryption can be
  invisible to non-technical users.
- The infrastructure is reliable and performant.

But WhatsApp is a surveillance business model with good encryption
bolted on. The client and server are closed source, the metadata
collection is extensive and deliberate, a phone number is required,
and there is no interoperability. By os384's criteria, it fails on
open source (completely closed), privacy (metadata is the product),
sovereignty (owned by Meta, single point of control), and
interoperability (walled garden).
