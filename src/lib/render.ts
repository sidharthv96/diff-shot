import type { DiffFile } from 'diff2html/lib/types';
import { sha256 } from './hash';
import type { Config } from './types';

const defaultConfig: Config = {
	spaceBetweenLines: 0,
	charHeight: 20,
	charWidth: 10,
	insertColor: '#00ff00',
	deleteColor: '#ff0000',
	contextColor: '#efefef',
	commentOpacity: '0.5',
	contextOpacity: '0.5'
};

export const renderFile = async (file: DiffFile, config: Partial<Config> = {}) => {
	const {
		spaceBetweenLines,
		charHeight,
		charWidth,
		contextColor,
		insertColor,
		deleteColor,
		commentOpacity,
		contextOpacity
	} = { ...defaultConfig, ...config };

	const svgNamespace = 'http://www.w3.org/2000/svg';
	const svg = document.createElementNS(svgNamespace, 'svg');
	svg.setAttribute('class', 'max-w-full max-h-full');
	let width = 0;
	let yOffset = 0;
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
			const isComment = content.match(/^\s*(\/\/|#|\/\*|\*|--|;).*$/) !== null;
			let fill = '';
			if (type === 'context') {
				rect.setAttribute('class', 'context');
				rect.setAttribute('opacity', contextOpacity);
				fill = contextColor;
			} else if (type === 'insert') {
				fill = insertColor;
				rect.setAttribute('class', 'added');
			} else if (type === 'delete') {
				fill = deleteColor;
				rect.setAttribute('class', 'removed');
			}
			if (isComment) {
				rect.setAttribute('opacity', commentOpacity);
			}
			rect.setAttributeNS(null, 'fill', fill);
			svg.appendChild(rect);
			yOffset += charHeight + spaceBetweenLines;
		});
	});
	svg.setAttribute('viewBox', `0 0 ${width} ${yOffset}`);

	return { svg, width, height: yOffset, name: `i${await sha256(file.oldName, file.newName)}` };
};
