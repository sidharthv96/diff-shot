export interface DiffImage {
	svg: SVGElement;
	width: number;
	height: number;
	name: string;
}

export interface Config {
	spaceBetweenLines: number;
	charHeight: number;
	charWidth: number;
	insertColor: string;
	deleteColor: string;
	contextColor: string;
	commentOpacity: string;
	contextOpacity: string;
}
