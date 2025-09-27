const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  simulateWindowRefocus: () => {
    ipcRenderer.send('simulate-window-refocus');
  }
});
