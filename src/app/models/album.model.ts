import { Artist } from "./artist.model";
import { Track } from "./track.model";

export class Album {
    constructor(
        public id: string,
        public name: string,
        public artists: Artist[],
        public image: string = "",
        public tracks: Track[] = []
    ) { }
}
