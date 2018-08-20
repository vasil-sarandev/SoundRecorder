let soundVolume = 0.5;
let sound;
let progress;
let soundId;
var recording = false;
let loopSong = false;
let timeOut = setInterval(function(){step()}, 1000);

function changeAutoPlay(val){
    loopSong = val;
    pauseSound(window.Axis_pauseBtn);
    sound = null;
    playSound(window.Axis_playBtn);
}

function volumeChanged(val){
    
    if(val){
        soundVolume = val;
        Howler.volume(val);
        console.warn("current volume: "+val);
    }
}
function playSound(el){
    let announcementsSpan = window.Axis_announcements;
    if(el.style.opacity!=1){
        //do nothing because there's still no sound.
    }
    else{
        if(sound!=null){
            sound.play();
        }    
        else{
            sound = new Howl({
                src: [window.blobUrl],
                format: ['wav'],
                loop:loopSong
              });
              //event handlers
              sound.on('load', function(){
                
              });
              sound.on('play', function(){
                announcementsSpan.innerHTML = "Playing recording."
              });
              sound.on('pause', function(){
                if(recording){
                    //do nothing
                }
                else{
                    if(announcementsSpan.innerHTML == "Recording ended."){
                        //do nothing
                    }
                    else{
                        announcementsSpan.innerHTML = "Recording paused."
                    }
                }                
              });
              sound.on('end', function(){
                step();
                if(!loopSong){
                    pauseSound(window.Axis_pauseBtn);
                }
                announcementsSpan.innerHTML = "Recording ended."
                
              });
            
            soundId = sound.play();
            Howler.volume(soundVolume);
        }
        
        let Btns = el.parentNode.children;
        for(let i=0;i<Btns.length;i++){
            if(Btns[i].id=="pauseBtn"){
                console.warn("found it!");
                Btns[i].classList.remove("inactiveBtn");
                Btns[i].classList.add("activeBtn");
            }
            if(Btns[i].id=="progress"){
                progress = Btns[i];
                console.warn(progress);
            }
        }
        
        el.classList.add("inactiveBtn");
    }
}


function pauseSound(el){
    
    sound.pause();
    let Btns = el.parentNode.children;
    for(let i=0;i<Btns.length;i++){
        if(Btns[i].id=="playBtn"){
            Btns[i].classList.remove("inactiveBtn");
            Btns[i].classList.add("activeBtn");
        }
    }
    el.classList.add("inactiveBtn");
}
function formatTime(secs)  {
    var minutes = Math.floor(secs / 60) || 0;
    var seconds = (secs - minutes * 60) || 0;

    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}
function step() {
    
    // Get the Howl we want to manipulate.

    // Determine our current seek position.

    // If the sound is still playing, continue stepping.
    if(sound){
        if (sound.playing()) {
            //todo
            var seek = sound.seek() || 0;
            window.Axis_timerRemaining.innerHTML = (formatTime(Math.ceil(seek)));
            window.Axis_timerTotal.innerHTML = (formatTime(Math.round(sound.duration())));
            progress.style.width = (((Math.ceil(seek) / sound.duration()) * 100) || 0) + '%';
            console.warn(progress);
        }
    }
    
  }