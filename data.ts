import * as fs from "fs";
import { readFile } from "original-fs";
import * as path from "path";
// types
type videoSaves = {
    path: string;
    subs_dir: string;
    time: number;
};
type playerSettings = {
    volume: number;
    muted: boolean;
    videos: videoSaves[];
};
// if not exist
let _clear_data = {
    volume: 100,
    muted: false,
    videos: [],
} as playerSettings;

const encoding: fs.WriteFileOptions = "binary";

let _data: playerSettings;
let _settings_location = "user_data.js";

export async function loadSettings() {
    if (fs.existsSync(_settings_location)) {
        fs.openSync(_settings_location, "r");
        _data = JSON.parse(
            (await fs.readFileSync(_settings_location, encoding)) as string
        ) as playerSettings;
    } else {
        _data = JSON.parse(JSON.stringify(_clear_data));
        fs.appendFileSync(_settings_location, JSON.stringify(_data), encoding);
    }

    return { volume: _data.volume, muted: _data.muted };
}

export function updateVideo(
    video: videoSaves,
    args: { volume: number; muted: boolean }
) {
    _data.muted = args.muted;
    _data.volume = args.volume;
    video.path = video.path.replace("file:///", "");
    for (let i = 0; i < _data.videos.length; i++) {
        const element = _data.videos[i];
        if (path.resolve(element.path) == path.resolve(video.path)) {
            _data.videos[i] = video;
            return;
        }
    }
    _data.videos.push(video);
}

function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}
function replaceAll(str: string, match: string, replacement: string) {
    return str.replace(new RegExp(escapeRegExp(match), "g"), () => replacement);
}

export function enterVideo(video_path: string): null | videoSaves {
    for (const v of _data.videos) {
        if (
            replaceAll(video_path, path.sep, "") ==
            replaceAll(decodeURI(path.resolve(v.path)), path.sep, "")
        ) {
            return v;
        }
    }
    return null;
}

export async function exitSoftware() {
    fs.openSync(_settings_location, "w");
    await fs.writeFileSync(_settings_location, JSON.stringify(_data), encoding);
}
