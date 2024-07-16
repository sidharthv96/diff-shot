import type { DiffFile } from 'diff2html/lib/types';
import { sha256 } from './hash';
import type { Config } from './types';

const defaultConfig: Config = {
	spaceBetweenLines: 0,
	charHeight: 20,
	charWidth: 10,
	insertColor: '#00ff00',
	insertCommentColor: '#afa',
	deleteColor: '#ff0000',
	deleteCommentColor: '#faa',
	contextColor: '#efefef'
};

export const renderFile = async (file: DiffFile, config: Partial<Config> = {}) => {
	const {
		spaceBetweenLines,
		charHeight,
		charWidth,
		contextColor,
		insertColor,
		insertCommentColor,
		deleteColor,
		deleteCommentColor
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
			const isComment = content.trim().startsWith('//');
			let fill = '';
			if (type === 'context') {
				rect.setAttribute('class', 'context opacity-50');
				fill = contextColor;
			} else if (type === 'insert') {
				fill = isComment ? insertCommentColor : insertColor;
				rect.setAttribute('class', 'added');
			} else if (type === 'delete') {
				fill = isComment ? deleteCommentColor : deleteColor;
				rect.setAttribute('class', 'removed');
			}
			rect.setAttributeNS(null, 'fill', fill);
			svg.appendChild(rect);
			yOffset += charHeight + spaceBetweenLines;
		});
	});
	svg.setAttribute('viewBox', `0 0 ${width} ${yOffset}`);

	return { svg, width, height: yOffset, name: await sha256(file.oldName, file.newName) };
};
