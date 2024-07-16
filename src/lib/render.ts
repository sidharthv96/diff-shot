import type { DiffFile } from 'diff2html/lib/types';
import { sha256 } from './hash';

export const renderFile = async (file: DiffFile) => {
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
