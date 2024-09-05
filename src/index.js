import "./styles.css";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/src/plugin/regions";
import Dropzone from "dropzone";

// document.getElementById("app").innerHTML = `
// <h1>Hello Vanilla!</h1>
// <div>
//   We use the same configuration as Parcel to bundle this sandbox, you can find more
//   info about Parcel 
//   <a href="https://parceljs.org" target="_blank" rel="noopener noreferrer">here</a>.
// </div>
// `;

var zoom = 100;

var looping = true;
var isLooping = false;
var currentSpeed = 1.0; // Initial speed

var songName = "";

const wavesurfer = WaveSurfer.create({
    container: "#waveform",
    waveColor: "green",
    progressColor: "blue",
    autoCenter: false,
    cursorWidth: 2,
    cursorColor: "red",
    height: 300,
    normalize: true,
    defaults: { autoCenter: false },
    plugins: [
        RegionsPlugin.create({
            container: "#waveform",
            //dragSelection: true,
            loop: true
            /*
            snapToGridInterval: 1,
            snapToGridOffset: 0
            */

            /*
                        regions: [
                      {
                          start: 60,
                          end: 80,
                          loop: false,
                          color: '#cccccc'
                      }
                  ]
                  */
        })
    ]
});

wavesurfer.enableDragSelection({
    drag: true,
    slop: 1,
    loop: true
});

wavesurfer.on("region-created", function (region) {
    console.log(region.start, region.end);
});

function randomColor(alpha) {
    return (
        "rgba(" +
        [
            ~~(Math.random() * 255),
            ~~(Math.random() * 255),
            ~~(Math.random() * 255),
            alpha || 1
        ] +
        ")"
    );
}

function loadRegions(regions) {
    regions.forEach(function (region) {
        region.color = randomColor(0.1);
        wavesurfer.addRegion(region);
    });
}

function saveRegions() {
    localStorage.setItem(
        songName,
        JSON.stringify(
            Object.keys(wavesurfer.regions.list).map(function (id) {
                let region = wavesurfer.regions.list[id];
                return {
                    start: region.start,
                    end: region.end,
                    attributes: region.attributes,
                    data: region.data
                };
            })
        )
    );
}

wavesurfer.on("region-updated", saveRegions);
wavesurfer.on("region-removed", saveRegions);

/*
wavesurfer.on("region-updated", function (region) {
  var regions = region.wavesurfer.regions.list;
  var keys = Object.keys(regions);
  if (keys.length > 1) {
    regions[keys[0]].remove();
  }
});
*/

songName = "song2.mp3";
wavesurfer.load(songName);

wavesurfer.on("ready", function () {
    //wavesurfer.seekTo(0.5);
    //wavesurfer.autoCenter = false;
    wavesurfer.zoom(100);

    //wavesurfer.addRegion({ start: 1, end: 4, loop: true });
    //wavesurfer.play();

    /*
  
    wavesurfer.addRegion({
      start: 0, // time in seconds
      end: 5, //wavesurfer.getDuration(), // time in seconds
      color: "hsla(100, 100%, 30%, 0.2)",
      loop: false
      // drag: false
    });
  
    */

    if (localStorage.regions) {
        if (localStorage.getItem(songName))
            loadRegions(JSON.parse(localStorage.getItem(songName)));
    }
});

wavesurfer.on("region-dblclick", function (region) {
    region.remove();
});

wavesurfer.on('finish', function () {
    if (isLooping) {
        wavesurfer.play(); // Restart playback if looping is on
    }
});

document.addEventListener(
    "keydown",
    (e) => {
        console.log(e.key);
        if (e.which === 32) {
            wavesurfer.playPause();
        }

        if (e.key === "ArrowLeft") {
            const wasPlaying = wavesurfer.isPlaying();
            wavesurfer.skip(-2);
            wasPlaying && wavesurfer.play();
        }

        if (e.key === "ArrowRight") {
            const wasPlaying = wavesurfer.isPlaying();
            wavesurfer.skip(2);
            if (
                wasPlaying &&
                wavesurfer.getCurrentTime() < wavesurfer.getDuration()
            ) {
                wavesurfer.play();
            }
        }

        if (e.key === "Enter") {
            const keys = Object.keys(wavesurfer.regions.list);
            wavesurfer.regions.list[keys[0]].loop = true;
            wavesurfer.regions.list[keys[0]].play();
        }
    },
    true
);

