<a class="btn btn-primary" href="/"><i class="bi bi-arrow-left"></i>  Back</a>

# What It Does
You might have found this site and wondered
> What the hell is a "Socialgraph"?

That question is very valid and I don't know if that is even a term... 
However, what is meant by `Social Graph` in this context is the people you engage with, or the people you don't
engage with, but the people you follow do.  
So it works kind of like "people you follow also followed".

# How It Works
Mastodon allows you to anonymously get the followings of any account (if that account allows it). 
So what this site is, is very simple:

1. Get the people you follow
2. Get the followings of the people you follow
3. Filter the fetched lists for people you already follow
4. Sort the list by the amount of people you know follow the account

Everything is done on your Browser, so the server never sees that information. That is done mainly to avoid 
rate limiting[^eins] by a server. 

[^eins]: Rate limiting means that clients (like your Browser/PC) can only talk to a server X times in X minutes. 
    Mastodon usually has a limit of 300 requests in 5 minutes.

# About
I, the author, am BentiGorlich. I do web development for a living and am a big nerd in my free time. 
I did not participate in any open source projects, yet, because I never quite understood how to get into that.

I also run the mastodon instance [wehavecookies.social](https://wehavecookies.social).
I discovered something like this Mastodon Social Graph a while back. After I looked into this again I found out that 
one has to run a docker container with that and there was no public site where one just could try it out.
So I thought to myself: "It can't be that hard to build something like this". And this project was born.

You can find me here: [@BentiGorlich](https://wehavecookies.social/@BentiGorlich)

