export function simulateDownloadImageClick(blob: Blob, filename: string) {
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	if (typeof link.download !== 'string') {
		window.open(url);
	} else {
		link.href = url;
		link.download = filename;
		accountForFirefox(clickLink, link);
	}
	URL.revokeObjectURL(url);
}

export const simulateDownload = (download: string, href: string): void => {
	const a = document.createElement('a');
	a.download = download;
	a.href = href;
	a.click();
	a.remove();
};

function clickLink(link: HTMLAnchorElement) {
	link.click();
}

function accountForFirefox(click: (link: HTMLAnchorElement) => void, link: HTMLAnchorElement) {
	// wrapper function
	document.body.appendChild(link);
	click(link);
	document.body.removeChild(link);
}
