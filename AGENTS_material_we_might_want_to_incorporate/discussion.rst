=================
Discussion Topics
=================

A few topics don't easily fit in elsewhere. Those are here.


----------------------------------------------------
Deleting / Recording / "Autodestruct" Message Models
----------------------------------------------------

Some chat services make various claims about supporting messages to be
deleted, not downloadable, not recordable (even against screenshots),
etc.

To make a long story short, this is simply not true: it is not
something any chat service can geniunely promise. Period. The only way
to truly accomplish this would be to provide a tightly integrated
hardware, operating system, and application, from a single vendor. In
which case you now have to completely trust the vendor.


-----------------------
The thing about "Trust"
-----------------------

Allow us to elaborate. There is no such thing as zero trust
communication, outside of the realm of your own dreams, at night, that
you promptly forget upon waking up. Any communication with another
party, at a minimum you have to have some trust for that other
party. To generalize, if you are in a conversation with N participants
(counting yourself), you at a minimum have to trust all the others
(assuming you can trust yourself).

A communication system that is provided to your group by a third party
now requires you to trust at a minimum one more party (what we call
the "+1 effect"). But that minimum is not likely to actually be the
case. For example, if you’re using a “highly secure” messaging system
on your smartphone, you’re now needing to trust both the service
provider as well as the phone manufacturer. In all likelihood, in both
“camps” (app and phone), several more. [#f102]_

Our objective with this design is to minimize these "trust-creep"
effects. As baseline, we split the system into (offline) CLI key and
identity generation, a separate SSO [#f103]_ to manage
public channel keys and Owner information, backend servers on Cloudflare,
and the frontend UI by default *not* a phone “app” but a simple
single-page web application. This separation is intended to make
ourselves the only *single* point of failure: more than one of these
separate systems would have to be compromised to penetrate your
privacy *with us knowing about it*.

That last part is key. The point being, if you trust us, you do not
have to trust *all* these underlying service providers that we use to
build a working system. Our objective is for that "+1" effect to be as
truly limited to “1” as possible.

But we also want to enable you to eliminate the "+1". That is the
intent of the “restrict channel” feature: re-generate keys that are
re-distributed between just the parties to the conversation, after
which we have no access to it, nor any of our underlying system or
service providers.

.. _micro-federation:

But we also want to eliminate - or at least put into your control -
any other hidden trust functions. Our key to that is to allow for an
established chat to "leave" - we call this :term:`Micro Federation`
and we've heard it referred to as *severability*:

Once a group is up and running, restricted, and the Owner has
"rotated" (taken control of) their keys, each participant will now
have in their local_storage the public keys for each and every other
participant, as well as the locked-in public key of who is Owner. If
somebody hosts a server, they just need to message (securely) the
address to that server, and everybody can “export” their keys and
settings, go to that server, “import” their keyfile, and they’re all
back. [#f101]_

This is currently supported as the "download" function in all channels.
To "upload", you need to have permissions to create a channel on a
channel server (such as by being the admin of a personal server).

The storage components (shared files, photos, etc) are orthogonal
to the chat element: objects are named based on their contents,
and are encrypted etc, so can be left on an origin server, or
also migrated to a personal storage server, as desired.

.. _end-to-end-encryption:

------------------------------------------------------
What do we (and others) mean by End-to-End Encryption?
------------------------------------------------------

E2E (end-to-end) encryption means that only the (two) parties at each
end can read anything being transmitted, and nothing and nobody
in-between.

E2E is a little reminiscent of "zero trust" systems. In a literal,
purist sense, there is no such thing. You would have to prove a
negative: that nobody has tampered with your iPhone for example, or
that your messaging app doesn’t have malicious code specifically
targeting *you* for intercepting messages, etc.

Absent a clear community consensus about the terminology, we will
distinguish between "conventional" E2E and “true” E2E. Neither can be
defined in a completely clear manner, especially the latter, but we
believe an earnest attempt is better than glossing over.

Conventional E2E is a communication system that, *assuming you trust
and believe statements regarding the implementation of all it’s
parts*, is secure in the sense that only the two parties can (ever)
read the messages.

Serious providers of secure messaging make no bones about this. For
example, Telegram goes to some length [#f104]_ to
discuss the various trade-offs; notably they gloss it over *slightly*
for new users by talking about "client-to-client" encryption, but the
most nominal effort to inform yourself from their documentation will
make their trade-offs clear. This, we feel, is appropriate for a
product that aims at a mass market.

Others are not so forthcoming. When Apple’s iMessenger protocol design
and features were first introduced and discussed in detail in 2013, it
was quickly pointed out that at the end of the day you still needed to
trust Apple. [#f105]_

To which the corporate giant’s spokesperson helpfully stated "The
research discussed theoretical vulnerabilities that would require
Apple to re-engineer the iMessage system to exploit it, and Apple has
no plans or intentions to do so." Which in English means, yes, you
still need to trust us. The underlying limitation is (as almost
always) key management.

The other category of common security weakness in even the most
earnest efforts at privacy and security is the need to ultimately
trust the system being used - such as the website/browser/computer or
the app/phone combos. If any of the key parts are compromised, even if
temporarily or inadvertently (such as by a bug or security problem
that is legitimately not known to the parties assembling the parts),
then somebody can read your messages. We’ll call whatever you’re
running your communication on, your ‘platform.’

Other than those two areas, we posit that the rest is a small matter
of applying best practices - selecting proper cryptographic
algorithms, subjecting protocol designs to careful third party review,
being open and transparent with the broader community about the
design, etc (which by no means implies it’s easy to do).

These and other experiences prompt us to define conventional E2E
something like this: it is secure communication between each end (two
parties), assuming neither that the necessary key management solution
nor your client platform have been compromised or are being operated
maliciously.

Next, we define "true" E2E as an approach that tries to accomplish
best practice in these two areas. For example, if you can separately
verify the keys in some manner, then that addresses (in part) concerns
on key management.

More tricky is to trust the client platform. For example, any
web-based system relies on a web server to deliver the application,
making your client environment susceptible to any code injected from
the server. [#f106]_  This limits the efficacy of key
verification as per above - since the app was in control of the
private side of those keys prior to the verification. An open source
approach on the client software helps, but not if it cannot connect to
the core (global) service, and not if it doesn’t have an open source
ecosystem (including servers). [#f107]_

E2E is about security, not privacy. For example, any messaging system
that requires you to use a phone number to authenticate is
*emphatically *not private. Any messaging system that uses the *same*
cryptographic credentials (such as a public key unique to you) for
every separate conversation is not private either. [#f108]_ Any system
that depends on some other system (such as SMS or notification) for
any part of the lifecycle of a conversation, is not private. Etc. The
simple answer why it’s easier to acquire *secure* communications
rather than *private* communications, is that the former is generally
not a factor in monetization, the latter is. [#f109]_

Our design attempts to address all of the above; here’s a partial
recap (not all of these items are implemented yet):

* A channel name is a global, unique, and persistent URI.

* You need to be authenticated by the server to *create* a channel, and
  thus be permanent Owner of it, but you’re free to "pick up and
  leave" with the full conversation, including the set of participants
  and keys, at any time.

* All communication is end-to-end encrypted, initially with key
  management provided by the server, but optionally the Owner can take
  over key management.

* Public key identifiers are unique for every participant and every
  channel.

* Anybody can join and become a participant using just the channel name
  (and server).

* Directory of channels and "contacts" are kept in client local storage
  by each participant. This state can be exported to another browser
  or device, bringing your identity *for those channels* with you.

* A set of channel, Owner, and participants, can rotate their keys and
  disconnect from the server of origin, taking direct control of their
  keys.

* The client platform is default provided by the server, but a static
  (locally hosted) html file can serve as client as well.

* All the parts will be open sourced and we will publish and maintain
  this design doc.


---------------------------
The "Insider" Privacy Model
---------------------------

If you are not familiar with the extent to which you **lack** privacy
and protections in currently available messaging systems and services,
e.g. if you are not well-informed about online security and current
practices of law enforcement and the courts, then the following
discourse may strike you as an **incursion** and **restriction** of
your privacy. That is not true. Most "big tech" services will simply
not tell you the measures and processes that they have in place, on a
daily basis, to collaborate with law enforcement. Many “privacy
startups” won’t tell you who owns or controls their company, leaving
future use of any collected data (especially metadata) unprotected.
[#f110]_

Many services are based outside the US or the EU, making any policy
assurances on their websites unenforceable. You should know that in
the face of law enforcement requests or subpoenas, any privacy policy
more or less does not apply. Instead of reacting to legitimate law
enforcement needs as an afterthought, we have determined that the best
way to maximize your protection is to talk about the challenges
explicitly, walk you through them, and explain how we are designing
our system to accomplish as balance.

Implicit in this design is a notion - which might be an innovation -
of the "Insider Privacy Model."  A practical communications service
requires some minimal mechanisms for law enforcement to combat illegal
usage. There are bad things out there, and a broader, liberal, society
will accept dark corners of any relevant scale.

The restricted channel with user-controlled keys is perhaps the main
accomplishment of this overall design. Once this is set up and
running, only the Owner and approved participants can access any of
the content, including shared images (and documents), even if the
service managed by us is still providing connectivity and
storage. This is sometimes referred to as *digital sovereignty*,
namely, as a user you should be able to understand, and ultimately
take control of, any code that is controlling your communications.

In principle, the service provider (ourselves as baseline) can assist
with (legal) wiretap requests directly as long as the channel is not
restricted. If the channel is locked down *while *some form of wiretap or
surveillance request in a channel is active, then the generated keys
could *in principle* be captured by some form of injected code, but we
will enable and document sample strict procedures that an Owner of a
channel can take to stop even that (or at least detect it).

Ergo, a properly locked channel cannot be wiretapped without help of *at
least one participant* in that channel - not by any combination of
ourselves, any and all infrastructure and cloud service providers, and
law enforcement, to the very best of our design ability.

This (naturally) leaves key management with the participants, and the
trust basis as well. As long as the private keys of all the
participants are kept safe, nobody can read the contents of exchanged
messages. They are all created locally. Once a channel is locked, only
the Owner private key can authorize any administrative functions, such
as approving a new participant. [#f111]_

This brings the question of, in a (fully) legitimate law enforcement
request for assistance, that we (voluntarily and according to our
principles of maximum privacy) agree with, what measure can be taken?
What if something truly horrible is going on? Obviously the channel can
be shut down [#f112]_ and in addition any associated membership service
can be suspended. But is there a way to tap into the conversation?

Yes, but law enforcement would need an insider - they would need the
assistance of somebody in the group, or figure out a way to get
somebody added to the group that will help them. This is what we refer
to as the "Insider Model" of privacy. For a serious enough situation,
law enforcement will have both the resources and the capability to
accomplish this.

We feel that this approach serves as a practical ‘check’ on the
seriousness of any supposed illegality. It also deliberately attempts
to align any effort needed for *digital *surveillance with *physical*
surveillance. It simply should not be simpler and cheaper - by orders
of magnitude - to run surveillance on virtual conversations than it is
for in-person conversations.

Furthermore, this design protects an established set of participants
in a group from being disconnected from each other - *resilience* -
something related to, but independent of, security and privacy:
defense against attempts to interfere with, or stop, a conversation
(independent of access to content). All the necessary keys and
identities are contained in the (distributed) set of key files amongst
the participants. The system is naturally capable of fragmentation
(:term:`Micro Federation`) we aim to make it relatively simple for a group
to set up a server, ‘reconnect’ various keys, re-populate messages,
and get back on track with any ongoing conversation.

We also plan to support *chunking* a conversation, a thread, as a
single object, that can be shared and untangled for reading - with
authorship keys retained for any future validation.

The design also has an inherent nature of the right to *disassociate*
yourself from a conversation. Any non-Owner participant can just
delete their keys, and that’s it: other participants can read their
old messages, but new ones can’t be written, and nobody can come along
and impersonate the original author - there is no ‘account’ that can
be locked or taken over. [#f113]_

An analogy here might be: if a group of individuals meet to discuss
something illegal in the real world, then if law enforcement really
cares, they’re likely to not only be able to recruit or insert an
informant with a recording device, but also to be able to execute
simultaneous search warrants against multiple participants afterwards
(phones, laptops, notepads). This is appropriate: it creates a natural
counter force (expense and effort) against trivially pursuing
surveillance, whether legal or not, against large numbers of groups -
notably broad "fishing" expeditions.

What we have pursued in this design is to accomplish something in the
digital domain that is more similar to "real world" conversations that
existed before all of this marvelous technology:

* to make it easy for you to "get together" conversationally,

* decide for yourself who is in the conversation,

* share any information you like,

* and be secure in the knowledge that you cannot easily be spied upon



--------------
Accountability
--------------

A brief note on accountability needs - they are rooted in the following deductions:

The Institute’s Mission is to "inform and empower Members
to defend their privacy and protect their information," which
implies:

* We want to help as *many* people as possible

* We want to help them in a *significant* way

* We want to help them in a *sustainable* way over a long period of
  time

This leads to two directions:

* We want to develop *and host* a service. 

* We want to *empower* individuals to run equivalent (and interoperable)
  service(s), either for themselves personally, or to host a paid-for service.
  We are doing this by developing OS384 technology as open source, and without
  strange footnotes, restrictions, or gotchas.

With respect to our own hosting, we arrive at a few principles
that relate to any Members:

  * We cannot allow illegal activities on servers we host. A liberal, democratic
    society will not (and cannot) accept communication and collaboration systems
    that are used for *clearly and unambiguously illegal* activities. [#f130]_
    [#f130b]_

  * We need to *pick one legal jurisdiction* - it’s beyond the scope of this
    summary to walk through the exact details of this consequence, but
    essentially what we find is that any attempt to be "global" will constrain
    our ability to protect or help Members and easily ends up becoming lowest
    common denominator. [#f131]_ [#f132]_ Since we are a US-based non-profit, we
    are at a minimum subject to US law, ergo, we select US (and only US)
    jurisdiction over us. [#f133]_

  * The minimum, practical, amount we need to know about you is (a)
    you’re Human and (b) you are a United States resident (that you
    are subject to - and only subject to - our single jurisdiction).

    




.. [#f130] Note our emphasis on clearly and unambiguously illegal:
	   it’s impossible to provide a clear definition, but we
	   will err on the side of privacy. Social norms not
	   encoded in applicable law are not enforced by us.

.. [#f130b] This is our statement when *we* host a server. We
	    are not placing any restrictions on how and where
	    anybody else can host servers.

.. [#f131] For example, a driving force of the internet industry to
	   identify who you are is actually driven by needing to
	   know where you are and what you are (robot or
	   human). By constraining to United States residents, and
	   selling memberships only through person-to-person
	   transactions, we can represent on behalf of our members
	   viz any online services that anybody connecting through
	   our systems is by definition a human, US resident, with
	   appropriate rights, which we in turn will aggressively
	   fight on behalf for.

.. [#f132] This is in contrast to typical web or mobile apps, since
	   they are simply maximizing advertising reach.

.. [#f133] This also ties into micro-federation and our intent to provide
	   FOSS versions of public (multi-owner) server code as well.
	   As an end-user of a chat / file share service, you should be
	   able to "pick up and go" and bring conversations and files
	   to a different jurisdiction. 

.. [#f134] Any complete system will need a separate authentication
	   model for “Owner”. In our first implementation, for our
	   version of the service only Members of the Privacy.App
	   service can be Owners. If you run the system yourself, you
	   will need some mechanism for Owners to “log in”; details
	   later in document.

.. [#f101] Note: once an Owner “rotates” their keys, the identity of
           the Owner is locked-in for every participant - at their
	   end. It cannot be changed, the participant clients will no
	   longer accept “Admin” requests unless signed with the new
	   Owner keys - which neither the original server (that
	   created the channel) nor the new server has access to. This
	   allows an (intended) extreme form of resilience - the group
	   can continue to leave any new server, or re-visit any old
	   server, with the same set of keys, and be able to continue
	   a conversation on any server in any order, without any of
	   those servers ever being able to read any parts of the
	   conversation. Owner can be “re-rooted” in a new “home” by
	   simply copying their rotated private key)

.. [#f102] For example, the CPU manufacturer for that phone, if it’s
	   not fully integrated. The underlying DNS provider might be
	   a dependency, not to mention the datacenter operator that
	   the messaging app is using for their servers. The
	   notification system for the phone app is probably uniquely
	   identifying you. Etc.

.. [#f103] That we recommend you do NOT run on Cloudflare. In our case
	   we run it on Azure.

.. [#f104] https://telegram.org/faq#q-what-is-this-39encryption-key-39-thing

.. [#f105] https://blog.quarkslab.com/imessage-privacy.html

.. [#f106] For example, this is a (fundamental) limitation of a secure
	   email service that provides a web interface, such as
	   ProtonMail. See references for an analysis, but briefly,
	   whereas malicious code in an app delivered across an app
	   store will at least leave a trail with the app store
	   provider, malicious code from a web server (or an
	   intermediary) can be both targeted and fleeting, removing
	   itself when done.

.. [#f107] For example, the Telegram FAQ has stated "Our architecture
	   does not support federation yet" since
	   July 2014. Federation would imply losing control over much
	   of the meta-data.

.. [#f108] Since the meta-data implied by tracking what public keys
	   are talking to what other public keys constitute your
	   conversation pattern, both as an individual and, in
	   particular, a growing graph of information about who talks
	   to whom, for how long, and when, and in what order are new
	   connections made, etc etc. These were concerns that were
	   less well understood in the past.)

.. [#f109] If you are using a messaging product that’s free to use,
	   does not worry much about how many images or documents you
	   are storing for free, but somehow wants to know who is in
	   your contact list and who you are talking to … well then
	   you are probably the product. You could ask their owners to
	   see what their business plan is. Assuming you can figure
	   out who the controlling owners are. Or where.

.. [#f110] As a general rule under US law, no commitments from a
	   service provider is enforceable against a new company that
	   acquires them, or a third party who has access to or
	   licenses their data. And contrary to popular opinion,
	   (stock) ownership is not the same as control, for example
	   most startups that have received investment money will be
	   subject to “investor agreements” regulating board
	   composition.

.. [#f111] Or change of keys - to rotate keys you will need the
	   current Owner ones. This means if the Owner loses their
	   private key for a locked channel, then there is no simple way
	   to reset or recover access, but the participants can always
	   simply communicate to arrange for a new channel to be
	   created.)

.. [#f112] Even that, not necessarily - a server can only delete a
	   channel in it’s own database. The Owner may have moved the
	   channel to another server, or themself set up a server. Any
	   participant that has downloaded their message history will
	   still has access to it using a static client.

.. [#f113] Note: the Owner who created the channel remains accountable,
	   as long as the (SSO) service is managing their keys. This
	   creates a deliberate safeguard: if the channel is co-opted by
	   participants to some purpose that’s not ‘ok’ with the
	   Owner, including any illegal activity that the Owner wants
	   nothing to do with, then the Owner can close the channel. The
	   conversation can only be migrated with permission of the
	   Owner. If the other participants want to move the
	   conversation, one of them needs to create a new channel, at
	   which point they are the new (accountable) Owner. This
	   provides a point in time for an Owner to disavow a
	   conversation should they choose to do so: close the channel
	   (so no further activity can take place) and, optionally,
	   report any issues of concern to the hosting provider. This is to allow a
	   natural, human behavior: if you’re a guest (participant)
	   and you don’t like where a conversation is going, you can
	   leave. If you’re the host (Owner), you can kick anybody out
	   that you want to, and if it comes to it, you can kick
	   everybody out of your house.



