# Background and Problem

Tim Berners-Lee's original 1989 proposal for the World Wide Web laid out a fundamentally collaborative vision, a peer-to-peer model where any participant could link to any other, operating on any computer across the globe.
With only minimal central authority, information and control flowed freely among users.

However, as the internet grew and complexity increased, it became more and more difficult for individuals and smaller organizations to operate their own services.
Software began to require constant updates, and hardware as always required regular maintenance and replacement.
Doing this well required a level of skill and an ongoing investment of time and money.
Around the same time, Big Tech companies began offering centralized platforms and "software as a service".
They promised to take away the burden of operating networked services, by employing armies of highly skilled site reliability engineers and maintaining huge fleets of servers.
Everything would be easy as long as you handed over your personal your data and you'll get free or close to free services in return.
This led to a consolidation of power and control into a small number of centralized platforms.

Now, individuals and smaller organizations have become highly dependent on these few large companies to host and protect their most important data, including photos, emails, messages, and documents.
But the platforms hold all the power in this relationship, and they provide little or no protections for the security of their users' data.
* No *confidentiality*: The platform can see all of its users' data, so nothing prevents it from using that data for its own ends or from accidentally disclosing secrets to an attacker.
* No *integrity*: The platform can modify a user's data at will, or through negligence can allow the data to be corrupted, either randomly or by an attacker.
* No *availability*: The platform can lock a user out, denying them access to their own data.
* No *[sovereignty](/glossary#sovereignty)*: The platform limits how the user can access their data, making it difficult or impossible to export the data or switch to a competing provider.

Moreover, at a societal level, this centralization stifles innovation and limits the diversity of voices online.

At the time of the original writing of these docs (2024), you might think there are enough options for messaging, chatting, photo sharing, social networking, file storage, video, forums, and so on. On the whole, it's a trillion dollar business.

And that's the problem.

What we have learned in the past decade or so is disconcerting: this area of communication and data-sharing software is a key to influencing people, and hence, incredibly profitable — profitable to the point that all these supposed options are in fact crowding out alternatives that, were we fully informed and had access to them, we would prefer. In fact, the "system" spends a great deal of resources to counter the evolution of any such alternatives.

The net result is that the options available for collaboration software outside of "Big Tech" are few, and if we apply our modern understanding of terms such as "privacy", "security", and "data sovereignty", then arguably there are zero good options.

## Data Rights

These issues have been well understood for a while. Generally they have been discussed as "data rights" — but more recently, we have come to understand them as fundamental personal freedoms. It's about your sovereignty.

Below are three expressions of these rights that have shaped the thinking behind os384.

First, paraphrased from the *User Data Manifesto* by Frank Karlitschek and Hugo Roy ([userdatamanifesto.org](https://userdatamanifesto.org/)):

> *Control:* User data should be under the ultimate control of the user, including any "metadata". Users should be able to decide whom to grant direct access to their data and with which permissions and licenses should be granted.
>
> *Transparency:* Users should know where their data is stored, how it is stored, what is done with it, and what laws apply.
>
> *Freedom:* Users should always be able to extract their data from the service at any time without experiencing any vendor lock-in. Any rights they've granted should always be revocable.

A more visceral expression, from Jeffrey H. Wernick ([jeffreyhwernick.com](https://www.jeffreyhwernick.com/articles/data-manifesto)):

> The basis for any society to respect the individual is predicated upon the sovereign individual. Our most important property right is ourselves. If we lose ownership of ourselves, we become enslaved. The property of others.
>
> We are comprised of our attributes. That defines who we are. We are the sum total of our attributes and more. Apparently there is great commercial value in understanding our attributes and then using what is learned, sometimes in our interests and sometimes against our interests but never with our permission and never with the recognition that we have not transferred copyright over ourselves to others to be sold. We are being sold. That is slavery.
>
> What we do. What we think. The activities we engage in. [...] We are violated. We are dehumanized. It is outrageous. And it is accomplished through deception. The selling of data is human trafficking. The selling of contraband. A violation of our human rights.

The Mission Statement from the Magnusson Institute (initial funder of os384) puts it this way:

> *Without privacy, the rights afforded to us are not just eroded, they become meaningless. Without privacy, our lives become cages built from one-way mirrors. Others can look in, but we can't see them. This is not about everybody knowing everything about everybody. It is about some entities — corporations, political organizations, foreign governments, any group with a budget and a purpose — gaining perfect information about us. We won't even know who "they" are, let alone what they are up to. Without privacy, we lose our free will. We become an asset for somebody's algorithm. We lose our agency — you think you are in control, but you're really not, and in the cruelest way — within an illusion that we retain control. Without privacy, we become pawns in a game we cannot see, contributing to an outcome of which we are unaware. The course of our lives will be to serve some unknown purpose. Without privacy, we lose not just individual agency, but collective agency. We become powerless. Without privacy, we lose more than freedom and liberty. We lose our humanity. We become blind mice in a maze; puppets on invisible strings.*

We will refer back to the three principles from the User Data Manifesto — *control*, *transparency*, and *freedom* — throughout this documentation. Together we call them *sovereignty*.

## Criteria for a Real Solution

Historically, this would have been very difficult to do much about. But there have been a few technical "equalizers" that have developed in the past several years that provide a possibility to change things.

Before getting to that, let us try to be more concrete. The following list introduces the requirements that any solution *should* meet. When we apply these criteria to all the options available today, not a single one fulfills all of them:

- **AAGPLv3 open source licensing** for the entire system (all minimally necessary parts). See the Open Source section below for detailed explanation.
- **Interoperable** — the design must be open to connecting to other instances, following open standards or well-documented, open-sourced protocols.
- **User control** — any user should be able to "pick up and leave" and retain access to all of their data, including data shared with them, contact information, and communication records with any other user.
- **Vendor independent** — a single vendor can be a core facilitator, but artificial lock-ins are not acceptable.
- **Truly private** — not just encrypted in transit, but private by design throughout.
- **Secure** — this has become something of a "red herring": most current systems heavily advertise their "security" (e.g. "peer to peer encryption"), partly to distract from failures in privacy or sovereignty.
- **Compatible with responsible legal oversight.**

These are not ranked by priority — they are *all* necessary criteria.

## Open Source

All sorts of messaging projects claim to be open source. But upon closer inspection all exhibit a variety of caveats, footnotes, reservations, and carve-outs. Examples of real-world issues include:

- Systems where the code is free to use and host — as long as you don't compete with a named corporate entity.
- Systems where key parts (client vs. server) are distributed under different licensing models, or where server-side code is missing completely.
- Systems where the server side is under a non-Afero-style license.
- Systems where key aspects of the documentation are either not kept up to date, or are only available through separate commercial licensing.
- Systems where the code is technically available, but the build process is so complex it is not practically reproducible.
- Systems which embed commercial aspects such as "phone home" behavior, paid placement, or lead generation to commercial versions — at a rate that makes it impractical for a consumer of the codebase to keep up with.
- Systems where essential parts are not interoperable — for example, where the original service provider runs a flavor that requires phone number or email confirmation but does not expose user cryptographic keys that would allow interoperability.
- Systems where nominally a client is open source, but you're not allowed to connect it to the mothership.

The **Afero-style licensing** issue merits elaboration. The Open Source movement dates to a time when software was delivered to a user to run on their own computer. The core principle was that you could use and modify the source code freely, but if you ever re-distributed it, you were required to share your changes. The "trigger" that forced sharing was *distribution*.

This was before the modern Internet. Along came companies like Yahoo, eBay, Google, and Amazon, who discovered they could absorb the entire open source world, make all the improvements they wanted, and — since they ran the code on their own computers and offered an "online service" rather than distributing it — they never had to contribute back.

This created a crisis. The Open Source movement responded with new licenses.
Notably, **AGPLv3** (the "Afero" license) adds a new trigger: using the software
to deliver any online service forces the provider to share any changes and
additions. The current consensus is that any communication-oriented "open
source" project should be AGPLv3, but few are.

What we consider necessary beyond simply stating "we are open source":

- Only AGPLv3 or similar license is acceptable.
- All parts of the system should be available under open source, with no variations.
- There shouldn't be any parts that are not available — including documentation, test suites, and so forth.
- Development should be done in the open, so anybody can join in or at minimum follow along.
- The aggregate system should be designed and maintained to remain practical: simple to download, build, and run.

## Interoperable

This means the design of the service is open to connecting to other instances of the service, following open standards or at least well-documented and open-sourced protocols.

In the early days of the Internet, this was a given. Email uses standards like SMTP for transmission, RFC 5322 for basic formatting, MIME standards to add new data types, and POP3 and IMAP to specify how applications talk to email services.

With the advent of the Internet as a Very Big Business, these traditions went away: the "walled garden" rules supreme.

os384 defines two primitives: a [shard](/glossary#shard) and a [channel](/glossary#channel). Services are built on those, and hosting them is done in a fundamentally interoperable manner: there is no central source of authority for logging in; authentication is done by channels, and "accounts" are implemented with vaults.

## The Software Challenge

Any developer who sets out to build a different kind of application — one that respects their users' privacy and freedom — faces a difficult task.
Various building blocks exist for things like encryption, but there are still many gaps.
Assembling a complete solution remains very difficult and time consuming — far beyond the time available to most hobbyists and enough to blow the budget of most for-profit commercial projects.
We know, because we have tried.

Any app that seeks to protect its users' freedom and security will need to implement a core set of non-trivial functionalities, including:
- Authentication and authorization
- Key generation
- Encryption
- Sovereign cryptographic identity
- Digital signatures
- Secure cloud storage
- Secure storage and backup for cryptographic keys
- A client-server API
- Resource accounting
- An efficient backend server implementation

The origins of os384 trace back to a small project to create a simple chat and social media application.
We first discovered that we would have to begin from scratch, and then over a period of a few years we realized that modern standards of digital sovereignty are simply not attainable using existing app development technologies.
As we tried to assemble the available pieces and fill in the gaps, we discovered that we were redesigning deeper and deeper into the "stack" of any app.
And inadvertently we found ourselves writing what amounts to a new operating system for the decentralized web.

## Design Principles

The core design principles of os384, in strict order of priority:

1. **Private by design** — from the ground up, providing as much privacy as possible, subject only to the design constraints below.
2. **As secure as possible** — both with respect to third parties and to employees of any organization hosting the service. This includes using the latest perspectives on cryptographic choices.
3. **Owner control** — enable and facilitate as much as possible the ability of an [Owner](/glossary#owner) to control and understand the necessary trade-offs between ease of use, privacy, and security. Owner is applied to separate pieces. There is no central authority.
4. **Transparent** — from the beginning, designed for future open sourcing, publishing, and third-party reviews of various kinds.
5. **High performance and scalability.**
6. **Utilize large, modern building blocks** — leverage the "from scratch" opportunity to select current best-practice and aggressively seek out next-generation technical opportunities.
7. **Minimalistic in implementation** — as little dependence as possible on external libraries and tools, and as little custom code as possible.

## On End-to-End Encryption

Some chat services claim that messages can be deleted, made non-recordable, or subject to "autodestruct". To be direct: these claims cannot be genuinely delivered by any chat service. The only way to truly accomplish this would require a tightly integrated hardware, operating system, and application from a single vendor — which simply shifts the trust requirement entirely onto that vendor.

The same critical thinking applies to end-to-end encryption (E2E), a term that has been widely adopted but unevenly applied.

Intuitively, "end-to-end" encryption implies that only the two parties at each end can read anything transmitted — nobody in-between. If Alice is talking to Bob, Bob is the only person capable of reading her messages, and vice versa.

In a strict sense, truly provable E2E is impossible — you would have to prove a negative: that your device hasn't been tampered with, or that your messaging app contains no code targeting you specifically. But it is useful to distinguish *conventional* E2E from *true* E2E.

**Conventional E2E** is a system that is secure — *assuming you trust and believe all statements made about its implementation*. Serious providers are reasonably transparent about this. Telegram, for example, goes to some length to discuss their trade-offs openly. Others are less forthcoming. When Apple's iMessage protocol was first analyzed in detail in 2013, it was quickly noted that you still ultimately needed to trust Apple. Their spokesperson confirmed as much: the analysis discussed "theoretical vulnerabilities that would require Apple to re-engineer the iMessage system to exploit it, and Apple has no plans or intentions to do so." Which in plain English means: yes, you still need to trust us. The underlying limitation is, almost always, **key management**.

A second category of weakness is the need to trust the *platform* itself — the website, browser, app, and phone combination you're running. If any part is compromised, even temporarily or by an unknown bug, someone can read your messages. Any web-based messaging system is particularly exposed here, since the server delivers the application code and could inject anything it wanted at any time.

**True E2E** attempts to address both areas: independently verifiable keys reduce key management risk; open-source client software with an equally open-source server side helps with platform trust.

Beyond security there is the separate question of *privacy*. E2E is about security — not privacy. Any messaging system that requires a phone number to authenticate is not private: it provides no anonymity. Any system that reuses the same cryptographic credentials across separate conversations is not private either, because tracking which public keys communicate with each other is itself a form of surveillance. This property is called *unlinkability*. Any system that depends on external infrastructure (SMS, push notifications) for any part of the conversation lifecycle is not private. The reason that *secure* communications are easier to find than *private* communications is straightforward: privacy is a factor in monetization; security generally isn't.

os384's design addresses all of the above. Among the relevant properties:

- Channel participation requires no phone number or email — there is no linkable identity.
- Public key identifiers are unique per participant per channel, providing unlinkability by default.
- All communication is end-to-end encrypted; key management is initially server-assisted, but Owners can take full control at any time.
- Participants can export and migrate their full channel state — keys, history, participant list — to another server or client whenever they choose.
- All parts are open source under AGPLv3.

## On Trust

There is no such thing as zero-trust communication. At minimum, you must trust whoever you're communicating with. More broadly: in a conversation with N participants, you need to trust all N−1 others.

When a third party provides the communication system, you need to trust at least one additional party — what we call the **+1 trust effect**. But that minimum is rarely the actual count. A "highly secure" messaging app on a smartphone means trusting the service provider, the phone manufacturer, potentially the mobile carrier, and the various layers beneath. Each is an additional attack surface.

Our objective is to minimize this trust creep. As a baseline, os384 separates the system into: offline CLI key and identity generation; a separate SSO service (deliberately run on a different cloud provider from the channel servers); backend channel servers; and a frontend UI that is by default a simple single-page web application rather than a native phone app. This separation means that more than one independent system would need to be simultaneously compromised to penetrate your privacy in a way we could not detect.

The goal is for the +1 effect to be as genuinely limited to "+1" as possible: if you trust us, you do not have to separately trust every underlying provider we build on.

But we also want to give you the ability to eliminate the +1 entirely. That is the intent of the "restrict channel" feature: the Owner re-generates keys that are distributed only among the conversation participants, after which neither we nor any of our infrastructure retains access to the conversation.

### Micro-federation

Beyond restricting key access, we want to eliminate — or put under your control — any remaining hidden trust dependencies. Our mechanism for this is **micro-federation**, sometimes also called *severability*.

Once a group is running under restricted (owner-controlled) keys, each participant holds in local storage the public keys for every other participant, plus the immutable public key identifying the Owner. If anyone sets up an alternative server, they share its address with the group. Each participant exports their keyfile, moves to the new server, imports their keys, and the conversation resumes intact.

The storage layer (shared files, photos, objects) is independent of the messaging layer: objects are addressed and encrypted based on their content, and can remain on the origin server or be migrated to a personal storage server as desired.

::: info Next: Overview
In the next section we will give a broad overview of how os384 is structured and how its parts work together. For a deeper look at what "sovereign computing" means in practice, see [Sovereign Computing](/sovereign-computing) in Core Concepts.
:::
