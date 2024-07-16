export async function sha256(...sources: string[]) {
	const sourceBytes = new TextEncoder().encode(sources.join(''));
	const digest = await crypto.subtle.digest('SHA-256', sourceBytes);
	const resultBytes = [...new Uint8Array(digest)];
	return resultBytes.map((x) => x.toString(16).padStart(2, '0')).join('');
}
