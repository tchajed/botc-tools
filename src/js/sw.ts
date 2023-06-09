import { Workbox } from "workbox-window";
if ("serviceWorker" in navigator) {
  const wb = new Workbox("./service-worker.js");

  wb.addEventListener("activated", (event) => {
    if (!event.isUpdate) {
      console.log("app is now available offline");
    } else {
      console.log("updated");
    }
  });

  // This approach is from
  // https://developer.chrome.com/docs/workbox/handling-service-worker-updates/#do-you-need-to-show-a-prompt
  //
  // It's the simple version. The complicated version is at
  // https://redfin.engineering/how-to-fix-the-refresh-button-when-using-service-workers-a8e27af6df68.

  const showSkipWaitingPrompt = async () => {
    console.log(
      `A new version of the app is available and ` +
        `will be installed when all tabs are closed.`
    );

    // Assuming the user accepted the update, set up a listener
    // that will reload the page as soon as the previously waiting
    // service worker has taken control.
    wb.addEventListener("controlling", () => {
      // At this point, reloading will ensure that the current
      // tab is loaded under the control of the new service worker.
      // Depending on your web app, you may want to auto-save or
      // persist transient state before triggering the reload.
      if ("reloadSafe" in window && window.reloadSafe) {
        window.location.reload();
      }
    });

    // When `event.wasWaitingBeforeRegister` is true, a previously
    // updated service worker is still waiting.
    // You may want to customize the UI prompt accordingly.

    // This code assumes your app has a promptForUpdate() method,
    // which returns true if the user wants to update.
    // Implementing this is app-specific; some examples are:
    // https://open-ui.org/components/alert.research or
    // https://open-ui.org/components/toast.research
    const updateAccepted = true;

    if (updateAccepted) {
      wb.messageSkipWaiting();
    }
  };

  wb.addEventListener("waiting", () => {
    showSkipWaitingPrompt();
  });

  wb.register();

  setInterval(() => {
    wb.update();
  }, 20 /* min */ * 60 * 1000);
}
