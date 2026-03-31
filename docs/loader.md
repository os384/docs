<!-- new link for tiny app (index.html) if needed https://384.dev/#cnsZuEvZc99hgEKFQcTZri58vLlQPg6yZHIi8WObuSP_35452.48086.34806.51098_LQb8lQ2WOk8dHVcuO7FwKWkHZNMacqZXFbXx7GGZVgo_auto -->


# The Loader

At https://384.dev, you won't find a traditional login. Instead, you'll encounter a setup screen that asks for your "[strongpin](/glossary#strongpin)" (similar to a username) and passphrase, or offers the option to create a new setup with a [storage token](/glossary#storage-token) known as the "[wallet](/glossary#wallet)". We'll go into more details on all this later.

![Loader Login Screen](/loader.jpg)

## Key Differentiator

What makes this different? Everything happens locally within your browser—no credentials travel across the network to our servers.

Experience this concept firsthand by visiting https://384.dev/#A1cQwk

That "#A1cQwk" portion is a fragment identifier—a browser-only instruction that never crosses the network. While anyone monitoring your connection sees only that you've visited 384.dev, the specific content you're accessing remains private.

## Architecture

The loader functions as a combination microkernel, virtual machine manager, and bootloader that operates entirely within your browser. It doesn't require 384.dev to function—you can run it locally if preferred.

When you access a fragment identifier like "#A1cQwk," the loader interprets it as a shortened name to a "Page" (our equivalent of a URL shortener). These Pages are associated with Channels and served through Channel API endpoints. The loader analyzes the content type—for simple formats like PDFs that are safe to display directly, it renders them within the current window. However, for complex web applications that require more security isolation, the loader creates a random subdomain of 384.dev and serves the content there. This approach prevents potentially unsafe applications from running at the "top level" domain while also obscuring the exact nature of your activities from DNS or other network monitoring systems.

## How It All Comes Together

