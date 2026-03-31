# Appendix: Strongpin

Encoding binary data (zeroes and ones) in a human-readable format is an old problem, obviously. Base64 is among the earliest and the most successful encodings.

For the generation of random passwords, there have been multiple attempts to define a character set that is large enough to be compact with respect to entropy, and yet avoids some ambiguities.
We would like to use Base32 for the "bigger chunk" of entropy for [Wallets](/glossary#wallet), as discussed above. The question then becomes, which Bases32 to use. Elsewhere, we will walk through how the loader (login function) can effectively help a human user with error detection and correction.

## Choice of Base32
Our objective is very low human error rates, with a focus on a paper-and-pencil context: the use case is where a code should simply not exist in the digital world (not copy-pasted, not stored in password managers, etc.) but only in the physical world (thus for example base 58 is not a reference point).

Obviously, we searched as much as possible to review earlier choices of subsets of letters. However, we could not find any designs that were the result of any sort of rigorous process.

Our starting point was "best practice", including Crockford's b32 and Wilcox' z-base-32. From there we iterated using informal user test feedback. We also looked at the history of writing, the history of typography, the rise of literals, changes in writing technology (e.g. from clay to paper), educational sources indicating which letters children struggle with over others, etc.

*	First, we selected a subset of the 62 alphanumeric characters that are as unambiguous as possible in the context of a human writing down and then later reading back (to themselves). (See [base62](/glossary#base62) for more on os384's encoding choices.)
*	We strove to accomplish an even distribution across numerals, upper case, and lower case.[^1]
*	Next, we organized the most likely ambiguities such that they map clearly – for example, in the image on the right the characters "i", "I", and "l" (lowercase "L") will all "map" to the numeral "1".
*	Finally, organize the resulting 32 to characters into two sets of 16 such that remaining (but less likely) ambiguities correspond to pairs. For example, the pairs 8/B and x/k. This allows us to implement "parity", discussed below.

For the subset selection process, we used the complete NIST database (800,000 images of individual written characters from 3600 writers). We trained our own neural networks to an 80%+ accuracy. We deliberately capped it at around 80% since our objective is to isolate which letter pairs are actually confusing, using neural net training ability as a proxy for the human brain.

<Figure id="character-analysis" caption="Sample working documents for base62 selection: a single-letter 'contact sheet' (for 'q' in this example) showing random selections of how different individuals write down any character; a matrix showing cross-confusion measures; a character-pair ambiguity analysis" src="/images/strongpin_34.png" align="center" width="90%" />

In the end we decided to keep all numerals, even though, for example, keeping "b" is arguably better than using "6". Humans read/write numbers more frequently than letters.

It is notable that using a rigorous technique leads to very different choices for disambiguation than earlier efforts. For example, conventional wisdom has been that the letters "i" and "I" are easily confused with the number "1", or that the letters "o" and "O" are easily confused with the numeral "0". Our research indicates there are at least twelve cases that are more ambiguous, the worst of which is "wW", which on a screen is not so ambiguous when you're reading it, but when you're writing down and then trying to read what you wrote, it's different. Other examples are "pP", "sS", "cC", "kK" etc.

We next designed a font for use with these symbols, when maximum clarity is desired. <FigureRef id="character-set" />  summarizes the resulting character set, in that font.

<Figure id="character-set" caption="The 'base62mi v05.05' character set used for Strongpin" src="/images/strongpin_33.png" align="center" width="80%" />

<Figure id="strongpin-encoding" caption="Strongpin encoding" src="/images/strongpin_35.png" align="center" width="80%" />

## Strongpin Parity Check

The above choice of base62 characters is, we believe, an improvement over previous designs. But we would also like to add some form of checksum. For this we invented a new technique.

<FigureRef id="strongpin-encoding" /> shows the resulting substitution rules, as well as the digital encoding for strongpin characters. They are arranged in a particular pattern: the set of 32 characters are divided into two groups of 16 such that "pairing" between one set and the other will capture as much of the "remaining" ambiguity that's left in the total set of 32.

For example, "x" and "X" are easily confused, so they will map to "x". Which then encodes to 15, or in binary form "01111". "k" and "K" are similarly easily confused, so they map to "k", or binary "11111"

However, "k" and "x" are still somewhat prone to confusion. So they are "paired", such that the value they encode to only differs in the highest bit – "01111" and "11111" respectively.

Similarly, all the other characters are arranged such whichever other character (out of the remaining 32) they are mostly likely to be confused with, is their pair.

<Figure id="parity-calculation" caption="Walk-through of Strongpin parity calculation" src="/images/strongpin_36.png" align="center" width="80%" />

<FigureRef id="parity-calculation" /> shows how we leverage this to provide a checksum function. Strongpins are generated in chunks 19 bits, and the default (as discussed above for Wallets) is four such chunks, for a total of 76 bits of entropy. These are encoded into four sets of four characters for a total of 16.

Each chunk of 19 bits is encoded as 20 bits with one parity, as shown in the figure. From a user perspective, it's just four characters to write down. Instead of 5 bits per character, the final encoding is 4.75 bits per character.

When transcribing and reading back and typing in, the most common errors are first captured by the substitution rules (see <FigureRef id="strongpin-encoding" />). Additional errors are much rarer, but if they do occur, they are most likely to be between characters that in the strongpin encoding differ only on the top bit.

This means that the user can be provided with two types (or stages) of error correction feedback. The first one is on a per-character basis, the second one is on a 4-character-group basis.

<Figure id="ui-interaction" caption="User interface interaction for Strongpin entry" src="/images/strongpin_37.png" align="center" width="80%" />

<FigureRef id="ui-interaction" /> shows the sort of steps a user interface would take, using our example above. The user was originally (upon creation of the Wallet) shown the characters "QE5c" and then wrote down roughly what's shown in the figure. The user makes two errors. The most common one is they are typing in an "S" instead of a "5". This is captured by the substitution rules. Once all individual substitution rules are checked for, the UI can check the strongpin parity, and finds that it's an error. But it can't tell which of the four characters is wrong. For example, the "Q" should perhaps be an "O"?[^2]  Instead, it points out the full set of four and asks the user to double check all of them.

The user is likely to correct just the last character, so now the strongpin passes all the tests.

It's important to stress that all of this functionality with respect to walking a user through possible corrections is done on the client side, in the lib384 library.

In user tests, this overall approach reduces transcription errors to something very small.[^3] 

[^1]: We chose to differ from the preference in RFC 3548 for characters to be case insensitive. This provides more characters to choose from, lower ambiguity, and “compatibility” with existing password systems that tend to require a mix of these. Zooko (Wilcox) is correct in pointing out that lower case (miniscule) letters are easier to read and write (that’s originally why they were developed), but that does not directly translate into less ambiguity. In the context of random characters, as opposed to written language where there is superfluous information to decide on what words are written, choosing only one case (only upper or only lower) foregoes a lot of design space. For example, all combinations of upper- and lower-case “u”, “U”, “v”, and “V” are confusing, so we merge them into only a single symbol (“u”). We need other choices to not be left with less than 32 characters.

[^2]: Note that the computer can’t see the handwriting, in this example the written-down Q is quite clear.

[^3]: In fact, it becomes so small we cannot easily measure it, so well it comes across as a parlor trick.