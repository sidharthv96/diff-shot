export function simulateDownloadImageClick(uri: string, filename: string) {
	const link = document.createElement('a');
	if (typeof link.download !== 'string') {
		window.open(uri);
	} else {
		link.href = uri;
		link.download = filename;
		accountForFirefox(clickLink, link);
	}
}

function clickLink(link: HTMLAnchorElement) {
	link.click();
}

function accountForFirefox(click: (link: HTMLAnchorElement) => void, link: HTMLAnchorElement) {
	// wrapper function
	document.body.appendChild(link);
	click(link);
	document.body.removeChild(link);
}
