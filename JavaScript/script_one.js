console.log("Lets wirte some js code......!!");

let currentSong = new Audio();
let songs = [];
let currFolder;

//Seconds to Minutes converting function......................!
function SecondsToMinutes(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "0";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}
async function getSongs(folder) {
  //fetching songs using URL
  currFolder = folder;
  let a = await fetch(`${folder}/`);
  let response = await a.text();
  //console.log(response);
  //Extracting songs from the response
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let i = 0; i < as.length; i++) {
    const element = as[i];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`${folder}/`)[1]);
    }
  }

  //Showing all the songs on the playlist in web browser
  let songUL = document
    .querySelector(".songlist")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      `<li><img class="invert music-frame" src="all_img/music.svg" alt="music">
        <div class="info">
          <div class="song-name">${song
            .replaceAll("/Songs/", " ")
            .replaceAll(" ", "_")}
          </div>
          <div class="artist-name">Lakhan</div>
      </div>
          <div class="playnow">
          <span>Play Now</span>
          <img class="invert" src="all_img/play.svg" alt="">
        </div></li>`;
    //console.log(song);
  }

  //Attech an event listener to all the songs
  Array.from(
    document.querySelector(".songlist").getElementsByTagName("li")
  ).forEach((e) => {
    //playding the song
    e.addEventListener("click", (element) => {
      //console.log(e.querySelector(".info").firstElementChild.innerHTML);
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });

  
  //console.log(songs);
  return songs;
}

//Function to play the selected song playmusic();
const playMusic = (track, pause = false) => {
  //let audio = new Audio("/Songs/" + track);
  currentSong.src = `${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    played.src = "all_img/pause.svg";
  } else {
    currentSong.pause();
    played.src = "all_img/playsong.svg";
  }

  document.querySelector(".songInfo").innerHTML = decodeURI(track);
  document.querySelector(".songTime").innerHTML = "00:00";
  document.querySelector(".total-time").innerHTML = "00:00";

  // Display total time once the metadata of the song is loaded
  currentSong.addEventListener("loadedmetadata", () => {
    document.querySelector(".total-time").innerHTML = SecondsToMinutes(
      currentSong.duration
    );
  });
};

//Function to display all the albums on the page....
async function displayAlbums() {
  let a = await fetch(`https://patidar-lakhan.github.io/Spotify-Clone/Songs/`);
  //console.log(a);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  //console.log(div);
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".card-container");
  let array = Array.from(anchors);
  for (let i = 0; i < array.length; i++) {
    const e = array[i];
    if (e.href.includes("Songs/")) {
      let folder = e.href.split("/").slice(-2)[1];
      //console.log(folder + " this is a folder");
      // Get the metadata of the folder
      let a = await fetch(`Songs/${folder}/info.json`);
      let response = await a.json();
      //console.log(response);
      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `<div data-folder="${folder}" class="card">
            <div class="play">
                <img src="all_img/play.svg" alt>
            </div>
            <img src="Songs/${folder}/cover.jpeg" alt="Happy-Hits">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`;
    }
  }

  //Load the playlist whenever card is clicked.......
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    // console.log(e);
    e.addEventListener("click", async (item) => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0]);
    });
  });
}

async function main() {
  //get the list of all the songs
  await getSongs("https://patidar-lakhan.github.io/Spotify-Clone/Songs/ncs");
  playMusic(songs[0], true);
  //console.log(songs);

  //Display all the albums on the page....
  await displayAlbums();

  //Listen for time update events
  currentSong.addEventListener("timeupdate", () => {
    //console.log(currentSong.currentTime, currentSong.duration);
    document.querySelector(".songTime").innerHTML = `${SecondsToMinutes(
      currentSong.currentTime
    )}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  //Adding an event listener to seekbar..
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  //add an event listener for hamburger..
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  //add an event listener for close button..
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-110%";
  });

  //Attech and event listeners to play, next and previous...
  played.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      played.src = "all_img/pause.svg";
    } else {
      currentSong.pause();
      played.src = "all_img/playsong.svg";
    }
  });

  //add and event listeners for previous and next buttons....
  previous.addEventListener("click", () => {
    // console.log("Previous button clicked");
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  //Add an event listener for next buttton............
  next.addEventListener("click", () => {
    //console.log("Next button clicked");

    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 <= songs.length - 1) {
      playMusic(songs[index + 1]);
    }
  });


  //adding event listeners for volume button...
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      currentSong.volume = parseInt(e.target.value) / 100;
    });

  //Add Event Listener to Mute the Song Volume
  document.querySelector(".volume>img").addEventListener("click", (e) => {
    console.log("mute", e.target.value);
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currentSong.volume = 0;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentSong.volume = 0.1;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
    }
  });
}

//Calling Main function
//main();


document.addEventListener("DOMContentLoaded", () => {
  main();
});
