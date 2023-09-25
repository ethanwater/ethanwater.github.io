const darkThemeMq = window.matchMedia("(prefers-color-scheme: dark)");

function deviceTheme() {
	if (darkThemeMq.matches) {
		document.body.style.backgroundColor = "black";
	} else {
		document.body.style.backgroundColor = "white";
	}
}

