"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var getUserMedia = function (page, second, date) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log('trigger exposeFunction');
                return [4 /*yield*/, page.exposeFunction('recorderVedio', function (vedioSteam) {
                        console.log('will save file');
                        return new Promise(function (resolve, reject) {
                            try {
                                fs.writeFileSync('/app' + "/tempAsset/" + date + "/test.webm", Buffer.from(vedioSteam.split(';base64,').pop(), 'base64')
                                // vedioSteam,
                                );
                                console.log('save done');
                                resolve('done');
                            }
                            catch (error) {
                                console.log('error - ', error);
                                reject(error);
                            }
                            // const write =
                        });
                    })];
            case 1:
                _a.sent();
                console.log('trigger getUserMedia');
                return [4 /*yield*/, page.evaluate(function (second) {
                        // use window.readfile to read contents of a file
                        // const content = await window.recorderVedio('/etc/hosts');
                        // console.log(content);
                        console.log('trigger evaluate');
                        var displayCap = {
                            video: {
                                cursor: 'always',
                            },
                            audio: false,
                        };
                        var newWindow = window;
                        var title = document.querySelector('title');
                        if (title) {
                            title.innerHTML = 'recorder-page';
                        }
                        // console.log(navigator);
                        console.log(second);
                        // navigator.mediaDevices.enumerateDevices().then((data) => {
                        //   console.log(data);
                        // });
                        navigator.mediaDevices
                            .getDisplayMedia(displayCap)
                            .then(function (data) {
                            // console.log(data);
                            var mediaRecorder = new MediaRecorder(data, {
                                mimeType: 'video/webm',
                                audioBitsPerSecond: 128000,
                                videoBitsPerSecond: 2500000,
                            });
                            var showDate = new Date();
                            console.log('start time: ' + showDate.getMinutes() + ':' + showDate.getSeconds());
                            mediaRecorder.start();
                            // data.dispatchEvent("")
                            var timer = setTimeout(function () {
                                console.log('trigger recorder soon stop');
                                mediaRecorder.stop();
                                clearTimeout(timer);
                            }, second);
                            console.log(timer);
                            mediaRecorder.ondataavailable = function (event) {
                                console.log('trigger recorder end', event.data);
                                var reader = new window.FileReader();
                                reader.readAsDataURL(event.data);
                                reader.onloadend = function () {
                                    console.log(typeof newWindow.recorderVedio);
                                    newWindow.recorderVedio &&
                                        newWindow.recorderVedio(reader.result).then(function (data) {
                                            console.log('end time: ' + showDate.getMinutes() + ':' + showDate.getSeconds());
                                            newWindow._autoScroderIsDone = data;
                                        });
                                };
                            };
                        })
                            .catch(function (err) {
                            console.error('Error:' + err);
                            return null;
                        });
                    }, second)];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.default = getUserMedia;
//# sourceMappingURL=getUserMedia.js.map