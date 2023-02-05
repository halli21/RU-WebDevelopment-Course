var synth = new Tone.Synth().toDestination();
var record = document.getElementById("recordbtn");
var stop_rec = document.getElementById("stopbtn");
var tunes = [];
var start_time = {};
var url = 'https://veff2022-h3.herokuapp.com/api/v1/tunes';


function playNote (clicked_id) {
  synth.triggerAttackRelease(clicked_id, "8n");
  console.log("Note played:", clicked_id)
  if (record.disabled === true) {
      tunes.push({note: clicked_id, duration: "8n", timing:(Date.now() - start_time.time)/1000})
      console.log({note: clicked_id, duration: "8n", timing:(Date.now() - start_time.time)/1000});
  }
}

document.addEventListener("keydown", clickedNote);

function clickedNote(event) {
    if (event.key === "a") {
        playNote("c4");
    }
    if (event.key === "w") {
        playNote("c#4");
    }
    if (event.key === "s") {
        playNote("d4");
    }
    if (event.key === "e") {
        playNote("d#4");
    }
    if (event.key === "d") {
        playNote("e4");
    }
    if (event.key === "f") {
        playNote("f4");
    }
    if (event.key === "t") {
        playNote("f#4");
    }
    if (event.key === "g") {
        playNote("g4");
    }
    if (event.key === "y") {
        playNote("g#4");
    }
    if (event.key === "h") {
        playNote("a4");
    }
    if (event.key === "u") {
        playNote("bb4");
    }
    if (event.key === "j") {
        playNote("b4");
    }
    if (event.key === "k") {
        playNote("c5");
    }
    if (event.key === "o") {
        playNote("c#5");
    }
    if (event.key === "l") {
        playNote("d5");
    }
    if (event.key === "p") {
        playNote("d#5");
    }
    if (event.key === ";") {
        playNote("e5");
    }
}

function getSongs(){
    axios.get(url)
        .then(function (rsp) {

    for (let i=0;i<rsp.data.length;i++) {
        var option =  document.createElement("option");
        option.value = rsp.data[i].id;
        option.innerHTML = rsp.data[i].name;
        document.getElementById("tunesDrop").appendChild(option);
        }
    })
}

function playSongs(){
    var tunes = document.getElementById("tunesDrop").value;
    axios.get(url)
        .then(function (rsp) {

            console.log(rsp);
            var now = Tone.now();

            for (let i=0;i<rsp.data.length;i++) {
                if (tunes === rsp.data[i].id){
                    var song = rsp.data[i].tune;

                    for (let j=0; j<song.length; j++){
                        synth.triggerAttackRelease(song[j].note, song[j].duration, now + song[j].timing);
                    }
                }
            }})
        .catch(function (error) {
            console.log(error);
            })
        .then(function () {
        });
    }

document.getElementById("stopbtn").disabled = true;

function recordSong(){
    start_time.time = Date.now();
    if (record.disabled === false){
        record.disabled = true;
        stop_rec.disabled = false;
        }
    return start_time
    }

function createSong(id, name){
    var option =  document.createElement("option");
    option.value = id;
    option.innerHTML = name;
    document.getElementById("tunesDrop").appendChild(option);
    }

function postRecord(){
    let record_name = document.getElementById("recordName").value;

    if (stop_rec.disabled === false){
        stop_rec.disabled = true;
        record.disabled = false;
        if (tunes.length === 0) {
            console.log("Nothing was recorded");
        }
        else {
            if (record_name === "") {
                record_name = "Unnamed Tune"
            }
            axios.post(url, {
                "name": record_name,
                "tune": tunes
            })
            .then(function(rsp) {
                createSong(rsp.data.id, rsp.data.name);
            })
            .catch(function(rsp) {
                console.log(rsp);
            })
            .then(function() {
            })
            tunes = [];
            }
            
        }
    }
getSongs();