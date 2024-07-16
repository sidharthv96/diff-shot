<script lang="ts">
	import { browser } from '$app/environment';
	import Image from '$lib/components/Image.svelte';
	import { renderFile } from '$lib/render';
	import type { DiffImage } from '$lib/types';
	import { parse } from 'diff2html';
	import '../app.css';

	let code = `Paste your diff here
Then click on each file to download the image

To get diff, run git diff <commit-hash>
Or append .diff to a GitHub Pull Request URL

`;

	let images: DiffImage[] = [];

	const ignoreFiles = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'];
	const handle = async (text: string) => {
		if (!browser) {
			return;
		}
		const diffJson = parse(text);
		images = await Promise.all(
			diffJson.filter((file) => !ignoreFiles.some((i) => file.newName.endsWith(i))).map(renderFile)
		);
	};

	$: handle(code);
</script>

<div class="flex h-screen w-screen flex-col overflow-hidden bg-slate-50">
	<div class="flex h-10 w-full items-center justify-center bg-green-400 text-white">
		<h1 class="text-2xl">Diff Shot 🥷</h1>
	</div>
	<div class="flex w-full grow gap-4 overflow-hidden">
		<div class="flex h-full w-1/3 flex-col overflow-hidden shadow">
			<textarea class="h-full w-full p-4 font-mono" rows="10" bind:value={code} />
		</div>

		<div class="flex w-2/3 flex-wrap items-center justify-center gap-2 overflow-auto p-4">
			{#each images as image (image.name)}
				<Image {image} />
			{/each}
		</div>
	</div>
</div>
