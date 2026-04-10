# What About Proton?

Proton (ProtonMail, ProtonDrive, ProtonVPN) has built a strong brand
around Swiss privacy law and end-to-end encryption. The marketing is
effective, and the intent appears genuine. But when we apply the criteria
from the [Background](/background), the picture is more complicated than
the branding suggests.

## The Server Is Closed Source

Proton's client applications — web, iOS, Android, and the Bridge app —
are open source. This is good, and Proton deserves credit for it.

But the server infrastructure is entirely proprietary and closed source.
Proton's argument is similar to Telegram's: publishing server code
doesn't help because you can't verify it matches production. As with
Telegram, this is an argument against transparency itself.

The practical consequence is that you cannot run your own Proton server.
There is no federation, no interoperability, no way to verify what the
server does with your data beyond taking Proton's word for it. By
os384's criteria, a system where the server is closed source is not
fully open source, regardless of what the clients do.

## Email Is the Problem

Proton's flagship product is email. This is a fundamental limitation
that no amount of encryption can fix.

Email is a federated protocol — anyone can run an SMTP server. But
email's federation model means that messages sent to or received from
non-Proton addresses are not end-to-end encrypted. They transit in
cleartext (or TLS at best) across the open internet. Proton offers a
workaround where external recipients receive a link to view an encrypted
message on Proton's servers, but this requires the recipient to trust
Proton's web infrastructure — it is not end-to-end encryption in any
meaningful sense.

Even between two Proton users, the encryption is based on OpenPGP, which
encrypts message bodies but leaves headers — sender, recipient, subject
line, timestamps — in cleartext. These headers are metadata, and
metadata is often more valuable to a surveillance operation than message
content.

The deeper issue is that email was designed in the 1970s and 1980s
without encryption or privacy as design goals. Retrofitting encryption
onto email is like adding seatbelts to a horse: technically possible, but
the vehicle was not designed for the forces involved.

## Phone Number Not Required — But Verification Is

Proton does not require a phone number for registration, which puts it
ahead of Signal and Telegram on this specific point. However, Proton
may require human verification during signup — via email, SMS, or
CAPTCHA — depending on the circumstances. This is understandable as an
anti-abuse measure, but it means that truly anonymous registration is
not guaranteed.

## Swiss Jurisdiction — A Feature, Not Architecture

Proton's Swiss base is a genuine advantage. Swiss privacy law is strong,
and the constitutional right to privacy is real. But jurisdiction is a
policy decision, not an architectural property. Laws change. Switzerland
has already proposed surveillance legislation that would increase
obligations on service providers — Proton has begun moving some
infrastructure out of the country in response.[^swiss]

A system that depends on favorable law in a specific country is not
sovereign. It is geographically convenient. os384's approach is to make
the architecture itself the guarantee: the server cannot read your data
not because Swiss law says so, but because it does not have the keys.

[^swiss]: See Proton's own statements on evolving Swiss surveillance proposals and their infrastructure responses.

## The App Delivery Trust Problem

Proton Mail's web client is delivered fresh from Proton's servers on
every page load. This means that Proton — or anyone who compromises
Proton's servers, or any government that compels Proton — could serve
a modified client that exfiltrates encryption keys or message content.

The mobile apps are distributed through the App Store and Google Play,
which introduces the same binary delivery trust problem that affects
Signal and every other app-store-dependent service.

Proton is aware of this issue and has taken steps toward transparency
(open-source clients, security audits). But awareness of the problem
is not the same as solving it.

## What Proton Gets Right

- Genuine commitment to privacy as a business model, not despite it.
- Client-side code is open source and has been independently audited.
- No phone number requirement for basic registration.
- Swiss jurisdiction provides stronger legal protections than most
  alternatives.
- ProtonDrive and ProtonCalendar extend encryption beyond email.

But Proton is fundamentally a service provider asking you to trust them.
The server is closed, the protocol (email) leaks metadata by design,
the security depends on favorable jurisdiction, and the app delivery
problem remains unsolved. By os384's criteria, it fails on open source
(server closed), interoperability (no federation of the encrypted
layer), and sovereignty (single provider, single jurisdiction).
