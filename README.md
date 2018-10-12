# RPS-Multiplayer
An online multi-client head-to-head Rock/Paper/Scissors game utilizing Firebase

[https://mppennella.github.io/RPS-Multiplayer/](https://mppennella.github.io/RPS-Multiplayer/)

## Features
* User sign-in
* Turn-based RPS gameplay - see [Gameplay Details](#gameplay-details) for more
* Instant chat client

## Gameplay Details

Two players will play matches to best-of-five (three wins), with the option to forfeit. Disconnections will also count as a forfeit.

Once two players have signed in, one will be made Player 1 and the other Player 2, and the game will begin. Play will take place in turns.

Player 1 will be given the option of selecting one of the three options (Rock/Paper/Scissors) for his/her move. This selection will be visible on Player 1's client, but Player 2 will only see that a selection has been made. Once Player 1 has selected, Player 2 will then make a selection in the same manner.

Once both players have selected, the choices will be revealed to all players, and a victor will be determined using the standard Rock-Paper-Scissors formula:
* Paper covers Rock
* Rock crushes Scissors
* Scissors cuts Paper
* Matching choices are a tie

A point will be given to the winning player, or to no player in the event of a tie. If a player has three wins, that player wins the match and the other is the loser. Otherwise, the players play additional rounds as above until one wins the match.