document.getElementById("zoomin").onclick = () => {
    zoom = zoom * 2;
    wavesurfer.zoom(zoom);
};

document.getElementById("zoomout").onclick = () => {
    zoom = zoom / 2;
    wavesurfer.zoom(zoom);
};

document.getElementById("playbutton").onclick = () => {
    wavesurfer.playPause();
};

document.getElementById("seekbutton").onclick = () => {
    //wavesurfer.seekTo(0.25);
    //wavesurfer.setCurrentTime(11.5);
    //wavesurfer.play();
    //wavesurfer.skip(2);

    //wavesurfer.toggleScroll();
    wavesurfer.drawer.wrapper.scrollLeft = 0;
};

document.getElementById("seekbutton2").onclick = () => {
    //wavesurfer.seekTo(0.25);
    //wavesurfer.setCurrentTime(11.5);
    //wavesurfer.play();
    //wavesurfer.skip(2);

    //wavesurfer.drawer.recenter(wavesurfer.getcurrent);
    //wavesurfer.seekAndCenter(wavesurfer.backend.getPlayedPercents());

    wavesurfer.drawer.wrapper.scrollLeft =
        wavesurfer.drawer.wrapper.scrollWidth *
        wavesurfer.backend.getPlayedPercents();
};

document.getElementById("loop").onclick = () => {
    looping = !looping;
    Object.keys(wavesurfer.regions.list).map((key) => {
        const region = wavesurfer.regions.list[key];
        region.loop = looping;
    });
};

document.getElementById('loopToggle').addEventListener('click', function () {
    isLooping = !isLooping; // Toggle loop state
    this.textContent = isLooping ? 'Entire Loop: ON' : 'Entire Loop: OFF'; // Update button text
});

function updateSpeedDisplay() {
    document.getElementById('currentSpeed').textContent = `Speed: ${currentSpeed.toFixed(1)}x`;
}

document.getElementById('speedUp').addEventListener('click', function() {
    if (document.getElementById("preprocess").files[0]) {

        if (currentSpeed < 3.0) {
            currentSpeed += 0.1;
            wavesurfer.setPlaybackRate(currentSpeed);
            updateSpeedDisplay();
        }
    } else {
        window.alert('File is not selected.')
    }
});

document.getElementById('speedDown').addEventListener('click', function() {
    if (document.getElementById("preprocess").files[0]) {

        if (currentSpeed > 0.5) {
            currentSpeed -= 0.1;
            wavesurfer.setPlaybackRate(currentSpeed);
            updateSpeedDisplay();
        }
    } else {
        window.alert('File is not selected.')
    }
});

var myDropzone = new Dropzone("form#my-awesome-dropzone", {
    url: "/file/post"
});

document.getElementById("preprocess").addEventListener(
    "change",
    function (e) {
        var file = this.files[0];

        if (file) {
            var reader = new FileReader();

            reader.onload = function (evt) {
                // Create a Blob providing as first argument a typed array with the file buffer
                var blob = new window.Blob([new Uint8Array(evt.target.result)]);

                // Load the blob into Wavesurfer
                songName = file.name;
                wavesurfer.loadBlob(blob);
            };

            reader.onerror = function (evt) {
                console.error("An error ocurred reading the file: ", evt);
            };

            // Read File as an ArrayBuffer
            reader.readAsArrayBuffer(file);
        }
    },
    false
);

/*
document.getElementById("preprocess").onchange = () => {
  const reader = new FileReader();
  reader.onload = () => {
    $("#data-uri").text(reader.result.slice(0, 64) + "...");
    addBlob(dataURItoBlob(reader.result));
  };
  reader.readAsDataURL(this.files[0]);
};
*/

/*
wavesurfer.regions.list["your id"].play()
*/

// https://stackoverflow.com/questions/40507742/delete-region-using-a-button-on-the-region-itself
