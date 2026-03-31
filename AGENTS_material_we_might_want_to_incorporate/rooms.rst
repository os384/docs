===========================
Channels (ROOMS - OUTDATED)
===========================

BEING REWORKED: this documentation dates to the perspective of "rooms" in
original Snackabra chat servers. SB rooms have over time been refactored into
what should be operating system level (os384) and what should be in the chat
application (of which we now have a few).


Loader
------

Here's roughly what's going on. Let's say you're connecting to
"example.com/<channel...>" with a browser (on a computer or on a phone,
doesn't matter, you're using a "web client" / "web app"):

.. seqdiag::

    seqdiag {
      "app.384.dev [C]"; "384.dev [A]" ; "SERVER [B]";

      // defaults
      default_fontsize = 18;  // default is 11
      // autonumber = True;
      default_note_color = lightblue;

      // also available:
      // edge_length = 300;  // default value is 192
      // span_height = 80;  // default value is 40
      activation = none; // Do not show activity line

      span_height = 20;  // default value is 40

      "384.dev [A]" -> "SERVER [B]" [label = "384.dev/#abc [1]"];

      "384.dev [A]" -> "384.dev [A]" [label = "'#abc'"];

      
      // "SERVER [B]" ->> "384.dev [A]" [label = "Web App [2]"];
      // "384.dev [A]" -> "384.dev [A]" [label = "Connect [4]"];
      // "384.dev [A]" -> "384.dev [A]" [label = "Personal Public Key [5]"]
      // "384.dev [A]" ->> "384.dev [A]" [label = "Channel Keys and info [6]"];
      // "384.dev [A]" -> "384.dev [A]" [label = "ready! [7]"];
      // "384.dev [A]" <-- "384.dev [A]" [label = "new msg! [9]"];
      // "384.dev [A]" <-- "384.dev [A]" [label = "new msg! [9]"];
      // "384.dev [A]" <-- "384.dev [A]" [label = "new msg! [9]"];

    }



Notes:

A. This is your browser, in a tab, opened on "https://384.dev" or
   "https://384.dev/#<something>".

B. This is the os384 loader server. It is a "static" web server, it simply
   responds with an HTML page which in turn contains the os384 "loader". It will 
   reply with the same "image" whether accessed at "384.dev" or "app.384.dev".

C. This is your browser, but in a tab with a subdomain to the os384 loader,
   meaning, it will be, for example, "https://app.384.dev".


An example

1. Your browser client opens "https://384.dev/#abc". The server will respond
   with the os384 loader, and the portion after the hash (called "hash" or
   "fragment") is not visible on the network, but it will be visible to the
   loader - once it has loaded.


1. Your browser connects to "<site>/<roomId>", which returns
   the web application (for example TODO).
   The client logic is the downloaded web app. This step is optional - if
   you are running your web client locally, or using a mobile app
   (for example TODO), then
   your interaction goes to the next step. For this example we'll
   assume you're using a browser.

2. Web client ("app") fires up.

3. The app checks for crypto keys in the browsers'
   local storage, and will load what's there. If that includes
   keys for the channel in question, then it'll use those,
   otherwise it will generate a new "personal public key"
   pair (and store it locally). That's your "real" identity in any channel.

4. The app connects (web socket) to the channel server. In this example
   we will assume you're connecting to a :term:`Personal Channel Server`
   to keep it simple.

5. The first thing the app does is present the user identity (the
   public key from [3]). 

6. The channel server will respond with a number of things:
   the channel keys (public keys for other participants),
   the :term:`MOTD`, and whether the channel is :term:`Restricted` or not.
   
7. Once the app has digested all the info and is all set
   to rock and roll, it sends a "ready" message to the channel server.

8. The first thing the channel sends upon seeing "ready" is to
   start catching the client up on messages (latest 100).

9. As long as the socket is open, the channel server will forward
   anything anybody else adds to the channel, in real time.

Now we can connect that back to the state in the previous figure (the
"[N]" notation refers to explanations below the figure):
   
