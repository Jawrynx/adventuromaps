const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  simulateWindowRefocus: () => {
    ipcRenderer.send('simulate-window-refocus');
  }
  ,
  setTitleBarOverlay: (opts) => ipcRenderer.invoke('set-titlebar-overlay', opts)
});
