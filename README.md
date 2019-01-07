<div align="center">
<br>
<a href="https://shuttleapp.io" target="_blank"><img width="500" src="https://shuttleapp.io/images/new/logo-p.png" alt="Shuttle"></a>
<br>
<br>
</div>

<p align="center" color="#6a737d">
  <i>The fastest access to your favorite applications.</i><br>
  <a href="https://paypal.me/shuttleapp" target="_blank">Buy us a coffee !</a>
</p>

<div align="center">
  <img src="https://api.travis-ci.org/KazeJiyu/Shuttle.svg?branch=master">   
  <a href="https://snyk.io/test/github/ShuttleBrowser/shuttle?targetFile=package.json"><img src="https://snyk.io/test/github/ShuttleBrowser/shuttle/badge.svg?targetFile=package.json" alt="Known Vulnerabilities" data-canonical-src="https://snyk.io/test/github/ShuttleBrowser/shuttle?targetFile=package.json" style="max-width:100%;"></a>
</div>


## Installation

Shuttle's last stable version can be downloaded from either [our website](https://shuttleapp.io) or [GitHub releases](https://github.com/ShuttleBrowser/Shuttle).

Working on Microsoft Windows (7+), GNU/Linux Debian (Xfce and Mate) and MacOS (1.9+).
_Not deployed on MacOS_

### Using git
```
# clone the repository
$ git clone https://github.com/ShuttleBrowser/Shuttle.git

# change the working directory to shuttle
$ cd Shuttle

# install the requirements
$ npm install
```
**Note:** [Node 10.11.0](https://nodejs.org/en/) or higher is required.


## Getting Started

> You can now help us by [translating](https://github.com/ShuttleBrowser/Shuttle/issues/49) Shuttle !

On Windows, Shuttle can be launched by clicking on its shortcut which can be found directly on the desktop or from the Start menu.
The program should then start in the notification center. Its icon can be found in the system tray, at the bottom right of the screen. Clicking on its icon will show Shuttle's main window.

In order to add a new website (we refer to them as "bookmarks") just click on the "plus" `(+)` button. A dialog will open to ask you for the URL of the website you want to add. Enter it and validate to see a new icon being added to the bookmarks bar. You can now click on this icon at any time to display the website.

A bookmark can be deleted by right-clicking on its icon.

The settings can be edited by clicking on the gear. They make possible to manage your preferences by offering, for instance, to launch Shuttle on boot or to force Shuttle to stay opened.

All updates are automatic and new versions are checked at the launch of the application. You can also search for updates by clicking on the arrows below the settings.
If you need help to setup or use Shuttle, or you want to report a bug, please contact us at [support@shuttleapp.io](mailto:support@shuttleapp.io).

Stay in touch by joining us on [Twitter](https://twitter.com/shuttle_app) or [Discord](discord.gg/QCFdGq7).

### Keyboard shortcuts

_Currently in developement._

* Add bookmark : <kbd>Ctrl</kbd> <kbd>P</kbd>
* Remove bookmark : <kbd>Ctrl</kbd> <kbd>R</kbd> *(not implemented)*
* Show home page: <kbd>Ctrl</kbd> <kbd>H</kbd>
* Show settings : <kbd>Ctrl</kbd> <kbd>S</kbd>
* Open quicksearch : <kbd>Ctrl</kbd> <kbd>K</kbd>
* Take screenshot : <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>S</kbd>
* Show/Hide Shuttle : <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>X</kbd><br>
* Refresh page : <kbd>F5</kbd>
* Go back in history <kbd>Alt</kbd> <kbd>←</kbd>
* Go forward in history <kbd>Alt</kbd> <kbd>→</kbd>
* Open website dev tools <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>I</kbd>
* Open Shuttle dev tools <kbd>Ctrl</kbd> <kbd>Alt</kbd> <kbd>I</kbd>

<br>
Note: the <kbd>Ctrl</kbd> key is replaced by <kbd>Cmd</kbd> key on MacOs.

### Storage

Shuttle stores informations about your current bookmarks in a JSON file:

```json
{
  "bookmarks": [
    {
      "id": 1,
      "type": "website",
      "url": "http://google.com",
      "icon": "https://api.faviconkit.com/google.com/144",
      "order": 1
    },
    {
      "id": 2,
      "type": "website",
      "url": "http://intagram.com",
      "icon": "https://api.faviconkit.com/intagram.com/144",
      "order": 2
    },
    {
      "id": 3,
      "type": "website",
      "url": "http://twitter.com",
      "icon": "https://api.faviconkit.com/twitter.com/144",
      "order": 3
    }
  ]
}
```

## Built With

* [Electron](https://electron.atom.io/) - NodeJS Module
* [NodeJS](https://nodejs.org) - Javascript Environnement

## Authors

* **Robin Jullian** - *Lead developer* - [robjullian](https://github.com/robjullian)

Currently maintained by [robjullian](https://github.com/robjullian), [KazeJiyu](https://github.com/KazeJiyu), [Vahelnir](https://github.com/Vahelnir) and [TheRolf](https://github.com/TheRolfFR).

See also the list of [contributors](https://github.com/ShuttleBrowser/Shuttle/contributors) who participated in this project.

## License

This project is licensed under the [NPOSL 3.0](https://opensource.org/licenses/NPOSL-3.0) License.<br>
The logo and all associated visuals are under the [CC BY-NC-ND 3.0](https://creativecommons.org/licenses/by-nc-nd/3.0/) License.

## Current Version

* Release [2.0.9](https://github.com/ShuttleBrowser/Shuttle/releases)
* Pre-release [3.0.6-beta.7](https://github.com/ShuttleBrowser/Shuttle/releases)