- **Loader Code**: Fetched privately from channel servers
- [**Shards**](/glossary#shard): Containing files and instructions are retrieved securely
- **Subdomain Environment**: Created for sophisticated apps
- **Virtual File System ([SBFS](/glossary#sbfs-os384-virtual-file-system))**: Sets up a [service worker](/glossary#service-worker) that securely fetches, decrypts, and serves app components

This innovative architecture ensures robust privacy, secure interactions, and a seamless user experience—all without ever leaving the browser. 

## Running Code: The Loader

Let us return back to the problem of P4, namely, how do we fetch this application? Recall that an "application" here is a web app, which in turn can be any application.[^1]

The example we showed in Figure 5 illustrated how a web page (app) includes references to multiple resources. Some are "global" (such as Google Fonts), some "local" (e.g. parts of a static web site).
  
<Figure id="web-application-example" caption="Shows a web 'application', in this case a tiny static web site which just shows an image gallery. The <style> section is collapsed for brevity. If you were to host this somewhere, the result would be as shown." src="/images/loader_13.jpg" align="center" width="90%" />

Consider a simpler version of such a web app, in <FigureRef id="web-application-example" />. If you put this small static site on a web server somewhere, let's say "example.com", then "https://example.com" or "https://example.com/index.html" would make your browser show the gallery as above.

Now let's consider how we would "host" this app/site in a secure and private manner, namely, such that neither the network (e.g. your ISP or DNS servers) nor the "hosting" server (in this case example.com) would know what you are loading.

This will take several steps. We need to build the primitives on which to "hoist" ourselves.

We begin with writing a "loader". This is a local (HTML) file which, if you open it, will "launch" another app.
  
<Figure id="minimalist-loader" caption="Shows an example of a minimalist loader. It is a complete, working, HTML page. If you run it you should get the 'app' below, right." src="/images/loader_14.jpg" align="center" width="90%" />

<div class="figure-with-text">
<a href="/images/loader_side.jpg" target="_blank" title="Click to view full size">
  <img src="/images/loader_side.jpg" alt="Cylindrical seal" style="float: right; width: 40%; margin-left: 1.5rem; margin-bottom: 1rem;" />
</a>


The loader code should be self-explanatory: we first get some pieces of OS384 (we just need some basic utilities and "boot" functions), then use those to fetch a shard that, in turn, contains an HTML page (app).[^2]

Note that the contents of the app are fetched from a shard server, and decrypted (and validated) locally. There's no "web server", per se, involved in "hosting" this application.

What a OS384 loader does is to get the pieces needed for OS384 itself (e.g. the ability to fetch shards and decode them), and then fetch and run "something else" for the user.

In this minimalist example, what app to get is hard-coded. But we can create "links" using something called fragments. <FigureRef id="url-parts" /> is a primer in what builds a "link" in general. What's labeled "anchor" in the figure is also referred to as "hash" or "fragment". The key to fragments is that they don't leave your client/browser/computer, they are only ever visible locally.[^3]

</div>
<Figure id="url-parts" caption="The parts of a URL, showing how fragments work in the browser." src="/images/loader_15a.jpg" align="center" width="90%" />

<Figure id="updated-loader" caption="An updated loader that runs based on the fragment (anchor) in the URL." src="/images/loader_15b.jpg" align="center" width="90%" />

In the lower part of <FigureRef id="updated-loader" />, we update the loader to retrieve the shard information about what to load (and run) from the fragment. So now we can construct an ordinary link. We just need to host the loader somewhere.

And that can be anywhere, either locally, or on a service like https://384.dev, or some other location. There is nothing about the top-level domain that is relevant for what it's running, it will run what's loaded from shards.

The next step is to enhance the loader so that it can load and run more complicated applications. Even the simple example in <FigureRef id="web-application-example" /> uses multiple files, and it expects to find these files in certain places.

To accomplish this we take advantage of [Service Workers](/glossary#service-worker), a web standard supported by all browsers.

<Figure id="service-worker-flow" caption="The basic flow of service workers. Any web pages (origins) placed in the 'scope' of a service worker are in a sense controlled by that service worker. Any fetch() for an asset (e.g. '/images/lake.jpg') will be routed through the service worker, which can use whatever mechanism it chooses to provide the contents." src="/images/loader_16.jpg" align="center" width="90%" />

OS384 has a standard service worker, which would need to be served alongside the loader itself. The loader can then "prime" or configure the browser so that when the requested "app" is loaded, it will subsequently be served by that service worker. 

<Figure id="service-worker-operation" caption="Simple app (static site) showing OS384 service worker providing the images. This is a view from a browser 'IDE' console, showing details of the network traffic triggered by the web page. 'Fulfilled by' shows '(ServiceWorker)' for most of the assets, once the shard containing the application information has been fetched." src="/images/loader_17.jpg" align="center" width="90%" />

What we have shown so far is how os384 can load, and launch, contents directly in a browser client. As such apps become more complex (e.g. general purpose), various issues arise, in particular regarding security.


# Adding the Service Worker and SBFS

We can now introduce the role of the Service Worker here. When the loader finds itself in `384.dev` [^4]. it will inspect its fragments for "instructions". Typically as we showed, it will be of the format `#\<ID\>_\<Ver\>_\<Key\>`, but we mostly glossed over what it does next.


<Figure id="sbfs-shard-handle" caption="shows an Object, which identifies a Shard and contains all additional information needed to locate, authenticate, and decrypt said shard. The 'id' is a universal identifier  which is unique for the contents. In our invention, the contents are always encrypted, using a random AES-256 key, also included as 'key' in the Object. Finally, 'verification' is a random identifier generated on the storage server when somebody uploads and pays for the storage for the shard. The server can optionally refuse to reply with the contents unless the correct verification is provided, and the only way to obtain the verification is from somebody else who has paid for an upload, or by paying for the upload yourself." src="/images/sbfs_02.jpg" align="center" width="90%" />


You've seen <FigureRef id="sbfs-shard-handle" /> before, that fragment format is simply a compact way to encode an object, e.g. a reference to a shard. "ID" and "Key" are base62-encoded binary identifiers and keys.[^5]

The loader will fetch the shard, decrypt it, and extract contents from the payload. 

<FigureRef id="sbfs-shard-contents" /> shows sample contents of such an extracted data structure. A number of properties signal that it is an os384 app, and that the file/contents wrapper is for SBFS, specifically type fileSetV03.[^6]



SBFS is the general term for file-system-related capabilities in os384. Just like in "real" operating systems, advanced users are welcome to define their own packaging formats for apps, in which case they simply need to provide a generic loader packaged with SBFS, which could then in turn untangle whatever approach desired.

In SBFS, there are no directories, only sets. There is no "physical" storage, or "unique" storage (e.g. per-device), so "files" are always members of a "file set". A single file is simply a set with one member (as in this example).

When you store files in SBFS, you will typically be importing from some other system, such as your local hard drive. For this, os384 comes with a "File Helper", shown in <FigureRef id="file-helper" />, which allows you to drag-and-drop any set of files or directories, and the file helper will construct an SBFS File Set from the files.
  
<Figure id="sbfs-shard-contents" caption="Sample contents of an SBFS shard." src="/images/sbfs_23.jpg" align="center" width="90%" />

<Figure id="file-helper" caption="The default os384 'File Helper'" src="/images/sbfs_24.jpg" align="center" width="90%" />

In the figure, we have selected the latest set, which contains the "tinyApp.html" example from earlier. The File Helper will show, amongst other things, a link to that set.



If we click on that link, we will proceed down the path shown in <FigureRef id="opening-html-file" />. The link is of the format we introduced earlier, so the loader (parent) will use the fragment information, use it to fetch and decrypt the shard, then look at the resulting contents, e.g. along the lines of what is shown in <FigureRef id="sbfs-shard-contents" />, and in this example see that it is simply a directory of files with only one file (tinyApp.html). Since there is no "index.html", it will treat it the same as if you were to open a local directory in your browser. And you can then click on "tinyApp.html" and see that app.

<Figure id="opening-html-file" caption="Opening an HTML file." src="/images/sbfs_25.jpg" align="center" width="90%" />

<Figure id="url-flow" caption="Highlighting the URL flow of app launching." src="/images/sbfs_26.jpg" align="center" width="90%" />

<FigureRef id="url-flow" /> walks us through the specifics of the links / URLs / subdomains. We start with "384.dev/#..." which launches a top-level view, the os384 loader, which is sort of like a login screen.[^7]


This view won't (and can't) "launch" your application directly. It requires your permission.[^8] If you provide that, it will launch the app, which in this case is simply a directory view.[^9]

But the manner this is done is as shown previously in Figure 21 – a parent tab (on 384.dev) opens a new tab, with the chosen subdomain (in this case juhp.384.dev). Specifically, it will load a new tab with this URL:

```
https://ak6j.384.dev/web384load.html#TDZHuL1XTNj89Cbbqd... 
```

Similar to the previously introduced "reset" file, "web384load.html" is magical: if a service worker is already running in that location, it will "blow out" any cache contents of any other app, and serve up the loader (index.html), no matter what. This is in order to allow applications themselves to have "index.html". In other words, the trick of reserving "/web384load.html" as a file name is such that regardless of what is in the service worker cache, it will deliver the actual os384 loader.



That instance of the loader can now inspect, again, it's fragment. But it can also see that it is operating in the subdomain "juhp". Thus, this copy/instance of the loader knows it's safe to load the requested app "on top of itself".

In this case, it also sees that there's a File Set. So it extracts the files, loads up the service worker cache with them, and displays the directory view discussed above.
  
<Figure id="cache-storage" caption="'Application/Cache Storage' view." src="/images/sbfs_27.jpg" align="center" width="90%" />

The directory view "app" will then encounter a virtual file system, as shown in <FigureRef id="cache-storage" />. So when you click on a file that's in that directory, it will show that HTML file, essentially as if it were part of a static web site.[^10]

This closes/completes the loop. In the example we're opening a trivial HTML file (tinyApp.html), but it could be anything. In fact, if you look back at <FigureRef id="file-helper" />, the File Helper is itself deployed as an SBFS app. And new versions of the File Helper are deployed … using the File Helper.[^11]

<FigureRef id="multiprogramming" /> gives an overview and summarizes most of what we've covered in this section: an architecture for writing and running genuinely free applications.[^12]
  
<Figure id="multiprogramming" caption="Multiple os384 and multiprogramming in your browser. For clarity, individual pages (apps) are shown as separate 'windows', but in reality, windowing is done by the browser: apps are tabs, that could be in a single window, or in separate ones. Any tab opened to the top level (loader), in this case 384.dev, will have zero or more apps that it has opened. The only way to open/launch an os384 app in your browser is through the top level. The diagram also shows how control and communication is accomplished locally. A loader tab launching an app establishes a parent/child relationship, and the child (app) can request resources through this connection. Broadcast channels are used for 'peer' communication, thus if there are multiple loader tabs open they can communicate directly, and similarly any given app can be opened multiple times and can find and communicate with its siblings. All the top-level (loader) pages collaboratively are what constitutes 'os384' locally. For example, they will coordinate amongst themselves to make sure that if there are two tabs on the same subdomain (origin), in the example 'bb73', then those tabs must be running the same (identical) application. If the user is 'logged in' on any one top-level open loader, then any other top-level tab receives those credentials; this is the Wallet/Vault capability presented below. Note that service workers (not shown) operate on an origin-basis, thus in this example there would be one such worker for both 'bb73' tabs, and separate instances for 'akj6' and 'viiv'." src="/images/sbfs_28.jpg" align="center" width="90%" />


So far we have only vaguely referenced how things are running inside a browser. To go deeper, we need to first pause and discuss in some more detail what a "browser" is today (2024).



[^1]: The "browser" becomes our execution container, with the advent of technologies like wasm, WASI, webSIMD, etc., this means that more or less literally any application can be cross compiled to run in a browser tab.

[^2]: The necessary os384 code is fetched from the main library ("lib384"), and in this example is served from a "Page" named "7938Nx0w". Pages are a feature of Channels, and we will introduce them later on. For now, you just need to know that a Page can serve up any single MIME object, in this case type "application/javascript".

[^3]: The fragment (hash) was intended to be used to reference within a resource and was originally omitted from going onto the network to prevent information providers from denying accesses based on where in a resource a reader wanted to go.

[^4]: Throughout we will use our dev server as example name of the TLD of wherever os384 is being hosted.

[^5]: Not Base64. os384 primarily uses [Base62](/glossary#base62) throughout, resorting to Base64 or Base64URL only when needed for interoperability. For details and the os384 reference implementation see Appendix D: Base62.

[^6]: Traditionally in operating systems, this would be called a "container", but for obvious reasons we avoid that term in SBFS.

[^7]: In this case we are "logged in"; we will cover this when we get to User Accounts below.

[^8]: This is somewhat similar to when you've downloaded an app "from the internet", and if you try and run it on Windows or MacOS, the system will ask you for a confirmation since it's not a "trusted" application.

[^9]: Technically, it's an on-the-fly generated app that displays the directory contents as you would expect them to look if you opened a local directory. In fact, it uses the exact same code that Chromium uses for this purpose.

[^10]: There's a slight performance bug demonstrated in Figure 26: the loader instantiates another subdomain ("ak6j") because you're clicking on a web page, when it could continue to use "juhp". It's being a bit too conservative.

[^11]: In order to bootstrap the File Helper the first time, we had a modified version that could run locally.

[^12]: Sometimes referred to as "web3" apps, or "dApps".
 
