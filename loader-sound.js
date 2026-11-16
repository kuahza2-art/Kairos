(() => {
  let context, ticks, done = false;
  function noise(duration, start, frequency, endFrequency, volume) {
    const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * duration), context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const source = context.createBufferSource(), filter = context.createBiquadFilter(), gain = context.createGain();
    source.buffer = buffer; filter.type = 'bandpass'; filter.Q.value = .8;
    filter.frequency.setValueAtTime(frequency, start);
    filter.frequency.exponentialRampToValueAtTime(endFrequency, start + duration);
    gain.gain.setValueAtTime(.001, start);
    gain.gain.linearRampToValueAtTime(volume, start + Math.min(.04, duration / 4));
    gain.gain.exponentialRampToValueAtTime(.001, start + duration);
    source.connect(filter).connect(gain).connect(context.destination);
    source.start(start); source.stop(start + duration);
  }
  function tick() {
    if (context?.state === 'running') noise(.065, context.currentTime, 1900, 800, .15);
  }
  function startTicks() {
    if (done || ticks || context?.state !== 'running') return;
    tick(); ticks = setInterval(tick, 360);
  }
  function tryStart() {
    if (done) return;
    try {
      if (!context) {
        context = new (window.AudioContext || window.webkitAudioContext)();
        context.addEventListener('statechange', startTicks);
      }
      if (context.state === 'suspended') context.resume().then(startTicks).catch(()=>{});
      startTicks();
    } catch {}
  }
  function detach() {
    document.removeEventListener('pointerdown', tryStart);
    document.removeEventListener('keydown', tryStart);
  }
  document.addEventListener('pointerdown', tryStart, {passive:true});
  document.addEventListener('keydown', tryStart);
  tryStart();
  window.kairosSounds = {
    finish() {
      done = true; detach();
      if (ticks && context?.state === 'running') {
        clearInterval(ticks); ticks = null;
        const now = context.currentTime;
        // A short rolling rattle blooms into an airy swoosh.
        for (let i=0;i<8;i++) noise(.045,now+i*.045,650+i*90,350,.08);
        noise(.95,now+.25,450,4500,.22);
      }
      clearInterval(ticks); ticks = null;
    },
    stop() { done = true; detach(); clearInterval(ticks); context?.close().catch(()=>{}); }
  };
})();
