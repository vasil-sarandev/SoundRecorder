
(function(window){

    var WORKER_PATH = 'recorder/recorderWorker.js';
  
    var Recorder = function(source, cfg){
      var config = cfg || {};
      var bufferLen = config.bufferLen || 4096;
      this.context = source.context;
      if(!this.context.createScriptProcessor){
         this.node = this.context.createJavaScriptNode(bufferLen, 2, 2);
      } else {
         this.node = this.context.createScriptProcessor(bufferLen, 2, 2);
      }
     
      var worker = new Worker(config.workerPath || WORKER_PATH);
      worker.postMessage({
        command: 'init',
        config: {
          sampleRate: this.context.sampleRate
        }
      });
      var recording = false,
        currCallback;
  
      this.node.onaudioprocess = function(e){
        if (!recording) return;
        worker.postMessage({
          command: 'record',
          buffer: [
            e.inputBuffer.getChannelData(0),
            e.inputBuffer.getChannelData(1)
          ]
        });
      }
  
      this.configure = function(cfg){
        for (var prop in cfg){
          if (cfg.hasOwnProperty(prop)){
            config[prop] = cfg[prop];
          }
        }
      }
  
      this.record = function(){
        recording = true;
        window.Axis_announcements.innerHTML = "Recording."
      }
  
      this.stop = function(){
        recording = false;
      }
  
      this.clear = function(){
        worker.postMessage({ command: 'clear' });
      }
  
      this.getBuffers = function(cb) {
        currCallback = cb || config.callback;
        worker.postMessage({ command: 'getBuffers' })
      }
  
      this.exportWAV = function(cb, type){
        currCallback = cb || config.callback;
        type = type || config.type || 'audio/wav';
        if (!currCallback) throw new Error('Callback not set');
        worker.postMessage({
          command: 'exportWAV',
          type: type
        });
      }
  
      this.exportMonoWAV = function(cb, type){
        currCallback = cb || config.callback;
        type = type || config.type || 'audio/wav';
        if (!currCallback) throw new Error('Callback not set');
        worker.postMessage({
          command: 'exportMonoWAV',
          type: type
        });
      }
  
      worker.onmessage = function(e){
        var blob = e.data;
        console.warn(e.data);
        currCallback(blob);
      }
  
      source.connect(this.node);
      this.node.connect(this.context.destination);   // if the script node is not connected to an output the "onaudioprocess" event is not triggered in chrome.
    };
  
    Recorder.setupDownload = function(blob, filename){
      var url = (window.URL || window.webkitURL).createObjectURL(blob);
      window.blobUrl = url;
      let playBtn = window.Axis_playBtn;
      playBtn.style.opacity = 1;
      let autoPlay = window.Axis_autoPlay;
      autoPlay.style.display = "inline-block";
      window.Axis_announcements.innerHTML = "Recording ready for playback."
      window.Axis_volumeInput.style.display = "inline-block";
      window.Axis_volumeLabel.style.display = "inline-block";
      window.Axis_loopLabel.style.display = "inline-block";
      var link = document.getElementById("save");
      link.href = url;
      link.download = filename || 'output.wav';
    }
  
    window.Recorder = Recorder;
  
  })(window);
  