import { Workbox } from 'workbox-window';
if ('serviceWorker' in navigator) {
  const wb = new Workbox('./service-worker.js');

  wb.addEventListener('activated', event => {
    if (!event.isUpdate) {
      console.log("app is now available offline");
    }
  });

  wb.addEventListener('waiting', event => {
    console.log(`A new version of the app is available and ` + `will be installed when all tabs are closed.`);
  });

  wb.register();
}
