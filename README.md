<div align="center">
  <br>
  <img width="500" src="./view/public/img/logo.svg" alt="Shuttle">
  <br>
  <br>
</div>

<p align="center" color="#6a737d">
  <i>The fastest access to your favorite applications.</i><br>
</p>

<div align="center">
  <a href="https://snyk.io/test/github/ShuttleBrowser/Shuttle/tree/v4.0?targetFile=package.json">
    <img src="https://snyk.io/test/github/ShuttleBrowser/Shuttle/tree/v4.0/badge.svg?targetFile=package.json" alt="Known Vulnerabilities">
  </a>
  <a href="https://ci.appveyor.com/project/robjullian/shuttle">
    <img src="https://img.shields.io/appveyor/ci/robjullian/shuttle" alt="build" /> 
  </a>
</div><br>


## Installation

*TO DO*

### Using git / Development

Before, be sure to have node and golang installed !

```
# clone the repository
$ git clone https://github.com/ShuttleBrowser/Shuttle.git

# change the working directory to shuttle
$ cd Shuttle
$ go mod tidy

# install the requirements
$ cd view
$ npm install

# Run dev
$ npm run build && go run ../main.go
```

## Getting Started

*TO DO*

## Built With

* [Webview](https://github.com/webview/webview) - Run as a desktop app
* [Svelte](https://svelte.dev/) - For building UI

## Authors

* **Robin Jullian** - *Lead developer* - [robjullian](https://github.com/robjullian)

Many thanks to [@echebbi](https://github.com/echebbi), [@Vahelnir](https://github.com/Vahelnir) and [@TheRolf](https://github.com/TheRolfFR) who accompanied us throughout the adventure.

See also the list of [contributors](https://github.com/ShuttleBrowser/Shuttle/contributors) who participated in this project.

## License

This project is licensed under the [NPOSL 3.0](https://opensource.org/licenses/NPOSL-3.0) License.<br>
The logo and all associated visuals are under the [CC BY-NC-ND 3.0](https://creativecommons.org/licenses/by-nc-nd/3.0/) License.