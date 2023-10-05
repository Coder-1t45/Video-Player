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
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const data = __importStar(require("./data"));
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
    // eslint-disable-line global-require
    electron_1.app.quit();
}
const createWindow = async () => {
    const gatherVideo = async () => {
        var _path = "";
        if (process.argv0.endsWith("node.exe") ||
            process.argv0.endsWith("electron.exe")) {
            _path = process.argv.slice(2, process.argv.length).join(" ");
        }
        else {
            _path = process.argv.slice(1, process.argv.length).join(" ");
        }
        if (!fs.existsSync(_path) || !_path.endsWith(".mp4"))
            return null;
        var _subs = _path.slice(0, _path.length - ".mp4".length) + ".srt";
        var _d = data.enterVideo(_path);
        if (_d && _d.time > 0) {
            var r = await electron_1.dialog.showMessageBoxSync(mainWindow, {
                type: "question",
                title: "Confirmation",
                message: "Are you want to continue from \nthe place you stopped last time?",
                buttons: ["Yes", "No"],
            });
            if (r !== 0) {
                _d.time = 0;
            }
        }
        if (fs.existsSync(_subs)) {
            fs.openSync(_subs, "r");
            return {
                video: _path,
                subs: await fs.readFileSync(_subs, "utf8"),
                data: _d,
            };
        }
        else
            return { video: _path, subs: "", data: _d };
    };
    // Load our settings fule.
    var { volume, muted } = await data.loadSettings(electron_1.app.getAppPath());
    // Create the browser window.
    const mainWindow = new electron_1.BrowserWindow({
        minWidth: 800,
        minHeight: 450,
        width: 1360,
        height: 720,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false, //,
            //preload: path.join(__dirname, 'preload.js')
        },
    });
    electron_1.nativeTheme.themeSource = "system";
    mainWindow.setMenu(null);
    // and load the index.html of the app.
    mainWindow.loadFile(path.join("frontend", "index.html"));
    // Open the DevTools.
    // mainWindow.webContents.openDevTools();
    // Send initial Locations and Details.
    electron_1.ipcMain.on("startup", async (event, args) => {
        mainWindow.webContents.send("startup", {
            volume,
            muted,
            ...(await gatherVideo()),
        });
    });
    electron_1.ipcMain.on("opensubtitles", async (event, args) => {
        var location = "";
        await electron_1.dialog
            .showOpenDialog({
            defaultPath: electron_1.app.getPath("documents"),
            title: "Select the Subtitles",
            buttonLabel: "Load",
            filters: [
                {
                    name: "Subtitles Files",
                    extensions: ["srt"],
                },
            ],
            properties: ["openFile"],
        })
            .then(function (response) {
            if (!response.canceled) {
                location = response.filePaths[0];
            }
        });
        fs.openSync(location, "r");
        var _data = await fs.readFileSync(location, "utf8");
        mainWindow.webContents.send("subs", { subs: _data });
    });
    electron_1.ipcMain.on("i", (event, args) => {
        mainWindow.webContents.openDevTools();
    });
    electron_1.ipcMain.on("drop", async (event, args) => {
        if (args.endsWith(".mp4")) {
            var _d = data.enterVideo(args);
            if (_d && _d.time > 0) {
                var r = await electron_1.dialog.showMessageBoxSync(mainWindow, {
                    type: "question",
                    title: "Confirmation",
                    message: "Are you want to continue from \nthe place you stopped last time?",
                    buttons: ["Yes", "No"],
                });
                if (r !== 0) {
                    _d.time = 0;
                }
            }
            mainWindow.webContents.send("vid", { video: args, data: _d });
        }
        else if (args.endsWith(".srt")) {
            fs.openSync(args, "r");
            var _data = await fs.readFileSync(args, "utf8");
            mainWindow.webContents.send("subs", { subs: _data });
        }
    });
    electron_1.ipcMain.on("updatevid", (event, args) => {
        data.updateVideo({
            path: args["src"],
            subs_dir: args["subs"],
            time: args["current"],
        }, {
            volume: args["volume"],
            muted: args["muted"],
        });
    });
    electron_1.app.on("window-all-closed", () => {
        if (process.platform !== "darwin") {
            data.exitSoftware();
            electron_1.app.quit();
        }
    });
};
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
electron_1.app.on("ready", createWindow);
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
electron_1.app.on("activate", () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
