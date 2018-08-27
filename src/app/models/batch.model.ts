export class Batch {
    constructor(
        public limit: number = 40,
        public offset: number = 0,
        public lastId: string = ""
    ) { }
}
