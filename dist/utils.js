"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.arrayDefinedAndNotEmpty = exports.assignArrayToObj = exports.pad = exports.myConsoleLog = exports.parseContainers = exports.interpretField = exports.stringifyBufferObj = void 0;
function stringifyBufferObj(obj) {
    for (const key in obj) {
        if (Buffer.isBuffer(obj[key])) {
            // @ts-ignore
            obj[key] = obj[key].toString();
        }
    }
    return obj;
}
exports.stringifyBufferObj = stringifyBufferObj;
function interpretField(data, fields) {
    let remainder = data;
    // @ts-expect-error
    return Object.fromEntries(fields.map((f) => {
        const interpretFunction = f[2] || ((x) => x);
        let value;
        if (f[1]) {
            value = interpretFunction(remainder.slice(0, f[1]));
            remainder = remainder.slice(f[1]);
        }
        else {
            value = interpretFunction(remainder);
        }
        return [f[0], value];
    }));
}
exports.interpretField = interpretField;
function parseContainers(data, f) {
    // f is a function which returns an array with a interpreted value from data and the remaining data as the second item
    let remainder = data;
    const containers = [];
    while (remainder.length > 0) {
        const result = f(remainder);
        containers.push(result[0]);
        // if (containers.length < 10 ) {console.log(containers)};
        remainder = result[1];
    }
    return containers;
}
exports.parseContainers = parseContainers;
function myConsoleLog(str) {
    /* following if statement is never fired up during test, so should be ignored */
    /* istanbul ignore if  */
    if (process.env.NODE_ENV !== 'test') {
        console.error(str);
    }
}
exports.myConsoleLog = myConsoleLog;
function pad(number, length) {
    let str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
}
exports.pad = pad;
function assignArrayToObj(arr) {
    // @ts-expect-error
    return arr.reduce((accumulator, currentValue) => {
        return Object.assign(accumulator, currentValue);
    }, 
    // @ts-expect-error
    {});
    // var obj = Object.assign({}, o1, o2, o3);
}
exports.assignArrayToObj = assignArrayToObj;
function arrayDefinedAndNotEmpty(arr) {
    return (typeof arr !== 'undefined' && arr.length > 0);
}
exports.arrayDefinedAndNotEmpty = arrayDefinedAndNotEmpty;
