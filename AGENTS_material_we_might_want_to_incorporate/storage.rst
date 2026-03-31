.. _storage:

================
Storage (Shards)
================

* `ObjectHandle <interfaces/ObjectHandle.html>`_
* `SBObjectHandleClass <classes/SBObjectHandleClass.html>`_
* `SBObjectMetadata <interfaces/SBObjectMetadata.html>`_
* `SBPayload <interfaces/SBPayload.html>`_
* `SBStorageToken <interfaces/SBStorageToken.html>`_



BEING REWORKED
--------------

Data Dedup + Encryption + Storage:
----------------------------------

Any data is stored as ‘objects.’ An :term:`object` is a specific construct that
is particular to this design. Objects are ultimately stored in :term:`KV_global`
with the following information:

.. _object:

* Their full name (also the :term:`KV_global` key). The name is a 512-bit
  string constructed in two halves, in two steps. The first half is
  the first half of the SHA-512 hash of the original (unencrypted)
  contents, the second half is a SHA-256 hash of (final) encrypted
  contents.

* Nonce and salt used for the encryption. These can be accessed using
  just the first half of the full name (prefix search).

* Contents, which is the encrypted version of the padded form of the
  original contents.

* A random 16-byte value, the :term:`verification`.

* A random 48-bit value, the ‘version_id’ which might be used in the
  future for version control on files

Starting from an image (or some other arbitrary data), the above is
accomplished as follows:

* The client generates the SHA-512 hash based on original data (eg
  image). It sends a ‘request to store’ query with the first half of
  this hash (the ‘partial name’); it will eventually receive a 12-byte
  nonce and a 16-byte salt.

* While waiting for this, the client constructs the ‘shared image’
  message, with the :term:`thumbnail`, and forwards data and the first half of
  the SHA-512 hash for the compressed data (preview) and original data
  (full image), and sends the message.

