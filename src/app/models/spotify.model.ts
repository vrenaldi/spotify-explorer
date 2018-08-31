export { Album } from "./album.model";
export { Artist } from "./artist.model";
export { Batch } from "./batch.model";
export { List } from "./list.model";
export { Playlist } from "./playlist.model";
export { Search } from "./search.model";
export { Thumbnail } from "./thumbnail.model";
export { Track } from "./track.model";
export { User } from "./user.model";

export class Spotify {
}

export enum ImgType {
    Profile,
    NotProfile
}

export enum DialogType {
    CreatePlaylist,
    DeletePlaylist,
    AddToPlaylist
}

export enum SnackBarType {
    LibrarySaved,
    LibraryRemoved,
    PlaylistAdded,
    PlaylistRemoved,
    PreviewNotAvailable
}