::

   [1] {
        
         "roomData": {
   [2]       "hkUkHY6wm-ZXmIyhCt1v4NBK-o1PV4GyKBn...
             "key": {"crv":"P-384",
   [3]	             "d":"sj2_C2fkHLBp57X5MLJq6pN...
                     "ext":true,
                     "key_ops":["deriveKey"],
                     "kty":"EC",
   [4]		     "x":"ql6o3O_8IC5fE7RnZOwTZtY...
		     "y":"YMKC8rqt6VmwyMNo70wiAJi...
                    },
             "username": "Design Doc",
             "lastSeenMessage": "0101111110011110...
           }
         },
   [5]   "contacts": {
           "OnjiCyxa5G68wlCvXbpI_gdXV2YN26z-Jju9b...
           "T8tsnKkhqCx68KxDRYJt58w_dw_lAXjgr8I1R...
           "mMixQMasdGKMdqnxxzHbALZ95jIRBrZK-am_w...
           "uO_6YnK55FecnIdEDrs5IDdyadc2Nrp9wFK3T...
   [6]     "ql6o3O_8IC5FE7RnZ0wTztYM6Lm4oLyr3MgjH...
         },
         "roomMetadata": {
           "hkUkHY6wm-ZXmIyhCt1v4NBK-o1PV4GyKBnl7...
   [7]       "name": "Channel 1",
   [8]       "lastMessageTime": "0101111100010011...
             "unread": true
           }
         }
       }   


1. All this type of information we tend to call "keys", even if
   there's also some meta data. They're stored in JSON format
   in local browser storage (or secure storage on a mobile app).

2. You recognize the channel id by now!

3. "d" is magical in EC keys, it's the "private" part of the key.
   This thus keeps your local (secret) private key that corresponds
   to this specific channel. All participants get all the public
   keys from all other participants.

4. The "x,y" pair is your public key (so to speak).

5. The "contacts" section simply lists the identities of everybody
   else on the chat. The channel server tracks this.

6. And here "we" are, in the list of participants.

7. For ease of (human) use, the client tracks some meta data on the
   channel. For example you can assign it a name (only visible to
   yourself).

8. This shows the time stamp of the last seen message.
   We use a time stamp representation that allows for prefix
   searches, more on this later.


Channel Keys
------------

A lot happened in your browser in the above simple steps. The web client loaded,
and checked for any state in your "local storage" (in your browser). If there's
none, it initializes that data for you. 

When you first try to enter the channel, you are just a "Visitor", and behind
the scenes the web app will initialize local data with basics about the channel
you're trying to connect to:

:: 

   {
     "roomData": {},
     "contacts": {},
     "roomMetadata": {
       "hkUkHY6wm-ZXmIyhCt1v4NBK-o1PV4GyKBnl7U8KaYgoe1Yi150ptDnVUmkboFOL": {
	 "name": "Channel 1"
       }
     }
   }

This is all that the app knows about you so far - that you're trying to access a
channel with identy ``hkUkHY6wm...``. You haven't "entered" the channel yet -
the channel requires your alias string before admitting you.

At this point you're a "visitor" and at first the system doesn't know
anything about you.  Visitors are either Guests or Owners. Guests can
be Verified (or not), and Accepted (or not), and Owners can also be
Admin. More on all this shortly:

.. graphviz::
   :align: center
   :caption: Basic categories of visitors
	   
   digraph visitors{
	   size="6,6";
       node [shape="record", color=lightgrey]; Guest;
	   node [color=lightblue2, style=filled];  Visitor; Owner; Admin
	   "Visitor" -> Guest;
	   "Visitor" -> "Owner" [label="  Keys Match Channel?  ", fontsize="10"];
	   "Owner" -> "Admin" [label="  Cookie Present?  ", fontsize="10"];
       Guest [label="Guest: \n|{Verified?|Accepted?}"];
   }



