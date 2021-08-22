package view

import (
	"fmt"
	"html/template"
	"io/fs"

	"embed"

	"github.com/webview/webview"
)

func CreateWindow() {
	debug := true
	w := webview.New(debug)
	defer w.Destroy()

	w.SetTitle("Shuttle")
	w.SetSize(412, 644, webview.HintFixed)
	w.Navigate(getView())

	w.Init(getJS())
	w.Dispatch(func() {
		w.Init(fmt.Sprintf(`window.onload = () => {
			(css => {
					const style = document.createElement('style')
					style.setAttribute('type', 'text/css')
					style.appendChild(document.createTextNode(css))
					document.head.appendChild(style)
					console.log('Injected CSS')
			 })('%s')
 }`, template.JSEscapeString(getCSS())))
	})

	w.Run()
}

//go:embed public/*
var content embed.FS

func getView() string {
	f, err := fs.ReadFile(content, "public/index.html")
	if err != nil {
		panic(err)
	}

	return `data:text/html, ` + string(f)
}

func getJS() string {
	f, err := fs.ReadFile(content, "public/bundle.js")
	if err != nil {
		panic(err)
	}

	return string(f)
}

func getCSS() string {
	f, err := fs.ReadFile(content, "public/bundle.css")
	if err != nil {
		panic(err)
	}

	return string(f)
}
