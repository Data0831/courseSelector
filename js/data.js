let defRow = 13, defCol = 8;
// 課表的長與寬，因為還有title的部分所以各減一
let rowTitle = ["", "星期一", "星期二","星期三","星期四","星期五","星期六","星期日"]// 課表寬的標題
let colTitle1 = ["", "第一節", "第二節", "第三節", "第四節", "中午  ", "第五節", "第六節", "第七節", "第八節", "傍晚  ", "第十節", "第十一節"]
let colTitle2 = ["", "0810-0900", "0910-1000", "1010-1100", "1110-1200", "1210-1300", "1310-1400", "1410-1500", "1510-1600", "1610-1700", "1710-1800", "1910-2000", "2010-2200"]

class Course{
    constructor(name, credit, teacher, code, time){
        this.name = name;
        this.credit = credit;
        this.teacher = teacher;
        this.code = code;
        this.time = time;
    }
}

class Schdule{
    constructor(size, tempIDs){
        this.size = size;
        this.tempIDs = tempIDs;
    }
}