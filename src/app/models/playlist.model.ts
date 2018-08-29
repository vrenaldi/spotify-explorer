import { User } from "./user.model";
import { Track } from "./track.model";

export class Playlist {
    constructor(
        public id: string,
        public name: string,
        public owner: User,
        public image: string = "",
        public tracks: Track[] = []
    ) { }
}
