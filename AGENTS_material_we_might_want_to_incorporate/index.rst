
|
|

.. image:: /static/os384.png  
   :height: 120px
   :align: center
   :alt: OS 384 Logo

We have all learned a great deal about privacy, security, and sovereignty over
the past few decades - and the lack of these digital freedoms across our current
digital landscape. The origins of os384 traces back to a small project to
create a simple chat and social media application integrating these lessons. We first
discovered we would have to begin from scratch, and then over a period of a few
years we realized that modern standards of digital sovereignty is simply not
attainable using existing app development. Various building blocks
existed, but with many gaps.

As we tried to assemble these pieces and fill in the gaps, we discovered that we
were redesigning deeper and deeper into the "stack" of any app. And
inadvertently we found ourselves writing a new operating system.

**os384** is a new platform for building private, secure, and sovereign
applications. It revisits and redefines the conventional architecture of
internet and smartphone apps.

You can read (and share) the summary release announcement here:

.. raw:: html

    <a href="https://384.dev/#Mc9N75" target="_blank">https://384.dev/#Mc9N75</a>

Whereas conventionally the 'platform' layer resides on servers, the os384
architecture migrates most platform functions into the client (browser). It
still talks to servers, somewhere, but entirely without any notion of a
centralized authority.

Commercial development is being pursued by 384 (https://384.co), but all the
core pieces (platform library, reference servers, template clients, etc) are
open source (GPLv3). [#f04]_

To work in os384 you will generally need a storage token, you can request one
here (or just sign up for email updates):

.. raw:: html

    <a href="	https://c3.384.dev/api/v2/page/52rB7fH2/index.html" target="_blank">os384 Signup App</a>

Or you can simply email us at info@384.co 

.. toctree::
   :hidden:
   :maxdepth: 3

   introduction
   demo03
   background
   user-guide
   servers
   discussion
   notes
   glossary
   modules
   appendix-a-crypto.rst
   references
   license
   (ignore) <diag-sample>
   demo04



----------------

.. rubric:: Footnotes

.. [#f01] For more discussion on the motivation and resulting design principles,
   see the :ref:`general discussion <discussion>` section.

.. [#f04] The canary function for all of 384 technology is @psm's personal
   twitter (https://twitter.com/petersmagnusson). You can DM at any time to ask
   if there are any known "constraints" in effect that might impact the
   integrity of any parts of the design, implementation, algorithms, etc. You
   will get a reply if (and only if) there are none. If you don't know what
   this footnote means, don't worry about it.


----------------

**LICENSE**

Copyright (c) 2024 384, Inc, All Rights Reserved.

"384", "os384", "Snackabra", and "Sovereign Computing" are registered
trademarks and are owned by their respective owners.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

For non-GPL-v3 uses including commercial licensing, please contact 384, Inc.
This technology is subject to multiple patent protections.

This program is distributed in the hope that it will be useful, but
WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
Affero General Public License for more details.

Licensed under GNU Affero General Public License
https://www.gnu.org/licenses/agpl-3.0.html