A typical first-time visitor is a straight-up Guest (neither Verified
nor Accepted).  The app now generates more state, which is what you
actually see when you go to the Home tab:[#f05]_

::

   {
     "roomData": {
       "hkUkHY6wm-ZXmIyhCt1v4NBK-o1PV4GyKBnl7U8KaYgoe1Yi150ptDnVUmkboFOL": {
	 "key": {"crv":"P-384",
	         "d":"sj2_C2fkHLBp57X5MLJq6pN_ZErq0zZb8y4FvIXG_ffQsvqRlR958MMBcNwpzcn-",
		 "ext":true,
		 "key_ops":["deriveKey"],
		 "kty":"EC",
		 "x":"ql6o3O_8IC5fE7RnZOwTZtYm6Lm4oLyr3MgjH_gUIcZa1Y-PPhInxzfJxMNLQQqi",
		 "y":"YMKC8rqt6VmwyMNo70wiAJi8bPzIrGoNeIUEzShj6MJuRUYnZlG0dRjBHY9TPgeN"
		},
	 "username": "Design Doc",
	 "lastSeenMessage": "010111111001111001100100100000000100010000"
       }
     },
     "contacts": {
       "OnjiCyxa5G68wlCvXbpI_gdXV2YN26z-Jju9bg7eGBz4G5uCKOeJMQSFvI8m1qYa NdCa_mJYUcfgghMwLE2YPtEdv7PBDcy2gW_aHB8zHv1_LFe9SMVOu5wooTQOWIKr": "Unnamed",
       "T8tsnKkhqCx68KxDRYJt58w_dw_lAXjgr8I1RanxIV0M_quLX1sXdfbxR7wjLVSu lQD3521v2K4XAwo2uB0qMQR2uqZJcoAR0uyY8YSuVYGHC_qumpFleAB3I1t1dWrc": "Unnamed",
       "mMixQMasdGKMdqnxxzHbALZ95jIRBrZK-am_wEWfjNK1umaRW-Efd5tIV1Yr6Or9 PqDPj8NahdEnJbmFuuudwC57GR3UiljzHMP-4a64L7RTBaiMehJluyhuVjiOklJ8": "Unnamed",
       "uO_6YnK55FecnIdEDrs5IDdyadc2Nrp9wFK3Te_ddoghrCljwA7acIRI28ZzGbq_ 7OdkqJhZgwgsZYIuFawl33hVqeems-D0aOZTLWjRC5WWKlSMDYA3Z2W68c_6-SJU": "Unnamed",
       "ql6o3O_8IC5fE7RnZOwTZtYm6Lm4oLyr3MgjH_gUIcZa1Y-PPhInxzfJxMNLQQqi YMKC8rqt6VmwyMNo70wiAJi8bPzIrGoNeIUEzShj6MJuRUYnZlG0dRjBHY9TPgeN": "Me"
     },
     "roomMetadata": {
       "hkUkHY6wm-ZXmIyhCt1v4NBK-o1PV4GyKBnl7U8KaYgoe1Yi150ptDnVUmkboFOL": {
	 "name": "Channel 1",
	 "lastMessageTime": "010111110001001100010000011111000101101101",
	 "unread": true
       }
     }
   }   

These are your "keys". We will explain the components briefly in this
overview, and then in detail elsewhere in the document. These are all
stored in your browser's ``localStorage`` [#f07]_. That's a small
database handled by your browser, whether you are on a computer or on
a mobile phone.

This is important: **you are responsible for not losing these
keys**. You can hit the "Export" button on your Home tab, and save
them as a file - on your phone or your computer, or email them to
yourself. If you are using a mobile app, then you won't necessarily
see this data at all and the app will manage it for you on your
device. More on this later.


Basic Connection
----------------

Here's roughly what's going on. Let's say you're connecting to
"example.com/<channel...>" with a browser (on a computer or on a phone,
doesn't matter, you're using a "web client" / "web app"):

.. seqdiag::

    seqdiag {
      "example.com"; browser; channel; // storage;

      // defaults
      default_fontsize = 18;  // default is 11
      // autonumber = True;
      default_note_color = lightblue;

      // also available:
      // edge_length = 300;  // default value is 192
      // span_height = 80;  // default value is 40
      activation = none; // Do not show activity line

      span_height = 20;  // default value is 40

      browser -> "example.com" [label = "<site>/hkUkHY.. [1]"];
      "example.com" ->> browser [label = "Web App [2]"];
      browser -->> browser [label = "Load Keys [3]"];
      browser -> channel [label = "Connect [4]"];

      browser -> channel [label = "Personal Public Key [5]"]
      channel ->> browser [label = "Channel Keys and info [6]"];
      browser -> channel [label = "ready! [7]"];
      browser <<- channel [label = ".. latest 100 msgs [8]"];

      browser <-- channel [label = "new msg! [9]"];
      browser <-- channel [label = "new msg! [9]"];
      browser <-- channel [label = "new msg! [9]"];

      // browser => channel => storage [label = "get image", return = "image"];
    }




Details on the steps:

1. Your browser connects to "<site>/<roomId>", which returns
   the web application (for example TODO).
   The client logic is the downloaded web app. This step is optional - if
   you are running your web client locally, or using a mobile app
   (for example TODO), then
   your interaction goes to the next step. For this example we'll
   assume you're using a browser.

2. Web client ("app") fires up.

3. The app checks for crypto keys in the browsers'
   local storage, and will load what's there. If that includes
   keys for the channel in question, then it'll use those,
   otherwise it will generate a new "personal public key"
   pair (and store it locally). That's your "real" identity in any channel.

4. The app connects (web socket) to the channel server. In this example
   we will assume you're connecting to a :term:`Personal Channel Server`
   to keep it simple.

5. The first thing the app does is present the user identity (the
   public key from [3]). 

6. The channel server will respond with a number of things:
   the channel keys (public keys for other participants),
   the :term:`MOTD`, and whether the channel is :term:`Restricted` or not.
   
7. Once the app has digested all the info and is all set
   to rock and roll, it sends a "ready" message to the channel server.

8. The first thing the channel sends upon seeing "ready" is to
   start catching the client up on messages (latest 100).

9. As long as the socket is open, the channel server will forward
   anything anybody else adds to the channel, in real time.

Now we can connect that back to the state in the previous figure (the
"[N]" notation refers to explanations below the figure):
   
::

   [1] {
        
         "roomData": {
   [2]       "hkUkHY6wm-ZXmIyhCt1v4NBK-o1PV4GyKBn...
             "key": {"crv":"P-384",
   [3]	             "d":"sj2_C2fkHLBp57X5MLJq6pN...
                     "ext":true,
                     "key_ops":["deriveKey"],
                     "kty":"EC",
   [4]		     "x":"ql6o3O_8IC5fE7RnZOwTZtY...
		     "y":"YMKC8rqt6VmwyMNo70wiAJi...
                    },
             "username": "Design Doc",
             "lastSeenMessage": "0101111110011110...
           }
         },
   [5]   "contacts": {
           "OnjiCyxa5G68wlCvXbpI_gdXV2YN26z-Jju9b...
           "T8tsnKkhqCx68KxDRYJt58w_dw_lAXjgr8I1R...
           "mMixQMasdGKMdqnxxzHbALZ95jIRBrZK-am_w...
           "uO_6YnK55FecnIdEDrs5IDdyadc2Nrp9wFK3T...
   [6]     "ql6o3O_8IC5FE7RnZ0wTztYM6Lm4oLyr3MgjH...
         },
         "roomMetadata": {
           "hkUkHY6wm-ZXmIyhCt1v4NBK-o1PV4GyKBnl7...
   [7]       "name": "Channel 1",
   [8]       "lastMessageTime": "0101111100010011...
             "unread": true
           }
         }
       }   


