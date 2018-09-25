// Constants to refer to state values
const S_PLAYER_JOIN = 0
const S_P1_SELECT = 1
const S_P2_SELECT = 2
const S_COMPARE = 3
const S_MATCH_OVER = 4

// Local state-tracking variable
let state

// Database reference
let database = firebase.database()

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

            // Put player name into database
            let ref = database.ref("/players/player1")
            ref.onDisconnect().remove()
            ref.set({
                name: name
            })

            // Hide name entry
            $("#nameForm").hide()

            // Make buttons in Player 1 area
            makeRPSbuttons( $("#player1Selection") )
            state = S_P1_SELECT
            database.ref().update({state: S_P1_SELECT})

        } else {
            console.log("Player 1 already exists")

            // Check if player 2 exists
            
            if (!snap.hasChild("player2")) {
                console.log("P2 doesn't Exist")
    
                let ref = database.ref("/players/player2")
                ref.onDisconnect().remove()
                ref.set({
                    name: name
                })
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

// Detects changes to Player 1's name
database.ref("/players/player2").on("value", function(snap) {
    let player = snap.val()
    if (player != null) {
        $("#player2Name").text(player.name)
    } else {
        $("#player2Name").html("&nbsp;")
    }
})

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
function makeRPSbutton(name) {
    let button = $("<button>")
    let src;
    switch (name) {
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
    button.append( $("<img>").attr("src", src) )

    button.on("click", function() {
        // Move to next state
        state = S_P2_SELECT
        database.ref().update({state: S_P2_SELECT})

        // Push choice to database
        database.ref("/players/player1").update({choice: name})

        // Remove buttons and display selection
        $(this).parent().empty().append( $("<img>").attr("src", src) )
    })

    return button;
}