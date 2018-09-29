// Constants to refer to state values
const S_PLAYER_JOIN = 0
const S_P1_SELECT = 1
const S_P2_SELECT = 2
const S_COMPARE = 3
const S_MATCH_OVER = 4

// Local state-tracking variable
let state

// Local win/loss-tracking variables
let wins, losses

// Local player-tracking variables
let playerName = null
let playerNumber = null

// Database reference
let database = firebase.database()

// Primary state controller
database.ref("/state").on("value", function(snap) {
    state = parseInt(`${snap.val()}`)
    
    switch (state) {
        case S_PLAYER_JOIN: 
            console.log("S_PLAYER_JOIN")
            break;
        case S_P1_SELECT:
            console.log("S_P1_SELECT")
            p1SelectPhase();
            break;
        case S_P2_SELECT:
            console.log("S_P2_SELECT")
            p2SelectPhase();
            break;
        case S_COMPARE: 
            console.log("S_COMPARE")
            comparePhase();
            break;
        case S_MATCH_OVER:
            break;
    }
}) 

$(document).ready(function () {
    // Check if game is in progress by checking if player slots full
    database.ref("/players").once('value', function(snap) {
        if ( !snap.hasChild("player1") && !snap.hasChild("player2") ) {
            // If both slots empty, set game state to S_PLAYER_JOIN
            console.log( "NO GAME IN PROGRESS")
            state = S_PLAYER_JOIN
            database.ref().update({state: S_PLAYER_JOIN})

            database.ref().once("value", function(snap) {
                console.log("STATE: "+snap.val().state)
            })
        } else {
            // Otherwise keep existing game state
            console.log( "GAME IN PROGRESS")
            database.ref().once("value", function(snap) {
                state = snap.val().state
                console.log("STATE: "+snap.val().state)
            })
           
        }
    })
    
})

// Handles click on name button - assigns name to P1 or P2 seat if available
$("#nameSubmit").on("click", function(event) {
    event.preventDefault()

    // Store entered name and blank #nameEntry input
    let name = $("#nameEntry").val().trim()
    $("#nameEntry").val("")
    // TODO: Validate name entry

    // Check if player 1 exists
    database.ref("/players").once('value', function(snap) {
        if (!snap.hasChild("player1")) {
            // Make player into Player 1
            playerName =name
            playerNumber = 1

            // Put player name into database
            let ref = database.ref("/players/player1")
            ref.onDisconnect().remove()
            database.ref().onDisconnect().update({state: 0})

            wins=0
            losses=0;

            ref.set({
                name: name,
                wins: wins,
                losses: losses
            })

            // Hide name entry
            $("#nameForm").hide()

            // Start game if Player 2 also exists
            if ( snap.hasChild("player2") ) {
                database.ref().update({state: S_P1_SELECT})
            }

        } else {
            console.log("Player 1 already exists")

            // Check if player 2 exists
            
            if (!snap.hasChild("player2")) {
                
                // Make player into Player 2
                playerName = name
                playerNumber = 2
    
                // Put player name into database
                let ref = database.ref("/players/player2")
                ref.onDisconnect().remove()
                database.ref().onDisconnect().update({state: 0})

                wins=0
                losses=0;
    
                ref.set({
                    name: name,
                    wins: wins,
                    losses: losses
                })
    
                // Hide name entry
                $("#nameForm").hide()

                // Start game (as P1 already exists)
                database.ref().update({state: S_P1_SELECT})
    
            } else {
                console.log("Player 2 already exists")
            }
            

        }
    })
})

// Detects changes to Player 1's name
database.ref("/players/player1").on("value", function(snap) {
    let player = snap.val()
    if (player != null) {
        $("#player1Name").text(player.name)
    } else {
        $("#player1Name").html("&nbsp;")
    }
})

// Detects changes to Player 2's name
database.ref("/players/player2").on("value", function(snap) {
    let player = snap.val()
    if (player != null) {
        $("#player2Name").text(player.name)
    } else {
        $("#player2Name").html("&nbsp;")
    }
})

// Handler function for S_P1_SELECT phase
function p1SelectPhase() {
    if (playerNumber == 1) {
        // What Player 1 sees
        
        // Make buttons in Player 1 area
        makeRPSbuttons( $("#player1Selection") )

        // Waiting message in Player 2 area
        $("#player2Selection").empty().text("Opponent waiting on your selection")
    } else if (playerNumber == 2) {
        // What Player 2 sees

        // Waiting message in Player 1 area
        $("#player1Selection").empty().text("Opponent is choosing")

        // Waiting message in Player 2 area
        $("#player2Selection").empty().text("Waiting on opponent's selection")
    }

}

// Handler function for S_P2_SELECT phase
function p2SelectPhase() {
    if (playerNumber == 1) {
        // What Player 1 sees

        // Their own selection in Player 1 area

        // Waiting message in Player 2 area
        $("#player2Selection").empty().text("Opponent is choosing")
    } else if (playerNumber == 2) {
        // What Player 2 sees
    
        // Waiting message in Player 1 area
        $("#player1Selection").empty().text("Opponent has chosen")

        // Make buttons in Player 2 area
        makeRPSbuttons( $("#player2Selection") )
    }

}

