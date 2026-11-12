const shareButton = document.querySelector('.share');
const status = document.querySelector('#share-status');
shareButton.addEventListener('click', async () => {
  const local = ['localhost', '127.0.0.1', ''].includes(location.hostname) || location.protocol === 'file:';
  const message = 'Vote Kairos #2 — The time for change is now.';
  const text = local ? message : `${message} ${location.href.split('#')[0]}`;
  try {
    if (navigator.share && !local) {
      await navigator.share({ title: document.title, text: message, url: location.href.split('#')[0] });
      status.textContent = 'Thanks for sharing Kairos!';
    } else if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      status.textContent = local ? 'Campaign message copied! A shareable website link will be available after hosting.' : 'Campaign link copied!';
    } else {
      status.textContent = text;
    }
  } catch (error) {
    if (error.name !== 'AbortError') status.textContent = `Share this message: ${text}`;
  }
});
