"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ref = void 0;
class Ref {
    constructor() {
        this.enum = { id: {}, ref: {} };
        this.id = 1;
    }
    getRef(id) {
        return this.enum.ref[id.toString()];
    }
    get(ref) {
        if (!this.enum.id[ref]) {
            this.enum.id[ref] = this.id.toString();
            this.id++;
            this.enum.ref[this.enum.id[ref]] = ref;
        }
        return this.enum.id[ref];
    }
}
exports.Ref = Ref;
//# sourceMappingURL=ref.js.map