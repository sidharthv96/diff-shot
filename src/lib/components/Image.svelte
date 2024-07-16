<script lang="ts">
	import { simulateDownloadImageClick } from '$lib/download';
	import type { DiffImage } from '$lib/types';
	import html2canvas from 'html2canvas';

	export let image: DiffImage;

	const capture = (id: string) => {
		const container = document.getElementById(id);
		if (!container) return;
		html2canvas(container).then(function (canvas) {
			simulateDownloadImageClick(canvas.toDataURL(), 'diff-shot.png');
		});
	};
</script>

<button
	id={image.name}
	title="Click to download"
	class="h-fit w-1/3 overflow-hidden rounded-md bg-white p-2 shadow hover:shadow-lg"
	on:click={() => capture(image.name)}
>
	{@html image.svg.outerHTML}
</button>
