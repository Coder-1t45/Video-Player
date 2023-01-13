function translate(s) {
    var [hour, minute, second] = s.replace(",", ".").split(":");
    var chour = parseInt(hour) * 3600;
    var cminute = parseInt(minute) * 60;
    var csecond = parseFloat(second);
    return chour + cminute + csecond;
}
class Subtitle {
    start_time;
    end_time;
    context;

    constructor(_context) {
        try {
            var [_id, timespan, ...c] = _context.split("\n");
            var [s, e] = timespan.replace(" ", "").split("-->");
            this.start_time = translate(s);
            this.end_time = translate(e);
            this.context = c.join("<br>");
        } catch {
            console.error(_context);
        }
    }

    get Context() {
        return this.context;
    }

    Between(n) {
        return n > this.start_time && n < this.end_time;
    }
}
export function has() {
    if (arr) return true;
    else return false;
}
let arr;
export function Initialize(file_context) {
    file_context = file_context.substring(20,file_context.length);
    var id = 0;
    var curr_d = "";
    var la = file_context.split('\n')
    var l = []
    for (var line of la){
        curr_d += line + '\n'
        if (line.replace(" ","").length == 0 || line == '\r') { 
            id++;
            curr_d = curr_d.substring(0, curr_d.length - '\n'.length)
            l.push(curr_d);
            curr_d = "";
        }
    }
    arr = [];
    for (var i of l) {
        arr.push(new Subtitle(i));
    }
}
export function Destroy() {
    arr = null;
}
export function GetSubtitle(time) {
    if (!arr) return "";
    for (var s of arr) {
        if (s.Between(time)) return s.Context;
    }
    return "";
}
