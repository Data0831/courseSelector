// _______________________________ <基本資料 _______________________________
const DEF_ROW = 11, DEF_COL = 7;
// 課表的長與寬，因為還有title的部分所以各減一
const ROW_TITLE_LIST = ["", "星期一", "星期二","星期三","星期四","星期五","星期六","星期日"]// 課表寬的標題
const COL_TITLE_LIST = ["", "第一節 0810-0900", "第二節 0910-1000", "第三節 1010-1100", "第四節 1110-1200", "中午   1210-1300", "第五節 1310-1400", "第六節 1410-1500", "第七節 1510-1600", "第八節 1610-1700", "傍晚   1710-1800", "第十節 1910-2000", "第十一節 2010-2200"]

const WIDTH_S = String(window.innerWidth/2);
const HEIGHT_S = String(window.innerHeight/2*1.2);
const LEFT_S = String(window.innerWidth/4/1.7);
const TOP_S = String(window.innerHeight/4/1.3);


// _______________________________ 基本資料> _______________________________

// _______________________________ <ID資料 _______________________________

ID_CONNECT_CHAT = "-";

// ========================= html tag
L_CONTENT_DOM_ID = "LContent";
L_TABLE_DOM_ID = "userTableView";

// =========================

const LIST_ID_NAME = "LIST";// listID前綴 與courseID做組合
const TB_BTN_ID_NAME = "";// tableBtnID前綴 與posID做組合
const CONTROL_ID_NAME = "CTRL";// controlID前綴 

// _______________________________ ID資料> _______________________________

// _______________________________ <顏色資料 _______________________________
const TABLE_TD_BCOR = "white";
const TABLE_TD_WARNING_BCOR = "red";
const COURSE_LIST_ROW_COR = "black";
const COURSE_LIST_ROW_WARNING_COR = "red";
const COURSE_LIST_ROW_HIDDEN_COR = "green";

// _______________________________ 顏色資料> _______________________________

// _______________________________ <html:class資料 _______________________________

const TABLE_ROW_TITLE_CLASS_NAME = "tableRowTitle";
const TABLE_COL_TITLE_CLASS_NAME = "tableColTitle";

const COURSE_CLASS_NAME = "courseName";
const COURSE_CLASS_CREDIT ="courseCredit";
const COURSE_CLASS_TEACHER = "courseTeacher";
const COURSE_CLASS_CODE = "courseCode";
const COURSE_CLASS_TIME = "courseTime";

// _______________________________ html:class資料> _______________________________



// _______________________________ <class定義 _______________________________

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
    constructor(size, courseIDList){
        this.size = size;
        this.courseIDList = courseIDList;
    }
}

// _______________________________ class定義> _______________________________
