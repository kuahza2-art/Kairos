(() => {
  const root = document.documentElement;
  const overlay = document.getElementById('site-loader');
  if (!overlay || !root.classList.contains('kairos-loading')) return;
  const minute = document.getElementById('loading-minute');
  const hour = document.getElementById('loading-hour');
  const status = document.getElementById('loading-status');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const began = performance.now();
  let frame, closing = false, minuteAngle = 0, hourAngle = 0;
  const paint = () => {
    minute.setAttribute('transform', `rotate(${minuteAngle} 100 100)`);
    hour.setAttribute('transform', `rotate(${hourAngle} 100 100)`);
  };
  const spin = now => {
    const clockMinutes = 116 * (1 - Math.exp(-(now - began) / 1600));
    minuteAngle = clockMinutes * 6;
    hourAngle = clockMinutes * .5;
    paint(); frame = requestAnimationFrame(spin);
  };
  const remove = () => {
    root.classList.remove('kairos-loading');
    overlay.remove();
    clearTimeout(window.kairosLoaderFallback);
  };
  function finish() {
    if (closing) return;
    closing = true; cancelAnimationFrame(frame);
    const startMinute = minuteAngle, startHour = hourAngle;
    const endMinute = 720;
    const endHour = 60;
    const settling = performance.now();
    function settle(now) {
      const t = reduced ? 1 : Math.min(1, (now - settling) / 2000);
      const eased = 1 - Math.pow(1 - t, 3);
      minuteAngle = startMinute + (endMinute - startMinute) * eased;
      hourAngle = startHour + (endHour - startHour) * eased;
      paint();
      if (t < 1) { frame = requestAnimationFrame(settle); return; }
      // Exact final state: minute at XII, hour at II (2:00).
      minuteAngle = 0; hourAngle = 60; paint();
      status.textContent = '2:00 PM · Our moment is now.';
      setTimeout(() => {
        overlay.classList.add('is-leaving'); setTimeout(remove, reduced ? 0 : 450);
      }, reduced ? 150 : 1200);
    }
    frame = requestAnimationFrame(settle);
  }
  paint();
  if (!reduced) frame = requestAnimationFrame(spin);
  const loaded = document.readyState === 'complete' ? Promise.resolve() : new Promise(resolve => window.addEventListener('load', resolve, {once:true}));
  const fonts = document.fonts ? Promise.race([document.fonts.ready, new Promise(resolve => setTimeout(resolve, 2000))]) : Promise.resolve();
  Promise.race([Promise.all([loaded, fonts]), new Promise(resolve => setTimeout(resolve, 7500))])
    .then(() => setTimeout(finish, Math.max(0, 3000 - (performance.now() - began))));
})();