1. All this type of information we tend to call "keys", even if
   there's also some meta data. They're stored in JSON format
   in local browser storage (or secure storage on a mobile app).

2. You recognize the channel id by now!

3. "d" is magical in EC keys, it's the "private" part of the key.
   This thus keeps your local (secret) private key that corresponds
   to this specific channel. All participants get all the public
   keys from all other participants.

4. The "x,y" pair is your public key (so to speak).

5. The "contacts" section simply lists the identities of everybody
   else on the chat. The channel server tracks this.

6. And here "we" are, in the list of participants.

7. For ease of (human) use, the client tracks some meta data on the
   channel. For example you can assign it a name (only visible to
   yourself).

8. This shows the time stamp of the last seen message.
   We use a time stamp representation that allows for prefix
   searches, more on this later.

It's an important design principle that the important pieces of information is
comprehensible, and accessible, to users. Nothing (important) hidden inside some
compiled application, or on some server.

To reiterate the important bits:

* There is *no global identity* for any users. Your identity is
  always *relative* to a channel.

* Channels are essentially *independent of servers*. A "channel"
  is made up of the set of keys that define the participants,
  and the (encrypted) messages that have accrued thus far.

* (Strong) public key cryptography is used throughout to directly
  represent "identities". The public half is visible to various participants
  and servers, globally identifying either a channel, or a
  participant within a channel.

