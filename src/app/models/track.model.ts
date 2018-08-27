import { Artist } from "./artist.model";
import { Album } from "./album.model";

export class Track {
    constructor(
        public id: string,
        public name: string,
        public duration: number,
        public isSaved: boolean,
        public uri: string,
        public previewURL: string,
        public artists: Artist[],
        public album: Album = new Album("", "", [])
    ) { }
}
