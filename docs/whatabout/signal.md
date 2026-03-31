# What About Signal?

Signal is the system most people point to when the topic of encrypted
messaging comes up. Its protocol — the Double Ratchet, designed by
Trevor Perrin and Moxie Marlinspike — is a genuine contribution to
applied cryptography and has been adopted by WhatsApp, Google Messages,
and others. Signal deserves credit for demonstrating that strong
encryption can be invisible to the user.

But Signal is not what os384 is trying to be, and when we apply the
criteria from the [Background](/background), it falls short in several
important ways.

## Open Source — With Caveats

Signal's server is licensed under AGPL. That's good. But "code on
GitHub" and "open source" are not the same thing.

From April 2020 to April 2021, Signal's server repository received no
updates whatsoever.[^dark] When the code finally appeared, it was a
massive dump covering a full year of internal development — version
3.21 to 5.48 — published in one batch. Whatever was running on Signal's
servers during that year, nobody outside the organization could see it,
review it, or verify that it matched what was eventually published.

Moxie Marlinspike's explanation was that the delay was intended to
prevent spammers from reverse-engineering anti-spam measures. That may
be true, but it is also an admission that Signal's development is not
done in the open — it is done internally and selectively published when
convenient.

Furthermore, Signal's anti-spam component remains proprietary and
closed-source. This means that even if you wanted to run a functionally
equivalent Signal server, you couldn't — a key part of the system is
not available.

[^dark]: The last public commit before the gap was on April 22, 2020. See the [Signal-Server GitHub repository](https://github.com/signalapp/Signal-Server) and the [community discussion](https://github.com/signalapp/Signal-Android/issues/11101) that tracked the issue.

## You Can't Connect to the Mothership

Signal has actively prevented third-party clients from connecting to
its servers. When LibreSignal — a fork that removed Google dependencies
for use on phones without Google Play Services — attempted to use
Signal's infrastructure, Marlinspike requested they stop, and the
project was abandoned.[^libresignal]

The result is a system where the code is technically available to read,
but you cannot use it to build anything that interoperates with Signal's
network. By the criteria in os384's Background, this is the exact
scenario described as: "Systems where nominally a client is open source,
but you're not allowed to connect it to the mothership."

[^libresignal]: See the [LibreSignal FAQ](https://github.com/LibreSignal/LibreSignal/wiki/FAQ) for Marlinspike's statements.

## Federation Is Explicitly Rejected

In his 2016 post "The Ecosystem is Moving,"[^ecosystem] Marlinspike
argued that federated protocols cannot evolve quickly enough and that
centralized control is necessary for a competitive product. This is a
coherent engineering position, but its consequence is that Signal is
architecturally a centralized platform with a single point of control.

The entire value of open source and interoperability is that no single
entity controls the system. Signal's stance is: trust us, we'll do the
right thing. That is not sovereignty.

[^ecosystem]: Moxie Marlinspike, ["The ecosystem is moving,"](https://signal.org/blog/the-ecosystem-is-moving/) Signal Blog, May 2016.

## Phone Number Required

Signal requires a phone number to register. This is not a minor UX
detail — it is a fundamental privacy failure. Your phone number is
issued by a carrier, tied to your government ID in most countries, and
is the single most effective way to track a person across services.

As of 2024, Signal allows users to create usernames and hide their
phone number from contacts, which is an improvement. But the phone
number is still required for registration. Signal has stated they are
"actively working" on removing this requirement, but it remains in
place.

A system that requires a phone number to function is not private. It
may be secure — in the sense that message contents are encrypted — but
privacy and security are not the same thing.

## The App Delivery Problem

Signal's clients are open source and the Android build process supports
reproducible builds.[^repro] This is commendable and ahead of most
competitors. However, reproducible builds require technical
sophistication to verify — the overwhelming majority of Signal's users
install the app from the Google Play Store or Apple's App Store and
have no practical way to confirm that the binary they received
corresponds to the published source code.

The iOS client does not support reproducible builds at all. Desktop
builds have had intermittent reproducibility issues.

This is the app delivery trust problem: the security of Signal
ultimately rests on trusting that the binary delivered through the app
store has not been tampered with — by the developer, by the app store
operator, by a government, or by anyone else in the delivery chain.

[^repro]: See [Signal's reproducible builds documentation](https://github.com/signalapp/Signal-Android/wiki/Reproducible-Builds).

## Intel SGX

Signal uses Intel's Software Guard Extensions (SGX) for "secure value
recovery" — a mechanism intended to allow private contact discovery
without exposing phone numbers to Signal's servers.

SGX introduces a dependency on Intel hardware attestation. Researchers
have extracted Intel's private attestation keys from SGX's quoting
enclave, demonstrated injection attacks against enclave threads, and
identified multiple side-channel vulnerabilities. A government could
theoretically pressure Intel to sign keys for a malicious enclave.

This is an additional trust dependency in a system that claims to
minimize trust — the "+1 trust effect" discussed in os384's
[Background](/background#on-trust), compounded.

## What Signal Gets Right

To be clear about what Signal does well:

- The Signal Protocol (Double Ratchet) is excellent cryptography with
  forward secrecy and post-compromise security.
- The UX is genuinely good — encryption is invisible to the user.
- The Android reproducible build support is ahead of the industry.
- The organization has a strong track record of resisting government
  pressure on message content.

These are real accomplishments. But they address security, not
sovereignty. Signal is a system where you must trust a single
organization to deliver unmodified software, to keep its servers
running, to not change its policies, and to continue existing. That is
not the same as a system where the architecture itself guarantees your
freedom.
