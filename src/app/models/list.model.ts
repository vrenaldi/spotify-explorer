import { ImgType } from "./spotify.model";
import { SubList } from "./sub-list.model";

export class List {
    constructor(
        public id: string,
        public name: string,
        public imgType: ImgType,
        public image: string = "",
        public routes: string[] = [],
        public subLists: SubList[] = []
    ) { }
}