* The only authentication ever needed is the private half
  of a corresponding key.

You might be asking how we authenticate the channel itself? Good question. It's
derived from the "owner key", namely, the (public) key generated for the "root"
participant of the channel. When a channel is created, what is actually created
is a new personal public key; the channel name is simply derived from this
(details later). That means only the individual with the private half of the
owner key can ever prove that they "own" the channel. When channels are migrated
or mirrored, servers will only accept the authority provided by that owner, and
clients can verify that the servers are doing it correctly. [#f08]_
  
This is the gist of it. The biggest part that we're not covering in this
overview is storage - how to share photos and files and documents, while
maintaining privacy, secrecy, etc, is a big pillar.


Channels
--------

A client connecting to a channel will first check for their own
participant keys in their localstorage.

If the local_storage has no participant keys for the channel, that means
the person joining is new to the channel. A dialog box is shown to
confirm that the user understands this, if not, they’re prompted to
load keys from backup.

Otherwise, a new participant key is generated and stored in
localstorage.

Otherwise, the client connects to websocket and sends their public
participant key to the DO. The DO replies with a ‘ready’ message
containing the following data from :term:`KV_local`:

* keys: 

  * <channel>_ownerKey

  * <channel>_encryptionKey

  * <channel>_signKey

  * <channel>_guestKey  (‘Null’ if not present in :term:`KV_global`)

  * <channel>_authorizationKey 

* MotD

(See the :ref:`Channel and User Keys <roomUserKeyDetails>` section for
details, the above is just a summary.)

If the _ownerKey is Null, the channel is "non-existent" meaning it has
not been created. If a participant tries to message a non-existent
channel, a system message is displayed to the client which says that the
channel has not been initiated yet.  The keys (and the existence of the
channel) is generated by administrative tools (CLI).

If the _guestKey is Null, it is set to the public half of the first
participant (who does *not* have the cookie, e.g., who is not Owner).

Owner and Admin
---------------

If the participant key is the same as the roomKey, the client UI will
assume that it’s the Owner. This only affects the whisper UI.

If there is a correctly formed cookie (from the SSO backend), the Chat
UI will show the Admin tab, and the Chat backend will consider this
participant *authenticated* Owner and allow Admin API calls (cookie is
included in each call). Current Admin operations are: restrict a channel,
accept a request to join a restricted channel, and set the MotD (see
below).

The time to live for the cookie is one day:

::

   token_<channel>: epoch+'.’+sign(<epoch>+'_<roomId>);domain=.privacy.app;secure;samesite=strict;max-age=86400';

Where signing is done with ECDSA using <roomId>_authorizationKey (with SHA-256)

Some notes:

#. For an Owner to join "as Owner", both the above cookie and the
   participant key (private half of the ownerKey) will need to be set,
   such as by using sendMessage/iFrame.

