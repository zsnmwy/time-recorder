"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timeConvert = void 0;
var timeConvert = function (startTime, second) {
    // const result = ['*','*','*','*','*','*'];
    // const cDate = new Date();
    var sDate = new Date(startTime);
    var sDay = sDate.getDate();
    var sMounth = sDate.getMonth();
    var sHour = sDate.getHours();
    var sMin = sDate.getMinutes();
    var sSec = sDate.getSeconds();
    // const mday = 1000 * 60 * 60 * 24;
    // const mHour = 1000 * 60 * 60;
    // const mMin = 1000 * 60;
    // const mSec = 1000;
    // const getResult = (second: number, result: (number | string)[]): (number | string)[] => {
    //   if (second >= mday) {
    //     const modDay = second % mday;
    //     const dDay = ((second - modDay) / mday).toFixed(0);
    //     result[3] = sDay + Number(dDay);
    //     return getResult(second % mday, result);
    //   } else if (second >= mHour) {
    //     const modHour = second % mHour;
    //     const dHour = ((second - modHour) / mHour).toFixed(0);
    //     result[2] = sHour + Number(dHour);
    //     return getResult(second % mday, result);
    //   } else if (second >= mMin) {
    //     const modMin = second % mMin;
    //     const dMin = ((second - modMin) / mMin).toFixed(0);
    //     result[1] = sMin + Number(dMin);
    //     return getResult(second % mday, result);
    //   } else {
    //     const modSec = second % mSec;
    //     const dSec = ((second - modSec) / mSec).toFixed(0);
    //     result[0] = sSec + Number(dSec);
    //     return result;
    //   }
    // };
    // return getResult(second,[sSec,sMin,sHour,sDay,sMounth,'*'])
    return [sSec, sMin, sHour, sDay, sMounth, '*'];
};
exports.timeConvert = timeConvert;
//# sourceMappingURL=timeConvert.js.map