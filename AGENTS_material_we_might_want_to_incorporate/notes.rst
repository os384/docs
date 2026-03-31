=====
Notes
=====

.. _Note_1:

Note 1: The "Ready" Pattern
---------------------------

The idea of the ready pattern[#f2302]_ is to allow objects to be created
immediately (synchronous instantiation), but allow for aspects of the
initialization to be asynchronous and to manage that (eg some getters and
methods might be fine right away, others not).

Here is essentially how it works:

   .. code-block:: javascript

      // the object per se is created right away
      const obj = new SomeClass()

      // you can call any method on the object, but it will throw an
      // exception if that method (or getter) requires the object
      // to be finished setting up
      obj.someMethod()

      if (obj.readyFlag) {
         // or you can explicitly check if an object is ready
      } else {
         // and if not, perhaps do something else
      }

      obj.ready.then((obj) => {
         // or you can set up what should be done when the object is ready
      })

      // or you can just create and block, but note that this requires
      // the code to be in a context that allows it
      const instantObj = await newSomeClass().ready
      

That's the basic model. Creating an object is not a blocking operation,
but you can check if it is ready or not, and if not, you can either
wait for it to become ready, or you can move on and do something else.
If you call a method on an object that is not ready, it will throw an
exception.

The "readyFlag" value is set to true when the object is ready, and the
"ready" promise is resolved when the object is ready.

Internally (inside lib384), part of this pattern is done by the
ready decorator, allowing things like getters to be succinct:

   .. code-block:: javascript

      @Ready get privateKey() { return this.#privateKey }

This will automatically protect the getter from being called before
the internal state is ready, which in turn allows users of the library
to code more aggressively.


.. _Note_2:

Note 2: Browser connectivity
----------------------------

Unfortunately, browsers at the time of writing (February, 2023)
simply do not have a good way of checking network status. Currently
it comes down to this:

* You cannot use ''XMLHttpRequest()'' or ''fetch()'' to "ping"
  a server without it being noisy: for example, Chromium insists on
  complaining (in red font) about ''ERR_CONNECTION_REFUSED'' in the
  developer console, no matter what you do in your javascript code.
  The only way to turn that off is change default settings in the
  browser developer tools setup.

* You cannot use ''navigator.online'' in all cases, because the
  browser doesn't consider a local server (on the same computer)
  as a "server" per se, for this purpose, even though you can
  connect to it.

It would be nice if there was a simple api to check connectivity
to a server or an IP address.

On a per-channel-server basis, the `ChannelApi <classes/ChannelApi.html>`_ will
generate events, and provide a status value, to signal connectivity.
This will likely be a close proxy to network connectivity.


.. _Note_3:

Note 3: Localhost, CORS, and other fun things
---------------------------------------------

The browser has a concept of "same origin" policy, which means that
a web page can only access resources on the same server, or on a
different server, but only if the server explicitly allows it.

This plus some other issues adds up to these constraints:

*  If you want a static (local) web page, e.g. a resource of type
   "file://", then it CANNOT load other resources locally - such as 
   a library (eg jslib itself). This is a security feature of the
   browser, and it's not likely to change.

       
      

.. _Note_4:

Note 4: Sequence Diagrams
-------------------------

In various places we will use sequence diagrams, so here's a brief
introduction on how we use them:

.. seqdiag::

    seqdiag {

      default_fontsize = 18;  // default is 11
      default_note_color = lightblue;
      activation = none; // Do not show activity line
      span_height = 20;  // default value is 40

      edge_length = 300;  // default value is 192

      A -> B [label = "This shows a request of some sort"];
      B ->> A [label = ".. and this is the reply"];
      B -->> A [note = "Dotted line means the\nreply is optional"];
      A -> A [note = "Local Storage"];
      A --> B [label = "This is something that MIGHT happen"];
      A => B => C [label = "This asks 'B' to get something from 'C'"];
    }

Note that the "solid" arrowhead is something initated, and if there
is a regular arrow immediately after then, that is the reply.
If the line is dotted, it's optional - an optional reply, or
an event that "might" happen. 

.. _Note_5:

Note 5: Static Apps
-------------------

In the plan and the design, but not finalized, is the intent to
provide an open source, static, single-html-page web application
version of the client. We refer to this as a "local client" and also
“static client”. This would allow any user to join any channel by loading
from local storage a static page, then loading a previously exported
set of keys, and join any channels detailed in those keys.

Also to be implemented is support for full export of all messages, in
a manner that can be synchronized (merged) upon joining any other
server (see :ref:`Stand-Alone Server <personal_server>`). UPDATE: this
now works!

An important use case is for participants to always be able to join a
channel (starting with the first time) by copy-pasting the channel name and
server address into the static client, and thereby have greater
confidence that the keys they’re using were truly generated locally.

A perhaps more obscure use case is the option for participants in a
channel to use local clients as a part of the strict locking-down
process, to account for any possible combinations of compromised
clients amongst any of the participants. This process is currently
under design. UPDATE: this is almost fully in place!

A simpler, likely more common, use case is a channel with a small number
of participants, where the owner has locked the channel, and all
participants including Owner have exported their respective sets of
keys. Then, they should *all* be able to rejoin the channel, from
respective systems, all loading from static files.

Below is a demonstration that current design works for this usage
model. It shows connecting straight to a chat channel endpoint from the
command line, using ‘curl’ for API endpoints and ‘wscat’ for websocket
connection. Ergo, users can script their own tools. We believe this
approach remedies many of the historically observed problems with any
web-based UI. [#f041]_  was largely addressed by development of the
subtle.crypto standard )

.. image:: /static/curl_example_01.png

.. _Note_6:

Note 6: Group Security
----------------------

For a number of security-oriented messaging apps, the "group" aspect
has been a challenge. See for example:

* More is Less: On the End-to-End Security of Group Chats in Signal,
  WhatsApp, and Threema
  https://eprint.iacr.org/2017/713.pdf

* (A number of Wired articles, to be added)

* Attack of the Week: Group Messaging in WhatsApp and Signal (blog) -
  https://blog.cryptographyengineering.com/2018/01/10/attack-of-the-week-group-messaging-in-whatsapp-and-signal/

The Signal app and protocol being the most common, we’ll comment in
relation to it’s design. The group chat capability was design while
moxie0 was still with Open Whisper. [#f036]_  Some issues:

* The "every client broadcasts" nature of group communication is still
  going through the Signal servers; this leaves enough metadata
  available (whether collected or not) to easily reconstruct group
  membership, and in addition, because of the authentication model,
  all the phone numbers of participants. Even though the server
  “notionally” doesn’t know group membership (there is no DB that
  explicitly tracks it), the data necessary is unavoidably generated
  in the normal course of the service. [#f037]_  Anonymity bestowed
  in principle by the broadcast model does not in fact exist if the
  service has a monopoly on delivering the messages.

  * Our design in contrast unashamedly sets up a websocket addressable
    worker to receive and re-transmit messages. This in fact puts
    control at the hands of the client with respect to how it connects
    to the server - it can "pop up" from a VPN or ToR or any manner
    that allows it to connect.

* … next point was about random number generation … took a while to
  figure out actually entropy in Signal groupId … in the end I think
  their 2014 generation was just 31 bits, namely Java’s max integer
  value (signed 32 bit) .. new system is 128, but it’s generated in
  the client, so that’s not super great, more on that soon ...

.. _Note_7:

Note 7: Serialization (Payloads)
--------------------------------

A classic problem with Typescript/Javascript is the limited serialization
support that's included. JSON is used widely but lacks support for many modern
Javascript data types. os384 has it's own mechanism and format:[#f039]_

* `assemblePayload() <modules.html#assemblepayload>`

* `extractPayload() <modules.html#extractpayload>`

We refer to them as "payloads" since (de)serialization is typically done
in the context of a "wire" (hence the format is sometimes referred to 
as "wire format"). os384 uses this for most API calls, messages, most
stored data, etc.

os384 payloads always start with hex "AABBBBAA" to facilitate hex editor
debugging of complex data structures (eg a common programmer error is
to forget to package or to double-wrap).

Nota bene: to the best of our knowledge, these utility functions can
handle any conceivable, legal Javascript data structure.

Any Javascript object that has a ".toJSON" method will be serialized
by first calling that function, then proceeding with the "native"
os384 serialization on the results.

If there are any promises in the data structure, trying to assemble it will
throw an exception.[#f2303]_ 

The format is far from optimal in terms of compactness; we have
initially prioritized correctness. Longer term we may align the design
with CBOR (RFC 8949).

Images are generally stored in a binary serialized format. We may also
use this format for binary protocols (web socket), where a more
correct term might be "wire transfer format."


|
|

------------

.. rubric:: Footnotes

.. [1] (test) This is the closest to DM (Direct Message) that the system
	   allows, since one constraint is that any communication must
	   include a responsible Owner.	   

.. [2] (test) If the whisper is initiated by the guest. If whisper is
	   initiated by the owner, the key derivation uses the private
	   half of <channel>_ownerKey and the public key of the
	   guest. The derived key remains the same in both cases.

.. [3] (test) In exchange for possible weaker security, since now the
	   Owner needs to keep track of their key files.

.. [#f039] Arguably we could have used BSON https://bsonspec.org/ or
   Protobufs but they seemed heavy-weight and complex for our
   basic use case, notably we have no need for multi-language
   support.


.. [#f2302] Unfortunately, we have lost track of where we first heard of this
   pattern. The originator might not have called it the "ready pattern". If you
   know where this comes from, please let us know. We did not invent it.

.. [#f2303] The serialization is synchronous, so it cannot await any results.


	            
