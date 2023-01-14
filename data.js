"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exitSoftware = exports.enterVideo = exports.updateVideo = exports.loadSettings = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// if not exist
let _clear_data = {
    volume: 100,
    muted: false,
    videos: [],
};
const encoding = "binary";
let _data;
let _settings_location = "user_data.js";
function loadSettings(_app_file) {
    return __awaiter(this, void 0, void 0, function* () {
        _settings_location = path.join(_app_file, _settings_location);
        if (fs.existsSync(_settings_location)) {
            fs.openSync(_settings_location, "r");
            _data = JSON.parse((yield fs.readFileSync(_settings_location, encoding)));
        }
        else {
            _data = JSON.parse(JSON.stringify(_clear_data));
            fs.appendFileSync(_settings_location, JSON.stringify(_data), encoding);
        }
        return { volume: _data.volume, muted: _data.muted };
    });
}
exports.loadSettings = loadSettings;
function updateVideo(video, args) {
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
exports.updateVideo = updateVideo;
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}
function replaceAll(str, match, replacement) {
    return str.replace(new RegExp(escapeRegExp(match), "g"), () => replacement);
}
function enterVideo(video_path) {
    for (const v of _data.videos) {
        if (replaceAll(video_path, path.sep, "") ==
            replaceAll(decodeURI(path.resolve(v.path)), path.sep, "")) {
            return v;
        }
    }
    return null;
}
exports.enterVideo = enterVideo;
function exitSoftware() {
    return __awaiter(this, void 0, void 0, function* () {
        fs.openSync(_settings_location, "w");
        yield fs.writeFileSync(_settings_location, JSON.stringify(_data), encoding);
    });
}
exports.exitSoftware = exitSoftware;
