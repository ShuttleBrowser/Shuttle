const electron = require('electron')

// Permet de gérer les evenements système
const app = electron.app

// Permet de gérer les fenetres
const BrowserWindow = electron.BrowserWindow

// Gardez une référence globale de l'objet "window", si vous ne le faites pas, la fenêtre se ferme automatiquement lorsque l'objet JavaScript est nettoyé.
let mainWindow

function createWindow () {
  // Création d'une fenetre en résolution 800x600
  mainWindow = new BrowserWindow({
    width:360,
    height:640,
    resizable: false,
    title: "Shuttle",
    frame: true
  })

  // La fenetre va charger notre fichier index.html
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // Cet evenement est déclenché lorsque la fenetre est fermée
  mainWindow.on('closed', function () {
    // réinitialisation de l'objet "window"
    mainWindow = null
  })
};

// Cet évenement est déclenché lorsque Electron a terminé son initialisation. On lance la création de la fenêtre à ce moment là
app.on('ready', createWindow)

// Cet évenement est déclenché lorque toutes les fenêtres sont fermées (pour notre exemple nous n'avons qu'une seule fenêtre mais il est possble de gérer le multi-fentres)
app.on('window-all-closed', function () {
  // Sur OS X, il est courant que les applications puissent rester active jusqu'à ce que l'utilisateur quitte explicitement via la commande "Cmd + Q"
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // Sur OS X, il est courant de re-créer une fenêtre dans l'application lorsque l'icône du dock est cliqué et il n'y a pas d'autres fenêtres ouvertes.
  if (mainWindow === null) {
    createWindow()
  }
})