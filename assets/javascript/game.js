let database = firebase.database()

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
            console.log("P1 doesn't Exist")

            let ref = database.ref("/players/player1")
            ref.onDisconnect().remove()
            ref.set({
                name: name
            })
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