// Handler for comparison phase
function comparePhase() {
    // Determine winner
    let winner = determineWinner()
    console.log("WINNER: "+winner)

    // Increment wins if player won, losses if player lost, nothing if tie
    if (winner != 0) {
        if (winner==playerNumber) {
            // Add 1 to wins and push to database
            wins++
            database.ref("/players/player"+playerNumber).update({wins: wins})

            // Update notification text
            $("#winDisplay").text("You Won!")
        } else {
            // Add 1 to losses and push to database
            losses++
            database.ref("/players/player"+playerNumber).update({losses: losses})
            
            // Update notification text
            $("#winDisplay").text("You Lost!")
        }
    } else {
        // Update notification text
        $("#winDisplay").text("It's a tie!")
    }

    
    // Go to next phase
    // Determine if match won (3 wins) or if more games need to be played
    if (wins>=3) {
        // Display victory screen
        console.log("Won the match!")
    } else {
        // Play another round
        makeRPSbuttons( $("#player1Selection") )
        database.ref().update({state: S_P1_SELECT})
}
}

// Makes the set of buttons for selecting which symbol to throw, and places them in target jQuery element
function makeRPSbuttons(target) {
    target.empty()
    target.append(
        makeRPSbutton("rock"),
        makeRPSbutton("paper"),
        makeRPSbutton("scissors")
    )
}

// Creates a button for the specified RPS symbol
// Returns a jQuery object with the formatted button
function makeRPSbutton(btnName) {
    let button = $("<button>").addClass("rpsSelector")
    let src;
    switch (btnName) {
        case "rock":
            src = "assets/images/RockHand.png"
            break;
        case "paper":
            src = "assets/images/PaperHand.png"
            break;
        case "scissors":
            src = "assets/images/ScissorsHand.png"
            break;
        default:
            break;
    }
    button.append( $("<img>").addClass("rpsBtnImg").attr("src", src) )

    button.on("click", function() {
        // Move to next state
        if (playerNumber==1) database.ref().update({state: S_P2_SELECT});
        else if (playerNumber==2) database.ref().update({state: S_COMPARE});

        // Push choice to database
        database.ref("/players/player"+playerNumber).update({choice: btnName})

        // Remove buttons and display selection
        $(this).parent().empty().append( $("<img>").addClass("selectedImg").attr("src", src) )

    })

    return button;
}

// Testing dummy for logic testing
function p2SelectTestingDummy() {
    setTimeout(function () {
        // Choice is always "rock" for dummy
        let choice = "rock"

        let src;
        switch (choice) {
            case "rock":
                src = "assets/images/RockHand.png"
                break;
            case "paper":
                src = "assets/images/PaperHand.png"
                break;
            case "scissors":
                src = "assets/images/ScissorsHand.png"
                break;
            default:
                break;
        }

        // Push choice to database
        database.ref("/players/player2").update({choice: choice})
        $("#player2Selection").parent().empty().append( $("<img>").addClass("selectedImg").attr("src", src) )

        // Move to next state
        state = S_COMPARE
        database.ref().update({state: state})

        determineWinner()
    }, 1000)
}

// Compares P1 and P2 selections and determines winner
// Returns number of winning player (1/2), or 0 for a tie
function determineWinner() {
    database.ref("/players").once("value", function(snap) {
        let p1Pick = convertPick( snap.child("player1").val().choice )
        let p2Pick = convertPick( snap.child("player2").val().choice )
        console.log("P1",p1Pick,"P2",p2Pick)


        // Use modular math to find relationship between player and opponent pick
        // Extra +3 is to make sure calculation is not on a negative number
        // Modulus 0 is a tie
        // Modulus 1 is a win for P1/loss for P2
        // Modulus 2 is a win for P2/loss for P1
        return ((p1Pick-p2Pick+3) % 3)  

        //TODO: Fix call, can't return to main function from inside database callback
    })    
}

// Converts pick from string to integer format for analysis
// Returns integer representation
function convertPick(pick) {
    switch (pick) {
        case "rock":     return 1;
        case "paper":    return 2;
        case "scissors": return 3;
        default:         return null;
    }
}

// Checks for chat submissions
$("#chatSubmit").on("click", function(event) {
    event.preventDefault();
    
    if (playerName != null){
        let msg = $("#chatEntry").val();
        
        database.ref("/chat").push({
            username: playerName,
            message: msg,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        })
    }
    $("#chatEntry").val("");
})

// TODO: Add chat messages for disconnects

// Loads chat into log
database.ref("/chat").orderByChild("timestamp").on("child_added", function(snap) {
    let log = snap.val();
    console.log(log)

    let newlog = $("<div>").text(`${log.username}: ${log.message}`)
    $("#chatLog").append(newlog)
    
})