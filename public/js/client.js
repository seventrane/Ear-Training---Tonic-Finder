const apiFetch = async (url, method, body) => {
    method = method || "GET";
    const opts = { method };
    if (body) {
        opts.headers = {
            "Content-Type": "application/json",
        };
        opts.body = JSON.stringify(body);
    }

    const resp = await fetch(url, opts);
    if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`Error from API: ${resp.statusText}: ${text}`);
    }
    return resp;
};

const initTodo = () => {
    // INSERT CODE HERE
}

initTodo();


let globalVol = 1;
let globalNoteVol = 1;
const keys = document.querySelectorAll('.key, .black-key');

const songs = document.querySelectorAll('.song');
const songKeys = document.querySelectorAll('.keysWrapper > div');
const btn = document.querySelector('.stop_music');

volume.addEventListener("input", (e) => {
   const currentSong = document.querySelector('div.playing');
   let audio = document.querySelector(`audio[data-sound="${currentSong.dataset.song}"]`);
     
   audio.volume = e.currentTarget.value / 100;
   globalVol = audio.volume;   
});

volume2.addEventListener("input", (e) => {
   const currentKey = document.querySelector('.key');
   
   let audio = document.querySelector(`audio[data-sound="${currentKey.dataset.note}"]`);
   
   audio.volume = e.currentTarget.value / 100;
   globalNoteVol = audio.volume;   
});

btn.addEventListener('click', () => {
 const currentSong = document.querySelector('div.playing');
 stopSong(currentSong.dataset.song);
});

function playSound(note) {
    const audio = document.querySelector(`audio[data-sound="${note}"]`);
    if (!audio) return;
    audio.currentTime = 0;
    audio.volume = globalNoteVol;
    audio.play();
}

function playSong(note) {
    if (currPlaying = document.querySelector('div.playing')) {
       stopSong(currPlaying.dataset.song);
    };
    
    const audio = document.querySelector(`audio[data-sound="${note}"]`);
    if (!audio) return;
    audio.currentTime = 0;
    audio.volume = globalVol;
    audio.play();
    const songPlaying = document.querySelector(`div[data-song="${note}"]`);
    const songs = document.querySelectorAll('div.song');
    songs.forEach(song => {
       song.classList.remove('activa');
    });

    songPlaying.classList.add('playing');
    songPlaying.classList.add('activa');
    setTimeout(function (){

     audio.pause();
     songPlaying.classList.remove('playing');
     }, 30000);
}

function stopSong(note) {
   const audio = document.querySelector(`audio[data-sound="${note}"]`);
   audio.pause();
   const songPlaying = document.querySelector('div.playing');
   songPlaying.classList.remove('playing');
}

songs.forEach(song => {
   song.addEventListener('mousedown', () => {
     const note = song.dataset.song;
     playSong(note);
   });
});

songKeys.forEach(key => {
 key.addEventListener('mousedown', () => {
     const currentSong = document.querySelector('div.activa');
     const note = key.dataset.note;
 if(currentSong != null) {
       const currentKey = currentSong.dataset.note;
       const song = currentSong.dataset.song;
       if(note == currentKey) {
         key.classList.add('right');
         songKeys.forEach(key1 => {
           if(key != key1) {key1.classList.remove('wrong');}
         });
         console.log("WIN WIN WIN!");
         stopSong(song);
         setTimeout(function (){
             alert("YOU GOT IT! IT'S "+currentKey);
             key.classList.remove('right');
         }, 200);
        } else {
         key.classList.add('wrong');
         console.log("LOSE LOSE LOSE!");
         console.log(note, currentKey);
        }
     }
});
});

keys.forEach(key => {
   
    key.addEventListener('mousedown', () => {
     const currentSong = document.querySelector('div.playing');
        const note = key.dataset.note;
        playSound(note);
        key.classList.add('active');
    });

    key.addEventListener('mouseup', () => {
        key.classList.remove('active');
    });

    key.addEventListener('mouseleave', () => {
        key.classList.remove('active');
    });

    key.addEventListener('touchstart', (event) => {
        const note = key.dataset.note;
        playSound(note);
        key.classList.add('active');
        event.preventDefault();

        const currentSong = document.querySelector('div.playing');

       if(currentSong != null) {
         const currentKey = currentSong.dataset.note;
         if(note.slice(0,-1) == currentKey) {
           key.classList.add('right');
           console.log("WIN WIN WIN!");
           stopSong(currentKey);
           alert("YOU GOT IT! IT'S "+currentKey);
         } else {
           key.classList.add('wrong');
           console.log("LOSE LOSE LOSE!");
           console.log(note, currentKey);
         }
       }
    });

    key.addEventListener('touchend', () => {
        key.classList.remove('active');
    });
});

window.addEventListener('keydown', (event) => {
    const key = event.key.toUpperCase();
    const keyElement = document.querySelector(`.key[data-note="${key}"]`);
    if (!keyElement) return;
    const note = keyElement.dataset.note;
    playSound(note);
    keyElement.classList.add('active');
});

window.addEventListener('keyup', (event) => {
    const key = event.key.toUpperCase();
    const keyElement = document.querySelector(`.key[data-note="${key}"]`);
    if (!keyElement) return;
    keyElement.classList.remove('active');
});