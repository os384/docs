# What About…?

::: tip A note on this section
The comparison pages in this section were written mostly by Claude,
based on reading all os384 documentation and then researching each
alternative system. They were reviewed and edited by /psm but should
be understood as AI-generated analysis, not as the personal opinions
of the os384 team about any specific project or person.
:::

Anyone working on a genuinely new approach to privacy, security, and
data sovereignty will inevitably face the question: "But what about X?"
Signal, Matrix, Telegram, Proton — the list is long, and each project
has its own community of advocates who believe the problem is already
solved.

We respect the effort behind all of these projects. Many of them have
advanced the conversation, and some have made real contributions to the
state of the art. But when we apply the criteria laid out in the
[Background](/background) — AGPL licensing for all components,
interoperability, user control, vendor independence, genuine privacy
(not just encryption), security, and compatibility with legal
oversight — none of them meet the bar. Not one.

This section examines each of the most commonly cited alternatives
and explains, specifically and factually, where they fall short. The
goal is not to disparage anyone's work. It is to be precise about
the gap that os384 exists to fill.

## The Sovereignty Litmus Test

Before diving into individual systems, here is a quick litmus test.
If you answer in the "red" on any of these questions, the system is
not sovereign computing.

| # | Question | Sovereign Answer |
|---|----------|-----------------|
| 1 | Does the service ever require a phone number, an email, or show a CAPTCHA? | **No** |
| 2 | For basic/core capabilities, are you forced to use the provider's servers and apps? | **No** |
| 3 | Is there a fully capable open-source version of all components needed to run the system yourself? | **Yes** |
| 4 | If you save or share data, do you risk losing it if you fail to do something? | **No** |
| 5 | Can the service provider see any of the data you are saving, or see data shared between multiple parties? | **No** |
| 6 | Does the service have an "export my data" feature? | **Yes** |
| 7 | Can an individual, or any group, migrate (including self-hosting) without the service provider even knowing? | **Yes** |
| 8 | Does the service operate entirely within the legal jurisdiction of the US? | **Yes** |

### How the Alternatives Score

<em>Hover over any ❌ or ⚠️ for details.</em>

