# What About Keybase?

Keybase deserves a special place in this section because it was, in
many ways, ahead of its time — and because what happened to it is a
cautionary tale about building sovereignty on top of a company.

## What Keybase Was

Launched in 2014 by Max Krohn and Chris Coyne (co-founders of
OkCupid), Keybase set out to make public-key cryptography usable by
normal people. The core insight was that the PGP "web of trust" had
failed — not because the cryptography was wrong, but because key
verification was too hard for anyone outside the security community.

Keybase's solution was elegant: tie cryptographic proofs to social
media identities. You could prove that a Twitter account, a GitHub
profile, a Reddit handle, and a PGP key all belonged to the same
person, creating a verifiable identity chain without relying on
certificate authorities or centralized identity providers.

This was followed by encrypted chat, encrypted file storage (KBFS — a
cryptographic filesystem), encrypted Git repositories, and
Stellar-based cryptocurrency integration. The Keybase app was
well-designed, the cryptography was sound, and the team shipped
consistently.

## The Acquisition

In May 2020, Zoom acquired Keybase. The stated purpose was to bolster
Zoom's encryption capabilities — Zoom was under intense scrutiny at the
time for its misleading claims about end-to-end encryption during the
pandemic-driven video calling surge.

Within months, Keybase stopped accepting new signups. Development
effectively ceased. The service remains nominally running as of this
writing, but there have been no significant updates, no new features,
and no indication of continued investment. The team was absorbed into
Zoom's engineering organization.

The Keybase community — which had built workflows, identity proofs, and
encrypted collaboration around the platform — was left with a service
in maintenance mode and no migration path.

## The Cautionary Tale

Keybase illustrates a failure mode that purely technical analysis
misses. The cryptography was good. The identity model was innovative.
The client was open source (though the server was not). The team was
talented and well-intentioned.

None of that mattered when the company was acquired.

The problem was structural: Keybase was a company, and companies can be
bought. Every user's identity proofs, encrypted files, and
collaboration workflows depended on Keybase's servers continuing to
operate. When the incentives changed — when Zoom's needs diverged from
the community's needs — the users had no recourse.

This is the "hit by a bus" problem at organizational scale. A
sovereign system must be able to survive the disappearance of any
single entity — including the entity that created it. Keybase could
not survive its own acquisition.

## What Keybase Got Right

- The social proof identity model was genuinely innovative and
  influenced later work in self-sovereign identity.
- KBFS demonstrated that encrypted filesystems could be usable.
- The approach to making cryptography accessible was ahead of its time.
- The client applications were open source.

But the server was closed, the system was centralized, and when the
company's interests changed, the users had no sovereignty. By os384's
criteria, Keybase fails on open source (server was proprietary),
vendor independence (entirely dependent on Keybase, then Zoom), and
sovereignty (no migration path, no way to reconstitute the community
elsewhere). The lesson is not that Keybase was bad — it is that
sovereignty cannot be a feature of a product. It must be a property
of the architecture.