* Next, the client makes a fetch request (once each for the preview
  and full :term:`object`) to :term:`KV_global` with the first half of the full name
  of the file. When the :term:`KV_global` receives the ‘request to store’
  query, if it’s a new object, then it generates random new nonce and
  salt and stores those with the partial name (it doesn’t have the
  full name yet); if it’s not a new object, it returns previously
  generated values. [#f032]_

* The client prepares the data by padding it to be almost exactly the
  size of the nearest exponent of two (2) larger than its actual
  (possibly new) size, no less than 128KB (this is the "target size"
  mentioned above). Regardless of image, the resulting ‘preview’ thus
  ends up appearing to be one of only six different sizes. [#f033]_
  The padding is done using ‘bit’-padding, specifically, the length is
  padded only in increments of 128 bits [#f042]_  up to one block
  *less* than the target size - if the target size is on a 128-bit
  boundary, a full 128bits are left. ‘Bit’ padding is 0x80 followed by
  zeroes. The last thus added block is then truncated by 4 bytes (32
  bits), and the length of the original data is stored.

* Next the client encrypts this padded block with a key derived from
  the entropy of the second half of the above first hash (using
  PBKDF2; 100,000 iterations; SHA-256), with the nonce and salt
  returned by the previous ‘request to store’ query.

* Next the client generates a SHA-256 hash based on the encrypted
  block (which after encryption should be on a perfect exponent-of-2
  boundary) and concatenates with the ‘partial name’ from earlier to
  form the ‘full name.’

* The client then makes API calls (once each for the preview and full
  :term:`object`) to the :term:`KV_local` with the final size value (in cleartext) of
  the object (preview/full) (rounded up as per below); the channel server
  inspects and approves the size (or not).

* If approved, the :term:`KV_local` makes a fetch request to the
  :term:`Ledger Backend` to generate a token for the requested
  size. The Ledger Backend returns a token_id. The :term:`KV_local`
  then encrypts this token_id with the public half of the
  :term:`LEDGER_KEY`. Finally, the :term:`KV_local` returns the hash of the
  token_id, the encrypted token_id and the hashed roomId as the
  storage token back to the client. [#f034]_

* The client then requests this encrypted :term:`object` to be stored under
  the full name provided, including token approving storage usage; in
  reply it will receive the 16-byte :term:`verification`. This encrypted
  object is sent asynchronously to the (non-channel) worker API.

* The client then generates a control message that contains the full
  name of previously shared (:term:`thumbnail` only) image together with the
  :term:`verification` as well as (again) the storage token. This control
  message would be sent with the same encryption layers as the
  original message containing the thumbnail.

* When the backend receives the object, it independently generates the
  same second hash based on the encrypted object to verify the
  integrity. It then verifies the storage token is valid (i.e. has
  been created by :term:`KV_local`, hasn’t already been spent and the size of
  the object sent to be stored does not exceed the size stored in the
  ledger) by making a fetch request to the ledger backend. If valid,
  the :term:`KV_global` stores three separate entries in the
  RECOVERY_NAMESPACE ("D3") -

  * <hashed_room_id>_<encrypted_token_id>

  * <hashed_token_id>_<image_id>

  * <image_id>_<hashed_token_id>

* If this full name of the object requested to be stored exists in its
  storage, then it can discard the received data, and return the
  stored :term:`verification`. If it doesn’t, it creates an entry, with the
  *full* name as the key, and saves the encrypted object [#f035]_
  together with nonce and salt, generates a random 48-bit version_id,
  generates a random 16-byte verification, and returns that.

When a client wants to open a preview, the following happens:

* The :term:`thumbnail` needs to have been matched with a control message with
  the full name and the final :term:`verification` returned by a previous
  storage.

* The client requests to read the object based on the full name with
  the :term:`verification` token.

* When the client receives the (raw) contents, it will also receive
  the nonce and salt, it applies the stored (secret) key, and decrypts
  and displays the object.

* The backend will only reply if the full name corresponds to an
  entry, and the :term:`verification` number matches the stored verification
  number..

* An honest client will also confirm that the partial name (and key)
  matches a regenerated SHA-512 hash of the decrypted object, and
  signal in the UI (such as a red border) and possibly ‘report’ to the
  backend that the object is suspect.

A few comments that follow from the above process.

* This design retains the ability to de-duplicate any stored binary
  data, without having the ability to inspect contents.

* The padding method obscures the precise length of any data,
  complicating any brute force attacks against contents of a
  compromised server: all stored objects in the same ‘bucket’ of size
  would have to be attacked.

* The chained hashing makes it impossible for a client to fake binary
  contents: since the second half of the full name is a hash of the
  encrypted contents, the backend can check for consistency - the
  computational difficulty of generating a file to match a second half
  (equivalent to a pre-image attack) is high. A client can obviously
  store random data, but that’s immaterial: what’s important is for
  the client not to be able to design a hash collision in the full
  name.

* A client can obviously avoid duplication by some manner of modifying
  the image, even trivially. But this is no different from any other
  encrypted storage.

* The client can be dishonest about the first half of the hash, but
  that also does not enable any control over hash collisions.

* Dishonesty in a client in constructing the full name will stay with
  the image sharing message, with a certain probability of being
  detected down the road.

Regardless of level of misuse, the "insider" privacy model (discussed
at the end of this document) will still be in force. Any participant
to any chat, who has access to decrypting a message with the full key
to the object, can report it, or save the information for future use,
as well as identify if the naming has been tampered with. If we
receive a report on an object with the missing pieces of the key, we
can decrypt the object in storage, and both verify whether it is
correctly reported content, as well as verify integrity, such as
confirming (post facto) that the client was breaking the protocol. At
that point, we can overwrite the object per policy, and re-encrypt
with the provided key information, such that any future access using
the dishonest or manipulated object name will not yield the original,
but just the take-down notice. In other words: the design deliberately
allows for the party operating the server to enforce their content
policy, but does not allow them to pre-emptively scan or review any content.

Another scenario is that a user shares with themselves, or in some
other manner uses the service as a strongly encrypted storage, and
acts maliciously. But this is no different than if they were to simply
encrypt locally and only upload encrypted data to any cloud storage.

.. _ledgerserver:

Storage Ledger Server
---------------------

A core challenge in providing long-term storage of files [#f044]_, is how
to accomplish the following (a more formal treatment is :ref:`here <ledger_formal>`):

* The system should be highly secure and private: contents
  at rest should be strongly encrypted, and not (easily)
  attributed to whomever uploaded, shared it, and/or
  downloaded it.

* Operating expenses. In a multi-user (multi-owner) context,
  the costs of respective total storage usage needs to be allocated
  to the correct party.

* The system should not allow tracing of who uploaded what (or even,
  preferably, when).

* The system should not allow tracing of who is sharing ("re-linking")
  any file.

* It should not be possibly to inquire whether a file
  exists on the system, e.g., it should not be possible to determine
  if anybody has at any time stored or shared a file.

* The system should be fundamentally capable of de-duplication: in
  other words, any file that is uploaded, should not
  require duplicate copies in back-end storage. This is essential
  for the economics of (highly) scalable cloud storage.

* It should be possible for administrators of a service to "take down" any file,
  that they determine violates their policy, including in particular the ability
  to take down clearly illegal content.

* Any file should end up with a 'name' that is globally unique, so that it will
  have the same identifier on any storage server. [#f045]_

This becomes a heavily parameterized problem.  This has been a major
challenge for us to solve. To our knowledge, nobody has solved this
complete set of requirements.

The design described above accomplishes most of these criteria,
but we have not addressed the cost-tracking (budgeting) aspect.


.. seqdiag::

    seqdiag {
      Ledger; Channel; Client; Storage;

      default_fontsize = 18;  // default is 11
      default_note_color = lightblue;
      activation = none; // Do not show activity line
      span_height = 20;  // default value is 40
      edge_length = 240;  // default value is 192

      Client -> Storage [label = "Request object identifier [1]"];
      Storage ->> Client [label = "salt, iv [2]"];

      Client -> Channel [label = "Request 'budget' [4]"];
      Channel --> Ledger [label = "Request 'transaction' [5]"];
      Ledger --> Channel [label = "<TID> (updates D1, D2) [6]"];
      Channel --> Channel [label = "<TID> [7]"];

      Channel -> Client [label = "magical token .. [8]"];

      Client -> Storage  [label = "do the actual store! [9]"];

      Storage -> Ledger [label = "check D2: spent? size? [10]"];

      Storage -> Storage [label = "Append to D3 [11]"];

      Storage -> Client [label = "verification [12]"];

   }

There is a lot to unpack in this diagram, bear with us:

First, there are four "account balances" involved:

**[A]** The budget of the total service.

**[B]** The current budget of the channel.

**[C]** The amount spent in total on storage.


'[A]' starts as the total budget for a service - let's say 100 TB for a
multi-user host. Upon creation of any channel, an initial balance of
(say) 1 GB is allocated to the channel, ergo 1 GB goes [A] => [B]. When a channel
"spends" this, it requests the ledger to transfer it from the channel's "account"
to the global storage [C].  (On a personal server this is much simpler:
the admin simply sets [B] to whatever on a per channel basis, and there
is no global [A] nor [C].)

The idea is that we step-wise anonymize parts of the overall transaction (namely:
store an object): generation of identifying information for the object is
kept separate from the path to receive permission to store that amount
of data, for example. You'll probably need to re-read this section
a few times to see how it all hangs to gether.

Second, there are three important datastores involved, "D1", "D2", "D3"
used in this process (not counting the actual storage of data):

* D1: LEDGER - separate server in multi-owner setup,
  internalized to the channel in a personal server setup.
  These keeps current "account balances" of everything.

.. _ledgerNamespace:

* D2: LEDGER_NAMESPACE - tracks spending of approved :term:`<TID>`.
  To spend storage space, you're "issued" a kind of token,
  which is simply a reference into D2, which in turn
  will track if it's been "cashed" or not.

* D3: RECOVERY_NAMESPACE - tracks details to allow for
  anonymous recovery - garbage collection - of revoked
  storage etc. This is a bit complex,
  but it's only relevant for multi-owner paid
  membership management, for a personal server you
  don't need to worry much about it.
  
Now we can untangle the diagram a bit (you can follow along in the code [#f046]_):

1. The client requests to store a :term:`file`. It generates the first "half" of
   the name, and sends it to the storage server. What it needs is help to
   "construct" the "true name" for the :term:`object`.

2. Storage server checks if the data exists already. Regardless, it replies with
   the assigned salt and iv to be used for the corresponding :term:`object`.

3. The client encrypts the full set of data and sorts out padding. The blob is
   ready to save, and client has the "true name" of the object
   (":term:`<FN>`:").

4. The client next requests from the channel server
   permission to store the amount of data needed. [#f050]_

5. The channel checks if it has budget: it asks the Ledger to "spend" storage
   bytes: it generates a transaction of class "token", with properties "size,
   random id, used", and asks the ledger for an identifier (":term:`<TID>`".

6. The ledger spends 'size' from the channel's budget ([B]->[C]), and generates
   :term:`<TID>`. The key details are the approved size, and if it's been
   "spent" yet. This is stored with a one-way hash in 'D2' - thus "h(<TID>)" If
   all is well and good, responds with <TID>. 

7. On a personal server, step 5/6 is done locally instead, self-generating a
   :term:`<TID>`.
   
8. The Channel now creates a special object, sort of a "token": ``<hash(<TID>),
   R(<TID>), R(h<TID>)>``. This bundle is encrypted (and padded), and returned
   with h(<TID>) to the client.

9. The client is now empowered to actually request the store to be done. It
   sends the "magical token" along with the blob of data.

10. Storage now checks with the Ledger ('D2'): the hash of the :term:`<TID>`
    ("h(<TID>)"), checks that the 'size' is correct, and "spends" it (finalizing
    [B]->[C]).

11. Storage now updates 'D3' with some special info: ``h(R(<channel>)_R(<TID>),
    h(<TID>)_<FN>, <FN>_h(<TID>)`` for offline recovery / garbage collection.
    (you can see the keys stowed away by ``handleStoredata()`` [#f048]_). The
    ``R()`` notation shows it has been encrypted by the :term:`LEDGER_KEY`
    [#f049]_ .
    

12. Finally, the storage server will generate a random :term:`verification`
    number - unique for every :term:`<FN>`. When the client receives it, it can
    *finally* construct the control message with all the details about the
    object, which altogether we loosely refer to as the :term:`manifest`. This
    is sent to all chat channel participants.

   
Various things to note:

*  The channel server manages it's own "budget"; you can think of it as a
   "bucket" or almost as a directory. On a personal server that you run
   yourself, you can modify this budget directly for any channel. On a
   multi-user service, there's a separate "Ledger Server" which manages storage
   budgets and accounting across all accounts and users.

* A new channel is initialized with an initial total budget - current default is
  1 GB. It can "independently" authorize messages and files up to that total
  amount. Once that's exceeded, then on a personal server you need to directly
  change the budget using the :term:`CLI`, on a multi-user server it needs to
  request more allocation from the :term:`Ledger Backend`.

* Note that in around step [5], neither the Channel nor the Ledger actually need
  to know *what* object is being stored, just it's size (which is padded to
  specific set of size options to further obfuscate correlation between specific
  objects and coresponding storage budget "spend").

* You can think of part of the transactions around :term:`<TID>` as a sort of
  local cryptocurrency, a "token" in the old-fashioned sense: it's a thing that
  can be "printed" by asking the Ledger to approve [B]->[C], and cashed in by
  "spending" it with the storage server ([C]).

* The :term:`manifest` can be used anywhere: command line, other clients, etc.
  There's two versions of it - one that is share with everybody, and one that
  includes the additional bit of information that enables future revocation of
  storage budget(s). [#f047]_


Somewhat Formal
---------------

For the purposes of this section, we will refer to any blob of data
as :math:`\mathcal{M}`. [#f201]_  Small messages (next section) are
referred to as :math:`\mathcal{m}`. [#f202]_  
Consider Alice wants to send :math:`\mathcal{M}` to Bob:

.. seqdiag::

    seqdiag {
      Bob; Alice; Storage;

      // defaults
      default_fontsize = 18;  // default is 11
      // autonumber = True;
      default_note_color = lightblue;

      // also available:
      // edge_length = 300;  // default value is 192
      // span_height = 80;  // default value is 40
      activation = none; // Do not show activity line
      span_height = 20;  // default value is 40

      Alice -> Storage [label = "[1] First hash"];
      Storage ->> Alice [label = "[2] Encryption params"];
      Alice -> Storage [label = "[3] Second"];
      Storage ->> Alice [label = "[4] Verification"];
      Alice -> Bob [label = "[5] Manifest"];
    }

1. Alice creates a partial hash :math:`\mathfrak{H}_1(\mathcal{M})`.
   :math:`\mathfrak{H}_1` and :math:`\mathfrak{H}_2` are decompositions
   :math:`\mathfrak{H}(\mathcal{M}) = \mathfrak{H}_1(\mathcal{M}) |
   \mathfrak{H}_2(\mathcal{M})`. Alice sends this to the storage server, which
   returns a nonce :math:`\mathcal{iv}` and salt :math:`\mathcal{s}`.

2. The server mantains a mapping
   :math:`\mathcal{T}'(h)\longmapsto\langle\mathcal{iv},\mathcal{s}\rangle`
   which relates *half* of the hash of the full plaintext to enryption
   parameters; if the values existed already, they are returned, otherwise, they
   are created on the fly (and saved and returned).  [#f203]_ This is the point
   where deduplication occurs: any attempts to upload an identical message will
   always result in the same encryption parameters.

3. Alice next generates an encryption key
   :math:`\mathcal{k}=\mathcal{K}(\mathfrak{H}_2(\mathcal{M}), \mathcal{s})`
   from the second half of the hash of the plaintext message (and salted), then
   generates the cryptotext of the message
   :math:`\mathcal{C}=\mathscr{E}(\mathcal{k},\mathcal{iv}|\mathcal{M})`, and
   then constructs a new hash of the encrypted message
   :math:`\mathcal{c}=\mathcal{H}(\mathcal{C})`. Alice sends the full encrypted
   message :math:`\mathcal{C}` to the server.

4. The storage server maintains a second mapping
   :math:`\mathcal{T}''(c)\longmapsto\langle\mathcal{v},\mathcal{C}\rangle`,
   which simply relates a hash of the encrypted contents to the contents, as
   well as a random verification identifier :math:`\mathcal{v}`, which is
   returned only if the server receives the full encrypted message.

5. At this point Alice has collected the full "manifest":
   :math:`\langle\mathcal{H}(\mathcal{C}),\mathcal{k},\mathcal{iv},\mathcal{s},\mathcal{v}\rangle`,
   which can be sent to Bob.

When Bob wants to fetch the object, Bob sends
:math:`\langle\mathcal{H}(\mathcal{C}),\mathcal{v}\rangle` to the storage server
which first confirms correct
:math:`\mathcal{T}''(c)\longmapsto\langle\mathcal{v}\rangle` and then returns
:math:`\mathcal{C}`. Bob then has :math:`\mathcal{M}` from
:math:`\mathcal{D}(\mathcal{C},\mathcal{k},\mathcal{iv},\mathcal{s})`.

The storage server (obviously) never sees :math:`\mathcal{M}`. Furthermore, it
doesn't track an explicit relationship between :math:`\mathcal{M}` and
:math:`\mathcal{C}` in any manner. [#f204]_

Now, consider another user, Charles, who independently uploads the same object
to share with some other party. The above process will play out the same, and
the resulting
:math:`\langle\mathcal{H}(\mathcal{C}),\mathcal{k},\mathcal{iv},\mathcal{s},\mathcal{v}\rangle`
will end up being identical. Thus, re-uploading or sharing (copying and
distributing the manifest) results in the exact same data.

An outside adversary cannot determine what objects have been shared: all they
can do is go through the above process and abort at some point, but won't learn
anything: they won't receive the full manifest until all steps are completed,
and at no point will the server act differently than if it had never seen the
object.

The manifest is portable outside the system: it doesn't matter if the manifest
was shared within a chat channel (see next section), or in some other manner
(SMS, emailed, copied to file across flash USB, etc). Regardless of how Bob
receives the manifest, Bob can ask for :math:`\mathcal{C}` and can perform
:math:`\mathcal{D}(\mathcal{C},\mathcal{k},\mathcal{iv},\mathcal{s})`.

Deduplication will occur at step "1" and "3": when the server receives
:math:`\mathcal{C}` it calculates :math:`\mathcal{c}=\mathcal{H}(\mathcal{C})`,
and if it has already seen it, it returns the stored value
:math:`\mathcal{T}''(c)\longmapsto\langle\mathcal{v},\mathcal{C}\rangle`,
otherwise it generates a new :math:`\mathcal{v}` (and stores and returns it).
Regardless, it goes through the motions of "storing" :math:`\mathcal{C}`, which
will in effect be a no-op if it had already stored it.

The final result is a
:math:`\mathcal{T}''(c)\longmapsto\langle\mathcal{v},\mathcal{C}\rangle` storage
system, that will only respond if you already have :math:`\mathcal{v}`, which
you can only have if you either went through the above steps yourself, or
somebody else did and gave you the results. And of course the resulting
:math:`\mathcal{C}` is of no use to you without
:math:`\langle\mathcal{k},\mathcal{iv},\mathcal{s}\rangle`.




Every :term`Channel` maintains a budget :math:`\mathcal{B_r}` that was assigned
to it at creation by taking an initial budget from :math:`\mathcal{B_g}` and
adding it to both :math:`\mathcal{B_s}` and  :math:`\mathcal{B_r}`. [#f208]_

When a client uploads an item :math:`\mathcal{M}`, it first needs to calculate
what :math:`\mathcal{|C|}` will become. [#f207]_ It first requests from the
channel to spend :math:`\mathcal{s = |C|}` bytes out of the Channel balance
:math:`\mathcal{B_r}`.

If approved, the Channel :math:`\mathcal{r}` requests an identifier
:math:`\mathcal{t}` (elsewhere called :term:`<TID>`) from the Ledger. [#f209]_
This is a random token generated by the Ledger which maintains
:math:`\mathfrak{D_2}\mathcal{h(t)}\mapsto\langle\mathcal{s, u}\rangle` where
:math:`\mathcal{h()}` is a hash function, :math:`\mathcal{s}` is the size and
:math:`\mathcal{u}` is a boolean indicating if this has been 'spent' or not.
Essentially, we are generating a local cryptocurrency token of sorts, that can
be traded for an upload of :math:`\mathcal{s}` bytes.

The Channel never shares :math:`\mathcal{t}` with the Client, instead it returns
:math:`\mathcal{T=}\mathfrak{E}\mathcal{(}\langle\mathcal{h(t), R(t),
R(h(t)}\mathcal{)}\rangle` where :math:`\mathfrak{E}\mathcal{()}` is encrypted
into a magical token :math:`\mathcal{T}` such that only the Storage server can
untangle it. :math:`\mathcal{R()}` is encryption using the :term:`LEDGER_KEY`
for future garbage collection.
      
The Client can now do the actual upload of :math:`\mathcal{v|C}`, sending along
with it :math:`\mathcal{T}`. 








|
|

------------------


.. rubric:: Footnotes

.. [#f201] In this section we will largely follow the nomenclature in 
	   *Message-Locked Encryption and Secure Deduplication*;
	   Mihir Bellare, Sriram Keelveedhi, Thomas Ristenpart;
	   Full version, original version in Eurocrypt 2013.

.. [#f202] You can think about it as follows: think of a generic
	   message as being :math:`\mathfrak{m}` with size
	   :math:`\vert\mathfrak{m}\vert`.
           We wish to distinguish between "small" and "large"
	   :math:`\mathfrak{m}`. That's an engineering and
           cost analysis question. Given a boundary :math:`\mathfrak{S}`,
           then messages where :math:`\vert\mathfrak{m}\vert < \mathfrak{S}`
	   are treated as :math:`\mathcal{m}` otherwise
	   :math:`\mathcal{M}`. The smaller objects :math:`\mathcal{m}`
           are replicated wherever they are used, and the
	   larger :math:`\mathcal{M}` are essentially
	   *converted into a reference* and embedded inside a
	   new :math:`\mathcal{m}`. That conversion includes
	   handling deduplication.
		 
.. [#f203] There is a race condition if multiple parties are trying to
	   create a new entry in this mapping at the same time.
	   To address this, the underlying primitive should be a
	   *compare-and-exchange*-style operation, where a new
	   nonce and salt are always generated, and are then
	   atomically compared with existing storage, which should
	   default to zero if not allocated: ergo, if there's a zero
	   (unallocated), write the new values, otherwise, return
	   the old ones. This would also reduce timing differences,
	   since the overhead of generating enryption parameters
	   is *always* carried, but optionally discarded.
           
.. [#f204] Note that this is slightly different from the current
           implementation, and is a (believed) improvement: current
	   code (soon to be updated) creates a concatenation of
	   partial hash of the plaintext with partial hash of
	   the encrypted. The problem this creates is that an
	   adversary that is able to gain full access to the storage
	   server at some point in time could look for the existence
	   of matches to known plaintext messages by simply inspecting
	   the first half. In this revised design, a storage server
	   has the option of clearing the mapping of
	   :math:`\mathcal{T}'(h)\longmapsto\langle\mathcal{iv},\mathcal{s}\rangle`
	   at any time: sharing manifests and retrieving encrypted
	   messages would be unaffected, to the detriment of reduced
	   effectiveness of deduplication. This allows for a form of
	   forward privacy (on the aggregate): for example, a storage
	   server configured to reset this mapping every week
	   could only leverage deduplication within each distinct
	   weekly period, but conversely an adversary that could
	   completely compromise the system would only be able to
	   determine if a given plaintext message was uploaded
	   and shared by anybody in the past week.

.. [#f205] The final xor operation with
           :math:`\mathfrak{H}(\mathcal{M})` exists to protect for the case where the
           :math:`\mathcal{OPRF_1}` server has been compromised.

.. [#f206] A concern is that OPRF is not yet an accepted IETF standard. Latest
	   draft is here https://www.ietf.org/id/draft-irtf-cfrg-voprf-09.html and
	   current (Draft 9) reference implementations are here
	   https://github.com/cfrg/draft-irtf-cfrg-voprf. So far in the design
	   design, we have tried hard not to use any functions that triggers the
	   necessity of including libraries or even major sections of code. The
	   advantages of improving the blob storage system with OPRF might outweigh
	   those concerns, but we have not made a final decision.
	   
.. [#f208] The Channel balance is actually simply a local cached value that
	   matches whatever the balance is for the channel according to the
	   Ledger server. The Channel 'copy' of the balance serves as a synchronization
	   primitive, allowing the Ledger server to not have to worry
	   about that - the Ledger server can fullfil account balance
	   changes in any order. Similarly, this naturally protects against
	   various abuse and DDOS scenarios.

.. [#f207] Because of the very specific padding requirements, this is
           predictable.

.. [#f209] Note that :term:`<TID>` and :term:`verification` are different.



|

------------

.. rubric:: Footnotes


.. [#f030] The Javascript code for the processing is publicly available to experiment with at:
	   https://cdn.privacy.app/util/photoTesting.html in the
	   client to generate a :term:`thumbnail` as well as a standardized
	   version; when the thumbnail appears *locally *on the client
	   both versions are ready to be used. The code used will
	   transform into any desired *maximum* size (iteratively
	   “solving” for change in canvas size until it fits.

.. [#f031] Which means metadata will be removed as a side-effect, if
	   and only if the image is bigger than 16 MB. The 16 MB
	   limit was chosen to bo fit within the current :term:`KV_global`
	   limits, and also to be conventient "page size" for future
	   abstraction layers that would treat such a blob as a basic
	   building block for more complex data structures (larger files,
	   streaming files, file system emulation, etc).  A
	   future extension is to allow uploaded objects to be pushed
	   onto a separate blob store such as S3.

.. [#f032] The point being, the backend does not reveal if this object
	   has been seen before.

.. [#f033] Counting in KB, either 128, 256, 512, 1024, 2048, or 4096
	   KB. This is a slight leak of information about the image,
	   but it’s in exchange for what we estimate to be 95% storage
	   saving. If this is deemed a problem, a future feature could
	   optionally enforce a specific size, say, 512KB. The “full”
	   (unmodified, original) image is padded like previews if
	   it’s no larger than 4MB, larger sizes are rounded up to the
	   nearest ¼ of their size rounded up.

.. [#f042] The block size that the encryption stage (AES) will work
	   with is 128 bits.

.. [#f034] The token needs to be anonymous in this sense: the storage
	   backend needs to be able to confirm that it could only have
	   been generated by a channel server, but not which channel server
	   nor any other information other than the padded size of the
	   object.

.. [#f035] There is a data race possibility here, namely, that the
	   same image will be saved at the exact same time from
	   different sources, and they will end up with different
	   information; we will handle this (presumably rare) case
	   later in the process.

.. [#f041] For example, as reviewed here:
	   https://tonyarcieri.com/whats-wrong-with-webcrypto ;
	   earlier criticism such as the classic "Javascript
	   Cryptography Considered Harmful", see References for a
	   link.

.. [#f043] We will present all data storage and sharing in terms of "photos"
	   or "images", since that is the most important type of data chunk
	   for basic chat service. However, the same core mechanisms
	   will be used to generalize storage of any type of document or file.

.. [#f044] Below we will use the term 'file' to cover all possible types
	   of data that we want to be able to store and share: photos,
	   images, videos, documents, backups, disk images, etc.

.. [#f045] Or if/when replicated or mirrored onto other systems
	   such as IPFS (https://ipfs.io/).

.. [#f046] <TODO>
	   
.. [#f050] TODO: In the modified design (summarized :ref:`here <blob_future_design>`),
	   this request to store needs to come earlier to serve as natural
	   DDOS protection for the OPRF() endpoints.

.. [#f047] TODO: we have an outstanding design concern here, which is
	   to retain a hash or encrypted copy of the :term:`<TID>` that only
	   the owner can take advantage of in a future 
           "free(<TID>, <FN>)" which would queue up :term:`<FN>` for offline resolution
	   (to deallocated the storage budget accrued for that specific <FN>
	   for that specific user, with minimal privacy leakage).

.. [#f048] <TODO>

.. [#f049] This allows recovery requests to be queued up, and storage that's been
           caused by a user on a multi-user server to be recoverd. That processing
	   is done offline on an air-gapped system, the results being simply
	   a set of object that can (optionally) be safely deallocated (because
	   nobody is paying for that storage space). 



	   	            
