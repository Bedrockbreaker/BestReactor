# BestReactor
Tries to find the "best" big (or extreme) reactor with a given size.<br>
Reactor Simulator site (https://br.sidoh.org/) is made by sidoh: https://github.com/sidoh

## How to install:
1. Install [Tampermonkey](https://tampermonkey.net/)
2. Go to https://github.com/Bedrockbreaker/BestReactor/raw/master/BestReactor.user.js and click "Install".
3. Note! **DO NOT** install scripts if you do not know *exactly* what they do. I'm still some just some random guy on the internet. Harmful/malicious scripts can steal passwords and/or credit card information! You have been warned..

## How to use:
1. Go to https://br.sidoh.org/ and click "New Reactor".
2. Enter the desired length and width of the reactor. Careful! the longer these are, the exponetially longer it takes for this script to find the best reactor!
3. Fill the entire reactor with Cryotheum.
4. Place 1 reactor control rod in the upper-left corner.
5. The script should start automatically. And when it's done, it should stop automatically.
6. Note! Occasionally, the website may say "Too many requests. Please slow down." This will cause the bot to stop functioning. Simply refresh the page to get the bot running again. Don't worry! No progress has been lost towards finding the best reactor. If you are running this bot for several hours, I would recommend an auto clicker on the refresh button of your browser clicking every couple of seconds, just to be safe.
7. Note #2! This script uses cookies! Trying to run the bot in incognito mode will make the bot never store the best reactor in cookies, and therefore, never actually find the best reactor.

## How to view the current best reactor:
1. Open the developer tools, and click on "Console". Make sure to check "Preserve log".
2. For Chrome: Click on the 3 dots in the upper-right corner of your browser. Go to "more tools", and click on "delevoper tools"
3. A new window should have opened. In the menu at the top of the window, click "Console".
4. Check the box next to "Preserve log". That keeps the log from clearing on page refreshes.
5. You should now see messages such as "Navigated to https://br.sidoh.org/" and "New best reactor: https://br.sidoh.org/#reactor-design?length=6&width=6&height=5&activelyCooled=false&controlRodInsertion=0&layout=7XC2XC14XC2XC7X with 28178.99 rf/t."
6. Simply copy/paste the last link the bot finds, when finished, into the URL to see the design of it.

## How it works (in 11 "easy" steps!):
1. It retrieves the rf/t from the HTML when it's loaded.
2. If the current reactor has a higher rf/t output than what's stored in cookies, it replaces the stored reactor with the current one.
3. It extracts the "layout=" tag in the URL, and sends that through a decoder.
4. The decoder then converts the extracted string into a 2d array, with each character representing a block in the reactor.
5. It strips the array of everything except the upper left corner, which is defined as Math.ceil(length / 2) * Math.ceil(width / 2)
6. It then converts that corner into a base 10 number, by replacing the "X"'s and "C"'s with 1's and 0's, respectively, and then converting that string of binary.
7. It adds 1 to that number, re-converts it into binary, and replaces the upper-left corner with that.
8. It then mirrors that corner across each axis, effectively making the entire reactor 4-fold rotaionally symmetric.
9. The mirrored array is then joined into a string, and sent to the encoder.
10. The encoder takes the string, and replaces all of the 1's and 0's with "X"'s and "C"'s, respectively.
11. Finally, the string of characters is re-inserted into the URL, and page is reloaded, repeating the entire process.