<style>
.litmus-table td { position: relative; text-align: center; }
.litmus-table td:first-child { text-align: left; }
.tip[data-tip] { cursor: help; border-bottom: 1px dashed currentColor; }
.tip[data-tip]:hover::after {
  content: attr(data-tip);
  position: absolute;
  left: 50%;
  bottom: 100%;
  transform: translateX(-50%);
  background: var(--vp-c-bg-soft, #1e1e20);
  color: var(--vp-c-text-1, #ddd);
  border: 1px solid var(--vp-c-divider, #444);
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 0.82em;
  line-height: 1.45;
  width: max-content;
  max-width: 320px;
  white-space: normal;
  z-index: 100;
  pointer-events: none;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}
</style>

<table class="litmus-table">
<thead>
<tr><th>System</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th></tr>
</thead>
<tbody>
<tr>
  <td><strong>os384</strong></td>
  <td>✅</td><td>✅</td><td>✅</td><td>✅</td><td>✅</td><td>✅</td><td>✅</td><td>✅</td>
</tr>
<tr>
  <td><a href="/whatabout/signal">Signal</a></td>
  <td><span class="tip" data-tip="Requires a phone number to register. Your identity IS your phone number.">❌</span></td>
  <td><span class="tip" data-tip="All messages route through Signal's central servers. No third-party servers allowed.">❌</span></td>
  <td><span class="tip" data-tip="Server went dark Apr 2020–Apr 2021. Anti-spam system is proprietary. Development not truly in the open.">❌</span></td>
  <td><span class="tip" data-tip="No data export. If you lose your device, your message history is gone.">❌</span></td>
  <td>✅</td>
  <td><span class="tip" data-tip="No export feature. Messages are device-bound with no extraction mechanism.">❌</span></td>
  <td><span class="tip" data-tip="Impossible. All traffic goes through Signal's servers. No federation, no self-hosting.">❌</span></td>
  <td>✅</td>
</tr>
<tr>
  <td><a href="/whatabout/matrix">Matrix</a></td>
  <td>✅</td>
  <td>✅</td>
  <td><span class="tip" data-tip="Switched to AGPL in Dec 2023 — good. But Synapse server is complex (Python + PostgreSQL) and practical self-hosting requires significant ops expertise.">⚠️</span></td>
  <td><span class="tip" data-tip="Identity is bound to your homeserver (@user:server.tld). If the server disappears, your identity and history go with it.">❌</span></td>
  <td><span class="tip" data-tip="E2E is now on by default, but metadata (who talks to whom, when, room membership) is visible to every federated homeserver operator in the conversation.">⚠️</span></td>
  <td><span class="tip" data-tip="Some export capability exists but it's inconsistent across clients and not a first-class feature.">⚠️</span></td>
  <td><span class="tip" data-tip="Your identity is permanently bound to your homeserver domain. Migration requires abandoning your identity.">❌</span></td>
  <td><span class="tip" data-tip="Matrix.org Foundation is a UK non-profit. Jurisdiction depends on which homeserver you use.">⚠️</span></td>
</tr>
<tr>
  <td><a href="/whatabout/telegram">Telegram</a></td>
  <td><span class="tip" data-tip="Requires a phone number. No alternative registration method.">❌</span></td>
  <td><span class="tip" data-tip="All messages go through Telegram's servers. No federation, no third-party servers.">❌</span></td>
  <td><span class="tip" data-tip="Server is completely closed source. Client is open source but the MTProto protocol is homegrown with known vulnerabilities.">❌</span></td>
  <td><span class="tip" data-tip="Data lives on Telegram's servers. If your account is banned or deleted, everything is gone.">❌</span></td>
  <td><span class="tip" data-tip="E2E encryption is opt-in and only for 1:1 'secret chats.' Group chats are NEVER end-to-end encrypted. Telegram can read all group messages.">❌</span></td>
  <td><span class="tip" data-tip="No meaningful data export for server-side content. Limited chat export in desktop client.">❌</span></td>
  <td><span class="tip" data-tip="Impossible. Fully centralized, no federation, no self-hosting option.">❌</span></td>
  <td><span class="tip" data-tip="Headquartered in Dubai. Durov arrested in France (Aug 2024). Multi-jurisdictional legal exposure.">❌</span></td>
</tr>
<tr>
  <td><a href="/whatabout/proton">Proton</a></td>
  <td><span class="tip" data-tip="No phone number required, but may require CAPTCHA or email verification during signup. Truly anonymous registration is not guaranteed.">⚠️</span></td>
  <td><span class="tip" data-tip="You must use Proton's servers. No federation of the encrypted layer. No self-hosting option.">❌</span></td>
  <td><span class="tip" data-tip="Clients are open source, but the server is completely proprietary and closed.">❌</span></td>
  <td><span class="tip" data-tip="Data lives on Proton's servers. If your account is closed, data is lost.">❌</span></td>
  <td><span class="tip" data-tip="E2E encryption for Proton-to-Proton email, but email headers (sender, recipient, subject, timestamps) are always in cleartext. Non-Proton email is not E2E.">⚠️</span></td>
  <td><span class="tip" data-tip="Some export tools exist but they're limited and don't cover all products equally.">⚠️</span></td>
  <td><span class="tip" data-tip="Impossible. Single provider, no federation, no way to self-host Proton's infrastructure.">❌</span></td>
  <td><span class="tip" data-tip="Swiss jurisdiction. Strong privacy law, but laws change — Proton is already moving infrastructure due to proposed Swiss surveillance legislation.">❌</span></td>
</tr>
<tr>
  <td><a href="/whatabout/whatsapp">WhatsApp</a></td>
  <td><span class="tip" data-tip="Requires a phone number. Your WhatsApp identity IS your phone number.">❌</span></td>
  <td><span class="tip" data-tip="Completely walled garden. Meta's servers and apps only. No third-party clients allowed.">❌</span></td>
  <td><span class="tip" data-tip="Both client and server are completely closed source. No way to verify the Signal Protocol implementation.">❌</span></td>
  <td><span class="tip" data-tip="Unencrypted cloud backups were the default for years. Account ban means losing everything.">❌</span></td>
  <td><span class="tip" data-tip="Message content is E2E encrypted, but Meta collects extensive metadata: contacts, usage patterns, device info, location — and shares it with Facebook for ad targeting.">❌</span></td>
  <td><span class="tip" data-tip="No meaningful export feature. Chat export produces limited text files with no media fidelity.">❌</span></td>
  <td><span class="tip" data-tip="Impossible. Fully centralized Meta infrastructure. No federation, no interop (DMA compliance is minimal).">❌</span></td>
  <td>✅</td>
</tr>
<tr>
  <td><a href="/whatabout/ipfs">IPFS</a></td>
  <td>✅</td>
  <td>✅</td>
  <td>✅</td>
  <td><span class="tip" data-tip="Data persists only as long as at least one node pins it. No automatic persistence guarantee — if no one pins your content, it's garbage-collected.">⚠️</span></td>
  <td><span class="tip" data-tip="All data stored in cleartext. The DHT is a public record of who requests what. Your IP address is visible to other nodes.">❌</span></td>
  <td><span class="tip" data-tip="Not applicable — IPFS is a protocol, not a service. You already have your data if you're running a node.">N/A</span></td>
  <td>✅</td>
  <td><span class="tip" data-tip="Protocol Labs is a US company, but IPFS is a protocol — jurisdiction depends on individual node operators.">⚠️</span></td>
</tr>
<tr>
  <td><a href="/whatabout/nextcloud">Nextcloud</a></td>
  <td>✅</td>
  <td>✅</td>
  <td>✅</td>
  <td><span class="tip" data-tip="Self-hosted instances depend on the operator maintaining the server. No built-in redundancy or automatic data preservation.">❌</span></td>
  <td><span class="tip" data-tip="Server-side encryption exists but the server holds the keys. E2E encryption module is optional, limited to specific folders, and not enabled by default.">❌</span></td>
  <td>✅</td>
  <td><span class="tip" data-tip="Identity is server-bound. No portable cryptographic identity. Migration requires admin cooperation or starting over.">❌</span></td>
  <td><span class="tip" data-tip="German company (Nextcloud GmbH), but since it's self-hosted, jurisdiction depends on where you run it.">⚠️</span></td>
</tr>
<tr>
  <td><a href="/whatabout/solid">Solid</a></td>
  <td>✅</td>
  <td><span class="tip" data-tip="You need a pod provider or must self-host a pod server. The ecosystem of Solid-compatible apps is very small.">⚠️</span></td>
  <td>✅</td>
  <td><span class="tip" data-tip="Pod depends on hosting infrastructure. If the pod provider shuts down, data is at risk unless you've backed it up.">❌</span></td>
  <td><span class="tip" data-tip="Pods store data in cleartext. The server (or hosting provider) can read everything. Access control is server-side ACLs, not cryptography.">❌</span></td>
  <td>✅</td>
  <td><span class="tip" data-tip="Identity (WebID) is tied to a URL on a specific server. If that server goes down, your identity is unresolvable.">❌</span></td>
  <td><span class="tip" data-tip="Inrupt (commercial entity) is US-based. W3C governance is international. Pod jurisdiction depends on hosting.">⚠️</span></td>
</tr>
<tr>
  <td><a href="/whatabout/keybase">Keybase</a></td>
  <td>✅</td>
  <td><span class="tip" data-tip="All services depend on Keybase's (now Zoom's) central infrastructure. No federation, no self-hosting.">❌</span></td>
  <td><span class="tip" data-tip="Client was open source but server was always proprietary. Since Zoom acquisition, development has effectively stopped.">❌</span></td>
  <td><span class="tip" data-tip="Service is in maintenance mode since Zoom acquisition. No new signups. Users have no migration path if it shuts down.">❌</span></td>
  <td>✅</td>
  <td><span class="tip" data-tip="No data export mechanism. Your identity proofs, files, and chat history are locked in Keybase's infrastructure.">❌</span></td>
  <td><span class="tip" data-tip="Impossible. Fully centralized. The Zoom acquisition proved the point — users had zero recourse.">❌</span></td>
  <td>✅</td>
</tr>
<tr>
  <td><a href="/whatabout/session">Session</a></td>
  <td>✅</td>
  <td><span class="tip" data-tip="Uses a decentralized service node network (good), but the network depends on Oxen blockchain token staking. You can't run a basic node without cryptocurrency.">⚠️</span></td>
  <td><span class="tip" data-tip="Client is open source (GPL). But the service node network depends on the Oxen blockchain, and the overall system's auditability is limited by blockchain complexity.">⚠️</span></td>
  <td><span class="tip" data-tip="Messages are routed through service nodes with limited persistence. No reliable long-term storage guarantee.">❌</span></td>
  <td>✅</td>
  <td><span class="tip" data-tip="No data export feature. Messages are ephemeral in the network and device-bound.">❌</span></td>
  <td><span class="tip" data-tip="You can't migrate without the Oxen service node network. The infrastructure is decentralized but not separable.">❌</span></td>
  <td><span class="tip" data-tip="Oxen/Session is developed by OPTF, an Australian non-profit. Blockchain nodes are globally distributed but governance is not US-based.">❌</span></td>
</tr>
</tbody>
</table>

✅ = passes, ❌ = fails, ⚠️ = partial/qualified

## The Criteria

For reference, these are the requirements from the
[Background](/background#criteria-for-a-real-solution) that we apply
to each system:

1. **AGPL open source** — all components, server and client, under
   Affero-style licensing with development done in the open.
2. **Interoperable** — open to connecting to other instances following
   open standards or well-documented protocols.
3. **User control** — any user can leave and retain all their data.
4. **Vendor independent** — no artificial lock-ins.
5. **Truly private** — no PII required by the protocol; no metadata
   leakage; no phone number, email, or identity requirement.
6. **Secure** — end-to-end encryption that doesn't depend on trusting
   the provider.
7. **Compatible with responsible legal oversight.**

Additionally, we consider:

- **App delivery trust** — can the user verify that the code running
  on their device is what it claims to be?
- **Self-hostable in practice** — not just theoretically possible, but
  simple enough that a small team or individual can actually do it.

## The Comparisons

- [Signal](/whatabout/signal) — E2E encryption poster child, but
  centralized, phone-number-dependent, and not as open as it appears.
- [Matrix / Element](/whatabout/matrix) — the most serious federated
  protocol, but complex, metadata-leaking, and cryptographically
  troubled.
- [Telegram](/whatabout/telegram) — massive user base, but encryption
  is opt-in, the server is closed, and the crypto is homegrown.
- [Proton](/whatabout/proton) — Swiss privacy branding with closed
  servers and the fundamental limitations of email.
- [WhatsApp](/whatabout/whatsapp) — good crypto inside a surveillance
  business model.
- [IPFS](/whatabout/ipfs) — content-addressed and philosophically
  adjacent, but no encryption and no privacy.
- [Nextcloud](/whatabout/nextcloud) — self-hosted collaboration done
  right in some ways, but encryption is an afterthought.
- [Solid](/whatabout/solid) — Berners-Lee's re-decentralization
  effort, but layered on top of the wrong foundation.
- [Keybase](/whatabout/keybase) — crypto identity done well, then
  acquired by Zoom. A cautionary tale.
- [Session](/whatabout/session) — a Signal fork that removed the phone
  number, but introduced a blockchain.
