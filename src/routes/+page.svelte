<script lang="ts">
	import { browser } from '$app/environment';
	import { parse } from 'diff2html';
	import html2canvas from 'html2canvas';
	import '../app.css';
	import type { DiffFile } from 'diff2html/lib/types';
	import { sha256 } from '$lib/hash';

	let code = `Paste your diff here
Then click on each file to download the image

To get diff, run git diff <commit-hash>
Or append .diff to a GitHub Pull Request URL

`;

	let container: HTMLDivElement;

	const ignoreFiles = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'];
	function simulateDownloadImageClick(uri: string, filename: string) {
		var link = document.createElement('a');
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

	const renderFile = async (file: DiffFile) => {
		const svgNamespace = 'http://www.w3.org/2000/svg';
		const svg = document.createElementNS(svgNamespace, 'svg');
		svg.setAttribute('class', 'max-w-full max-h-full');
		let width = 0;
		let yOffset = 0;
		const charHeight = 20;
		const charWidth = 10;
		file.blocks.forEach((block) => {
			block.lines.forEach((line) => {
				const type = line.type;
				const content = line.content.slice(1); // remove the prefix
				const lineWidth = charWidth * content.length;
				if (lineWidth > width) {
					width = lineWidth;
				}
				const rect = document.createElementNS(svgNamespace, 'rect');
				rect.setAttribute('x', '0');
				rect.setAttribute('y', yOffset.toString());
				rect.setAttribute('width', lineWidth.toString());
				rect.setAttribute('height', charHeight.toString());

				// TODO: Detect comments properly
				const isComment = content.trim().startsWith('//');
				let fill = '';
				if (type === 'context') {
					rect.setAttribute('class', 'context opacity-50');
					fill = '#efefef';
				} else if (type === 'insert') {
					fill = isComment ? '#afa' : '#00ff00';
					rect.setAttribute('class', 'added');
				} else if (type === 'delete') {
					fill = isComment ? '#faa' : '#ff0000';
					rect.setAttribute('class', 'removed');
				}
				rect.setAttributeNS(null, 'fill', fill);
				svg.appendChild(rect);
				yOffset += charHeight;
			});
		});
		svg.setAttribute('viewBox', `0 0 ${width} ${yOffset}`);

		return { svg, width, height: yOffset, name: await sha256(file.oldName, file.newName) };
	};

	let data: { svg: SVGElement; width: number; height: number; name: string }[] = [];

	const handle = async (text: string) => {
		if (!browser || !container) return { svgs: [], width: 0 };
		const diffJson = parse(text);
		const svgs = await Promise.all(
			diffJson.filter((file) => !ignoreFiles.some((i) => file.newName.endsWith(i))).map(renderFile)
		);
		data = svgs;
	};

	$: handle(code);
	const capture = (id: string) => {
		const container = document.getElementById(id);
		if (!container) return;
		html2canvas(container).then(function (canvas) {
			simulateDownloadImageClick(canvas.toDataURL(), 'file-name.png');
		});
	};
</script>

<div class="w-screen h-screen overflow-hidden bg-slate-50 flex flex-col">
	<div class="w-full h-10 flex items-center justify-center bg-green-400 text-white">
		<h1 class="text-2xl">Diff Shot 🥷</h1>
	</div>
	<div class="w-full grow flex gap-4 overflow-hidden">
		<div class="flex flex-col w-1/3 h-full overflow-hidden shadow">
			<textarea class="w-full h-full p-4" rows="10" bind:value={code}></textarea>
			<!-- <div class=" w-full flex gap-2 justify-center p-2">
				<button
					class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
					on:click={capture}>Download</button
				>
			</div> -->
		</div>

		<div
			id="diffContainer"
			class="diff-container p-4 w-2/3 overflow-auto flex gap-2 items-center justify-center flex-wrap"
			bind:this={container}
		>
			{#each data as { svg, name }}
				<button
					id={name}
					title="Click to download"
					class="shadow bg-white rounded-md hover:shadow-lg overflow-hidden w-1/3 h-fit p-2"
					on:click={() => capture(name)}
				>
					{@html svg.outerHTML}
				</button>
			{/each}
		</div>
	</div>
</div>
