# wutz-player
This is an electron project which together with wutz-app they work as an online Wurlitzer.

Basically the idea is that you have #wutz-player installed in any computer and load your music catalog as a regular mp3 player. 
We are calling this desktop installed application host.
Then using wutzapp_pg application you can see the host local catalog, pick a song and added to a queue. 
The song will be added to a queue on the host machine once the request arrived. Getting a Wurlitzer effect.

Obs:
- A mix between directory structure and ID3 information is used to get accurate media information. So in order to get a better looking 
catalog, make sure having an ordered catalog structure (Artist -> Album -> Songs) and has correct encoding (UTF-8 Recommended) for ID3 information
is very helpful to have a better looking and easy to browse catalog.

- For now just the version for Windows is working. Linux version should be available pretty soon.