#. In default setup, the Owner’s (private) channel owner keys need to be
   kept separate; in our SSO database.

   If the Owner so wishes, they can generate a new pair in the SSO,
   overwrite the corresponding channel ownerKey in :term:`KV_global`, and store the
   private key *only* in their localstorage.

   [internal: In a future upgrade to the membership kits, we can
   include the private keys for all the channels (current and future!) on
   the USB. This would allow us to offer *physical* key recovery service
   for members, without *ever* having the private keys on a networked
   computer.]

#. Restriction is a "fire once" operation - when the Owner restricts a
   channel, all participant clients can verify the public key of the
   Owner *as well as* the assurance from the worker back end *and* the
   separate SSO that this is indeed the Owner.

Message of the Day
------------------

Owner can change the MotD. It’s shown every time the websocket
connects (e.g. whenever you reload the channel, enter it for the first
time, etc).

Whisper:
--------

Whispers are for communication between just the Owner and one
participant, and can be initiated from either party. For everyone
else, the message appears in a yellow background as *(whispered)*
unless the channel is restricted. [#f025]_

Guests can whisper to Owner by tapping the profile icon at the top
right; Owners can whisper by long pressing the "Name" circle of any
message.

This encrypts the message (text and image separately) using the
encryption key derived from the private key of the guest and the
<channel>_ownerKey. [#f026]_

The owner can whisper to anyone who has sent a message to the channel
once by long pressing/long clicking on the user icon for the guest
they want to whisper to. This encrypts the message (text and image
separately) using the encryption key derived from the private key of
the owner (generated when first joined) and the public key of the
guest.

To decrypt a whispered message, key generation is done using the
user’s private key and the sender’s public key which is included in
the message.

(A whisper precludes the need for signing the message.)

Signing:
--------

If a message is not whispered, it will be signed by the sender. If a
message is not whispered and fails verification (sign not
present/corrupted), it is displayed with a red outline.

Each part to be signed (text, image, image metadata) is signed using
the sign key derived from the private key of the sender and the public
half from <channel>_signKey.

Each part is signed using an ‘HMAC’ key derived using the private half
of the sender’s participant key or <channel> key and the public half of
the <channel>_signKey. All 3 signs are verified using the key derived
from the public key of the sender and the private half of the
<channel>_signKey.

Restricting a channel
------------------

When the owner restricts the channel, a new encryption key is generated
and stored in the local_storage. All guests who have visited the channel
once will be added to "Visitor Requests". The owner will also be added
to this list and automatically approved.

A restricted channel will result in a conversation that nobody outside
the group of participants can read (any participant can read all
messages).

Any new visitor will automatically generate a new request to the
Owner.

A restricted channel has a green "locked" icon next to its name.

The Durable Object backend maintains a list of the public key of
‘accepted visitors’ in :term:`KV_local`. The Durable Object backend also
maintains a JavaScript Object of all ‘locked_keys’ wherein the
‘encrypted’ locked_key for each ‘accepted guest’ (look at the section
‘Accepting a guest’) is stored corresponding to the public half of the
visitor’s participant or <channel> key.

Accepting a guest
-----------------

When the channel owner accepts a guest to a restricted channel, the key
stored in the local_storage of the owner as <channel>_lockedKey will be
encrypted using the encryption key derived from the private key of the
owner and public key of the guest. This encrypted key will be sent to
the Durable Objects backend and stored there (:term:`KV_local`).

Whenever a guest joins a restricted channel, if they have been accepted,
this encrypted key will be sent to them as the first ‘message’ from
the Websocket. The key will be decrypted using the key derived from
their private key and the public key of the owner and then stored to
the localstorage.

Owner Key Management
--------------------

The Owner keys are initially managed by the SSO, a bit like if they
were using a password manager. However, this default setup exposes the
Owner to the Institute, for whatever reason, wanting to "impersonate"
them (since the membership page is the SSO service). It also exposes
participants to some extent to security issues in underlying
infrastructure (see the ‘Discussion’ section at the end of this
document).

To give Owners an option for stronger privacy [#f027]_ they can
regenerate their keys for any given channel, from their membership
page. When that happens, a new public ECDH key pair is created in the
client. However the *private* key is *not* stored in the SSO
system. The public half of this key is then signed using the current
<channel>_ownerKey (the key before rotation occurs). The sign and the
public half of the new key are then sent to :term:`KV_global` in a fetch
request which stores the received value (key + sign) as
<channel>_ownerKey<ts>, where ts is the timestamp when it performs the
store operation. (We also refer to this as ‘key rotation’ or ‘locking’
a channel.)

The owner’s chat client will then make a fetch request to the Durable
Object to refresh it’s maintained copy of the ownerKey in
:term:`KV_local`. The Durable Object pings :term:`KV_global` and if the :term:`KV_global`
returns an ownerKey different from the ownerKey in :term:`KV_local`, the DO
broadcasts it to all active chat clients using websockets.

Note: In the current design, the sign which is stored along with the
key is not utilized. However, in future iterations, any user will
independently be able to fetch all <channel>_ownerKeys (meaning all
rotated keys) and verify that all room_ownerKey rotations were signed
by the owner key before rotation and hence, verify that key rotations
were initiated by the owner.

Note: only restricted channels can be locked-down.

Note: once the Owner has rotated their keys, all the other participant
clients will note that hereafter, only commands (such as additional
key rotations) signed by this set of Owner keys are respected.

When a channel is both restricted and rotated (‘locked-down’) a different
lock icon is shown next to the channel name.

|


.. _channels:

Channels: Technical Details
------------------------

All communication is centered around a :term`Channel`.

The :term`Channel Name` is a 48-byte [#f011]_ URI [#f012]_ encoded in 64
characters of b64 [#f013]_. This name is globally unique [#f014]_, including
across servers.

An example would be:

::

   Raih2xfY6D8aKVIlkIeDLIbSpt0qNmU2mUTXYiJQoNSU-SgyTLC0FReui0OhX1Q8

We variously refer to this identifier as "<channel>", “<roomId>”, “room
identifier”, or “room name”.

This URI is generated using (Python) ``secrets.token_urlsafe``
[#f010]_ in the :ref:`command line tools <command-line>`.
(UPDATE: this is changing to be derived from a generated owner public key.)

The location (server) where a channel is created is called the
:term:`Origin Server`. Note that the identity of the origin server is
in no manner reflected in the name of a channel. [#f015]_

The same <channel> identifier is used on different servers: if you
have a staging environment for your front end code, for example,
but share backend databases.

The main MI service hosts channels here:

::

   https//s.privacy.app/<channel>

Or you can run a :term:`Personal Channel Server` if you like.

.. _owner definition:

An :term:`Owner` is a verified user, authenticated in some manner;
for a public server typically through an :term:`SSO`

Our baseline use case is an MI Member
https://privacy.app where owners are authenticated with an MI
membership number, an assigned Yubico hardware security key, and PIN
code. However, the intent of this design is that it should be
stand-alone from any particulars of authentication, but it does assume
the presence of some such authentication.
For example, for a :term:`Personal Channel Server`, it's a server secret
that the admin of the site has.

Channel identifiers are unique, global, and persistent. [#f016]_ They are
transportable in a natural way: no matter how many people host a
service using this design, the probability of any new channels from any
two services colliding is practically zero. Both our current web app and iOS clients
support export / import of conversations. See our discussion on
:ref:`micro-federation <micro-federation>`. 

The :ref:`command line tools <command-line>` include support
for generating "business cards" with QR codes for a channel, the
idea being that you can share these with people you meet, instead
of :term:`PII` like emails or phone numbers.


.. _roomUserKeyDetails:

Channel and User Keys
------------------

The two basic key *types* are:

* Public keys:

  * RSA public-key pair, using SECG curve secp3841 (aka NIST P-384)
    This pair is generated by :func:`sbCrypto.gen_p384_pair`.
 
  * Python library: ``ec.generate_private_key(ec.SECP384R1())`` [#f021]_

  * NSS (Firefox) currently supports NIST curves P-256, P-384,
    P-521. However, apparently P-521 is not widely supported [#f017]_  as it is
    not part of "NIST Suite B". [#f018]_

  * ECDH is used to agree on a key [#f019]_
    between two parties [#f020]_. 

* Encryption keys:

  * AES 256-bit (A256GCM) symmetric key

  * Currently generated using jwk [#f022]_
    library (it’s just 256
    random bits). Generated by :func:`sbCrypto.gen_aes_key_jwk`. 

Key instances, the following are pre-generated and stored by the :term:`SSO`:

* <channel>_ownerKey  - *[Public key pair]*

  * public channel key, used to claim ownership of the channel, and to verify anything signed by the Owner

  * *(existence of this does not imply that the Durable Object for the
    channel has been created, but it means it will be created when
    accessed)*

  * private half of this is stored in Owner (SSO) data only

  * When owner joins channel, private half stored in Owner’s
    local_storage as <channel>_room

  * The public half of this key is also stored in the localstorage

  * Owner can secure key management by generating a new key pair and
    saving the public half as a new entry in the KV_global as
    <channel>_ownerKey<ts>, where ts is the timestamp when they updated
    the key. The private half of this newly generated pair will be
    saved only in their localstorage. [#f023]_

* <channel>_signKey - *[Public key pair]*

  * The private channel signing key, used by visitors to sign back and
    forth (or more accurately, to derive a unique signing key).

  * All participants have access to this key (both halves).

* <channel>_encryptionKey - *[Encryption key]*

  * The durable object keeps an encryption key, used for end to end
    encryption [#f024]_ unless the Owner has taken
    control of their key management

* <channel>_authorizationKey - *[Public key pair]*

  * used to prove ownership of a channel (SSO backend->Chat CF backend)

  * Only SSO backend has private key; SSO can verify it’s authority to
    the Chat CF backend by signing a cookie (or in future, have other
    admin APIs)

The following keys may eventually populate the channel (KV_local):

* <channel>_lockedKey - *[Public key pair]*

  * Generated if the owner "restricts" the channel and stored in local
    storage of accepted guests

  * Used to send an end-to-end encrypted message in restricted channels.

* <channel>_guestKey

  * this is the public key of the *first* guest, used for purple
    outline on messages

  * (note: as always, visitor needs to keep track of their private
    half)

In addition to the above, every participant has in their
local_storage:

* <channel> - *[Public key pair]*

  * This is the public/private pair used for all signing and
    whispering of messages

  * In the case of this being the Owner, it will match the
    <channel>_ownerKey (public half) in the DO/KV_local

  * In the case of this being the Verified Guest (first visitor), it
    similarly matches the <channel>_guestKey

  * (We will refer to this key as the ‘<channel>_participant’ key or
    ‘participant keys’ in this document)

In addition to all of the above, a ‘global’ :term:`LEDGER_KEY` (RSA keyPair) is
also generated.

* The public half is used to encrypt the storage token id by KV_local
  after approving a storage request.

* The private half is only available to offline systems to be used for
  garbage collection and storage revocation.

Message Structure
-----------------

This is the basic message structure before end-to-end encryption:

These components are present in every message:

* encrypted - flag indicating if the message is whispered

* contents - text part of the message (encrypted if whispered)

* image - thumbnail image (encrypted if whispered)

* imageMetaData - KV information for image (encrypted if whispered)

* sender_pubKey - public key of the sender

These components are present if the message is not whispered:

* sign - sign for contents (text part)

* image_sign - sign for thumbnail image

* imageMetaData_sign - sign for imageMetaData

These components are present if the message is whispered to a guest by
the owner:

* recipient - public key of the recipient

NOTE: The Message Structure section will be updated to account for
control messages once finalized.

