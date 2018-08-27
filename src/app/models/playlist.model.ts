import { User } from "./user.model";

export class Playlist {
    constructor(
        public id: string,
        public name: string,
        public owner: User,
        public image: string = "",
        // public tracks: Track[] = []
    ) { }
}
