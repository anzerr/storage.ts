
export class Ref {

	enum: {
		id: {[key: string]: string};
		ref: {[key: string]: string};
	};
	prefix: string;
	id: number;

	constructor() {
		this.enum = {id: {}, ref: {}};
		this.id = 1;
	}

	getRef(id: string | number): string {
		return this.enum.ref[id.toString()];
	}

	get(ref: string): string {
		if (!this.enum.id[ref]) {
			this.enum.id[ref] = this.id.toString();
			this.id++;
			this.enum.ref[this.enum.id[ref]] = ref;
		}
		return this.enum.id[ref];
	}

}
