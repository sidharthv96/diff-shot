<script lang="ts">
	import { simulateDownload, simulateDownloadImageClick } from '$lib/download';
	import type { DiffImage } from '$lib/types';
	import html2canvas from 'html2canvas';

	export let image: DiffImage;

	type Exporter = (canvas: HTMLCanvasElement) => Promise<void> | void;

	const getFileName = (extension: string) => {
		return `${image.name}.${extension}`;
	};

	const exportImage = async (exporter: Exporter) => {
		const svg = document.querySelector<HTMLElement>(`#${image.name}`);
		if (!svg) {
			throw new Error('svg not found');
		}
		const canvas = await html2canvas(svg);
		await exporter(canvas);
	};

	const downloadImage: Exporter = (canvas) => {
		simulateDownload(
			getFileName('png'),
			canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream')
		);
	};

	const copyToClipboard: Exporter = (canvas) => {
		canvas.toBlob(async (blob) => {
			try {
				if (!blob) {
					throw new Error('blob is empty');
				}
				await navigator.clipboard.write([
					new ClipboardItem({
						[blob.type]: blob
					})
				]);
			} catch (error) {
				console.error(error);
			}
		});
	};

	const downloadSVG = () => {
		const container = document.getElementById(image.name);
		if (!container) return;
		const serializer = new XMLSerializer();
		const svgString = serializer.serializeToString(container);
		const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
		simulateDownloadImageClick(svgBlob, getFileName('svg'));
	};
</script>

<div
	class="relative h-fit w-1/3 overflow-hidden rounded-md bg-white shadow duration-300 hover:shadow-lg"
>
	<div
		class="absolute inset-0 left-0 top-0 z-10 flex h-full w-full flex-col items-center justify-center opacity-0 backdrop-blur-[1px] backdrop-brightness-90 duration-300 hover:opacity-100"
	>
		<div class="flex w-fit flex-col gap-4">
			<button
				title="Copy image to clipboard"
				class="w-full rounded bg-white px-4 py-2 hover:bg-slate-100"
				on:click={() => exportImage(copyToClipboard)}>Copy to clipboard</button
			>
			<button
				title="Download Crisp SVG"
				class="w-full rounded bg-white px-4 py-2 hover:bg-slate-100"
				on:click={() => downloadSVG()}>Download SVG</button
			>
			<button
				title="Download PNG Image"
				class="w-full rounded bg-white px-4 py-2 hover:bg-slate-100"
				on:click={() => exportImage(downloadImage)}>Download PNG</button
			>
		</div>
	</div>
	<div class="h-fit w-full p-2" id={image.name}>
		{@html image.svg.outerHTML}
	</div>
</div>
