import { ImgType } from "./spotify.model";
import { SubThumbnail } from "./sub-thumbnail.model";

export class Thumbnail {
    constructor(
        public id: string,
        public name: string,
        public imgType: ImgType,
        // public thumbnailType: ThumbnailType,
        public image: string = "",
        public subThumbnails: SubThumbnail[] = []
    ) { }
}
