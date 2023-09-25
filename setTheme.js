const darkThemeMq = window.matchMedia("(prefers-color-scheme: dark)");
var text = document.getElementById('text');

function deviceTheme() {
	if (darkThemeMq.matches) {
		document.body.style.backgroundColor = "black";
	} else {
		document.body.style.backgroundColor = "white";
	}
}

function pageTransition() {
	//document.body.style.backgroundColor = "black";
}

