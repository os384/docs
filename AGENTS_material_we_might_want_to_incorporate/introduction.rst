
.. _introduction:

========
Overview
========



------------
Architecture
------------

We touched on many of the pieces above. But more generically, below
we sketch out the main parts. Channels (communication) and Objects (shards/blobs)
are the most important primitives.

Channel servers are accessed for most API calls with a restful API.
For lower-latency communication, you can also connect with a websocket.


.. graphviz::
   :align: center
   :caption: Key Architecture Components


   digraph Architecture {
      graph [
         newrank = true,
         nodesep = 0.5,
         ranksep = 0.7,
         overlap = false,
         splines = true,
         fontname = "Ubuntu"
      ];

      node [
         shape = box,
         style = "filled",
         color = "#2B7CE9",
         fontname = "Ubuntu",
         fontsize = 16,
         fillcolor = "#58ACFA",
         height = 0.5,
         width = 1.5
      ];

      edge [
         fontname = "Ubuntu",
         fontsize = 12,
         arrowsize = 1,
         style = "bold"
      ];

      // Define primitives
      channel [label="Channel\n(Restful/WebSocket)", URL="./classes/Channel.html"];
      object [label="Object\n(Shard)", URL="./interfaces/SBObjectHandle.html"];

      // Define servers
      restServer [label="Channel Server\n(Restful API)", shape=ellipse, fillcolor="#FFD700"];
      websocketServer [label="Channel Server\n(WebSocket)", shape=ellipse, fillcolor="#FFD700"];
      dataServer [label="Storage Server", shape=ellipse, fillcolor="#58ACF0"];

      // Define abstractions
      channelStream [label="Stream", URL="./classes/ChannelStream.html"];
      sbFile [label="SBFile\n(Multiple Shards)", URL="./classes/SBFile.html"];

      // Define other building blocks
      processing [label="Communication\nIdentity\nBudget"];
      management [label="SBFS", URL="/classes/FileSystem.html"];

      // AppMain block
      appMain [label="AppMain", fillcolor="#B2D3E4"];
      os384 [label="os384 application", fillcolor="#AED581"];

      // Connections
      channel -> channelStream;
      object -> sbFile;
      channelStream -> processing;
      sbFile -> management;
      processing -> appMain;
      management -> appMain;
      appMain -> os384 [label=" Contains ", fontcolor="black", fontsize=10, style="dotted"];

      // Connections to servers
      channel -> restServer [style=dashed];
      channel -> websocketServer [style=dashed];
      object -> dataServer [style=dashed];

      // Subgraphs to denote clusters or grouping of functionality
      subgraph cluster_0 {
         label="Core Components";
         color=lightgrey;
         style=dashed;
         channel;
         object;
      }

      subgraph cluster_1 {
         label="High-Level Abstractions";
         color=lightgrey;
         style=dashed;
         channelStream;
         sbFile;
      }

      subgraph cluster_2 {
         label="Servers";
         color="#CCCC00";  // Yellowish
         style=dashed;
         restServer;
         websocketServer;
         dataServer;
      }
   }

The details of the main components are documented through their class hierarchy.

.. _Class_Hierarchy:

---------------
Class Hierarchy
---------------

.. graphviz::
   :align: center
   :caption: Main Classes (Note: clickable)

   digraph {
      graph [
         rankdir = BT;
         nodesep = 0.6;
         ranksep = 0.75;
         fontname = "Helvetica";
      ];

      node [
         shape = "record",
         style = "filled",
         fillcolor = "#e8e8e8",
         fontname = "Helvetica",
         fontsize = 12
      ];

      edge [
         arrowhead = "empty"
      ];

      SBEventTarget [label="{SBEventTarget}", URL="./classes/SBEventTarget.html"];
      SB384 [label="{SB384}", URL="./classes/SB384.html"];
      ShardInfo [label="{ShardInfo}", URL="./interfaces/ShardInfo.html"];

      SBObjectHandle [label="{SBObjectHandle|+extends ShardInfo}", URL="./interfaces/SBObjectHandle.html"];
      SBChannelKeys [label="{SBChannelKeys|+extends SB384}", URL="./classes/SBChannelKeys.html"];
      Channel [label="{Channel|+extends SBChannelKeys}", URL="./classes/Channel.html"];
      ChannelSocket [label="{ChannelSocket|+extends Channel}", URL="./classes/ChannelSocket.html"];
      ChannelStream [label="{ChannelStream|+extends Channel}", URL="./classes/ChannelStream.html"];
      ChannelApi [label="{ChannelApi|+extends SBEventTarget}", URL="./classes/ChannelApi.html"];

      SBFile [label="{SBFile|\[array of shards\]}", URL="./classes/SBFile.html", fillcolor="#B0E0E6"];
      FileSystem [label="{FileSystem|\[sets of files\]}", URL="./classes/FileSystem.html", fillcolor="#B0E0E6"];

      // Connect the nodes to show inheritance
      SBObjectHandle -> ShardInfo [constraint=true];
      SBChannelKeys -> SB384 [constraint=true];
      Channel -> SBChannelKeys [constraint=true];
      ChannelSocket -> Channel [constraint=true];
      ChannelStream -> Channel [constraint=true];
      ChannelApi -> SBEventTarget [constraint=true];

      SBFile -> SBObjectHandle [constraint=true, style="dashed", arrowhead="odot"];
      FileSystem -> SBFile [constraint=true, style="dashed", arrowhead="odot"];
      FileSystem -> ChannelStream [constraint=true, style="dashed", arrowhead="odot"];

      // Implicit base classes (if they themselves have superclasses, add them as needed)
      // Example: BaseClass -> SB384 [constraint=true];
   }


------------

.. rubric:: Footnotes

