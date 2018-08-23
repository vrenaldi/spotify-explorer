export class User {
    constructor(
        public id: string,
        public name: string,
        public image: string = "",
        public country: string = "",
        public email: string = ""
    ) { }
}
