# Mastodon Social Graph
You might have found this site and wondered
> What the hell is a "Socialgraph"?

That question is very valid and I don't know if that is even a term...
However, what is meant by `Social Graph` in this context is the people you engage with, or the people you don't
engage with, but the people you follow do.  
So it works kind of like "people you follow also followed".

## How It Works
Mastodon allows you to anonymously get the followings of any account (if that account allows it).
So what this site is, is very simple:

1. Get the people you follow
2. Get the followings of the people you follow
3. Filter the fetched lists for people you already follow
4. Sort the list by the amount of people you know follow the account

Everything is done on your Browser, so the server never sees that information. That is done mainly to avoid
rate limiting by a server. Rate limiting means that clients (like your Browser/PC) can only talk to a server X times in X minutes.
Mastodon usually has a limit of 300 requests in 5 minutes.