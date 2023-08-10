// _______________________________ <ID資料管理 _______________________________
// 課程ID (不重複)
let courseID = 0;

// posID: 用來記錄表格中課程的位置信息，為td的id
// courseID: 為courseListRow的id，可用於獲得課程基礎資料
// 註: 這裡的id型態都為str


//function: LIST_ID_NAME為ID前綴可在data.js修改
function getCourseListRowID(courseID) {
    return LIST_ID_NAME + String(courseID);
}

//function: TB_BTN_ID_NAME為ID前綴可在data.js修改
function getTableBtnID(posID, courseID) {
    return TB_BTN_ID_NAME + String(posID) + ID_CONNECT_CHAT + String(courseID);
}

function getPosID(row_, col_) {
    return String(row_) + ID_CONNECT_CHAT + String(col_);
}

//function: 透過courseID獲取posID 
function getPosIDList(courseID) {
    // courseListRow: 指的是courseListView的其中一列
    let courseListRow = document.getElementById(getCourseListRowID(courseID));

    //debug
    if (courseListRow == null) console.log("getCourseListRow失敗 getPosIDList()");

    // courseTime: 紀錄著課程時段
    let posIDList = courseListRow.getElementsByClassName(COURSE_CLASS_TIME)[0].textContent.split(' ');

    //debug
    if (posIDList == null) console.log("posIDList為空 getPosIDList()");

    // contentText可以取出裡面的內容，通常是不能變動的才能用contentText
    return posIDList;
}

// 獲取contorl物件的id
function getCtrlObjID(courseID) {
    return CONTROL_ID_NAME + courseID;
}

// _______________________________ ID資料管理> _______________________________



// _______________________________ <初始化與定義 _______________________________

// 初始化定義
let row = DEF_ROW;
let col = DEF_COL;

// 監測表格標題改變
let tbRowTdListChange = false;

// 視窗
let addCourseWindow;
// ========================= 主頁面


//function: 處理表格標頭，修改後儲存到本地
function handleInputChange() {
    //debug
    console.log("========== 偵測到表格標題改變: 修改本地資料 ==========");
    let rowTitleDomList = document.getElementsByClassName(TABLE_ROW_TITLE_CLASS_NAME);
    let colTitleDomList = document.getElementsByClassName(TABLE_COL_TITLE_CLASS_NAME);
    let rowTitleList = [];
    let colTitleList = [];

    //debug
    if (rowTitleDomList == null) console.log("rowTitleDomList為空 handleInputChange()");
    if (colTitleDomList == null) console.log("colTitleDomList為空 handleInputChange()");

    // 傳入DOM造成錯誤，所以將DOM轉成String List傳入
    for (let i = 0; i < rowTitleDomList.length; i++) {
        rowTitleList.push(rowTitleDomList[i].value);
    }
    for (let i = 0; i < colTitleDomList.length; i++) {
        colTitleList.push(colTitleDomList[i].value);
    }

    // 資料存到本地給子視窗使用
    localStorage.setItem('row', JSON.stringify(row));
    localStorage.setItem('col', JSON.stringify(col));
    localStorage.setItem('rowTitleText', JSON.stringify(rowTitleList));
    localStorage.setItem('colTitleText', JSON.stringify(colTitleList));
}


//function: 介面初始化，根據row、col修改表格大小
function InitialView() {

    // 獲取index 左半部分的位置
    let LContentDom = document.getElementById(L_CONTENT_DOM_ID);

    //debug
    if (LContentDom == null) console.log("LContentDom為空 InitialView()");
    console.log("========== 初始化: row=" + String(row) + " col=" + String(col) + " ==========");

    //處理左半課表
    let tableString = "<table id = '" + L_TABLE_DOM_ID + "'>";
    for (let i = 0; i < row; i++) {
        tableString += "<tr>";

        for (let j = 0; j < col; j++) {
            // 左上空格
            if (i == 0 && j == 0) {
                tableString = tableString + "<th>" + "<input class='" + TABLE_COL_TITLE_CLASS_NAME + "' type='text'></th>";
            }
            //處理表格日期標題的部分
            else if (i == 0) {//第一格要空格，放節數
                tableString = tableString + "<th>" + "<input class='" + TABLE_ROW_TITLE_CLASS_NAME + "' type='text' value='" + ROW_TITLE_LIST[j] + "'></th>";
            }
            // 處理節數標題(側)的部分
            else if (j == 0 && i != 0) {
                tableString = tableString + "<td>" + "<input class='" + TABLE_COL_TITLE_CLASS_NAME + "' type='text' value='" + COL_TITLE_LIST[i] + "'></td>";
            }
            //處理其他地方
            else {
                // 填入posID座標
                tableString = tableString + "<td id='" + getPosID(i, j) + "'></td>";
            }
        }
        tableString += "</tr>";
    }
    tableString += "</table>";

    //將左半部分插入表格
    LContentDom.innerHTML += tableString;

    // 對input(表格的天、節數)進行監聽，如果改變了則tbRowTdListChange = true
    let tbRowTdDomList = document.getElementsByClassName(TABLE_ROW_TITLE_CLASS_NAME);
    for (let tbRowTdDom of tbRowTdDomList) {
        tbRowTdDom.addEventListener("input",
            function () {
                tbRowTdListChange = true;
            });
    }

    let tbColTdDomList = document.getElementsByClassName(TABLE_COL_TITLE_CLASS_NAME);
    for (let tbColTdDom of tbColTdDomList) {
        tbColTdDom.addEventListener("input",
            function () {
                tbRowTdListChange = true;
            });
    }
}

// ========================= 初始化左半表格
InitialView();// 介面 初始化




// ========== 右半表格 ==========




// _______________________________ <刪除與隱藏 _______________________________

//function: 移除表格課程衝堂資料，控制紅色警告
function schduleRmv(posID, courseID) {
    // schdule 移除 tbBtn課程資料 刪除courseViewRow 衝堂統計
    let schduleUnit = schdule.get(posID);
    schduleUnit.size -= 1;

    //List中要移除元素之索引
    let indexRmv = schduleUnit.courseIDList.indexOf(courseID);
    // splice(索引, 移除元素量);
    schduleUnit.courseIDList.splice(indexRmv, 1);

    if (schduleUnit.size == 1) {
        // 還原背景顏色
        document.getElementById(posID).style.background = TABLE_TD_BCOR;

        // 還原字體顏色
        for (let course_ID of schdule.get(posID).courseIDList) {
            document.getElementById(getCourseListRowID(course_ID)).style.color = COURSE_LIST_ROW_COR;
        }
    }
}

//function: 執行表格內課程隱藏，並將列表中課程顏色標記
function hidden(courseID) {
    document.getElementById(getCourseListRowID(courseID)).style.color = COURSE_LIST_ROW_HIDDEN_COR;
    let posIDList = getPosIDList(courseID);

    for (let posID of posIDList) {
        // 移除表格中課程
        let tableBtnID = getTableBtnID(posID, courseID);
        document.getElementById(tableBtnID).remove();

        // 檢查有沒有要消除的紅色警告
        schduleRmv(posID, courseID);
    }

}

//function: 展示被表格中被隱藏的課程
function show(courseID) {
    let courseListView = document.getElementById(getCourseListRowID(courseID));

    let courseNameStr = courseListView.getElementsByClassName(COURSE_CLASS_NAME)[0].textContent;
    let courseCreditStr = courseListView.getElementsByClassName(COURSE_CLASS_CREDIT)[0].textContent;
    let courseTeacherStr = courseListView.getElementsByClassName(COURSE_CLASS_TEACHER)[0].textContent;
    let courseCodeStr = courseListView.getElementsByClassName(COURSE_CLASS_CODE)[0].textContent;
    let courseTimeList = courseListView.getElementsByClassName(COURSE_CLASS_TIME)[0].textContent.split(' ');

    let course = new Course(courseNameStr, courseCreditStr, courseTeacherStr, courseCodeStr, courseTimeList);

    for (let posID of course.time) {

        //獲取td 在裡面放入課程BTN
        let tableTd = document.getElementById(posID);
        let tableBtnID = getTableBtnID(posID, courseID);
        tableTd.innerHTML += "<button id='" + tableBtnID + "'>" + course.name + "</button>";

        //設定衝堂資料
        if (schdule.has(posID)) {

            //schduleUnit: schdule中的某個單位資料
            let schduleUnit = schdule.get(posID);
            schduleUnit.size += 1;
            schduleUnit.courseIDList.push(courseID);

            if (schduleUnit.size > 1) {
                //處理課程表格td背景 變紅色
                let tableTd = document.getElementById(posID);
                tableTd.style.background = TABLE_TD_WARNING_BCOR;

                //處理courseList字 變紅色
                for (let course_ID of schduleUnit.courseIDList) {
                    let courseListRow = document.getElementById(getCourseListRowID(course_ID));
                    courseListRow.style.color = TABLE_TD_WARNING_BCOR;
                }
            }

        } else {
            schdule.set(posID, new Schdule(1, [courseID]));
        }
    }

}

//function:  控制隱藏或是展示
function courseCollapseControl(courseID) {
    let controlUnit = document.getElementById(getCtrlObjID(courseID));
    if (controlUnit.innerText == "隱藏") {
        controlUnit.innerText = "展示";
        hidden(courseID);
    } else {
        controlUnit.innerText = "隱藏";
        show(courseID);
    }
}

function removeCourse(courseID) {
    //先從courseListRow中獲取資料再刪除
    let posIDList = getPosIDList(courseID);
    document.getElementById(getCourseListRowID(courseID)).remove();


    for (let posID of posIDList) {
        tableBtnID = getTableBtnID(posID, courseID);

        //移除 tableBTN 和 schdule[posID]中的 size 、 courseIDList
        schduleRmv(posID, courseID);
    }
    tempIDbindbtn.delete(courseID);
}

// _______________________________ 刪除與隱藏> _______________________________


// ========== 下方控制 ==========

// 插入表格 喚出設定表單

function insertCourse() {

    if(tbRowTdListChange)   handleInputChange();

    //如果undefine代表視窗為創建，此舉可限制視窗只出現一次
    if (addCourseWindow == undefined) {
        addCourseWindow = window.open("./html/insertCourse.html", "_blank", "width=" + WIDTH_S + ",height=" + HEIGHT_S + ", top=" + TOP_S + ", left=" + LEFT_S);


        // 傳遞資料給setting
    }

    tbRowTdListChange = false;
}

// f函式，被 (produce courseListView)新增資料 使用
function makeCourseListView(data) {
    let Time = "";

    for (let str of data.time) {
        Time += (str + " ");
    }
    Time = Time.slice(0, -1);

    let courseListView = document.getElementById("courseListView");
    let courseListStr = "<tr id='LIST" + String(courseID) + "'>"
        + "<td class='courseName'>" + data.name + "</td>"
        + "<td class='courseCredit'>" + data.credit + "</td>"
        + "<td class='courseTeacher'>" + data.teacher + "</td>"
        + "<td class='courseCode'>" + data.code + "</td>"

        // (courseListViewButton)右表格按鈕處理 隱藏、刪除
        + "<td><button onclick='" + "removeCourse(" + String(courseID) + ")" + "'>刪除</button>"
        + "<hr><button id='" + CONTROL_ID_NAME + String(courseID) + "' onclick='courseCollapseControl(" + String(courseID) + ")'>隱藏</button></td>"
        + "<td class='courseTime'>" + Time + "</td>"
        + "</tr>"
    courseListView.innerHTML += courseListStr;
}

// f函式，被 (produce courseListView)新增資料 使用
// f函式，處理衝堂
let schdule = new Map();
let tempIDbindbtn = new Map(); //透過tempID尋找btn

function makeUserTableView(data) {
    for (let id of data.time) {
        //設定BTN位置
        console.log(id);
        let tableTd = document.getElementById(id);
        let newID = id + ID_CONNECT_CHAT + courseID;
        tableTd.innerHTML += "<button id='" + String(newID) + "'>" + data.name + "</button>";


        //設定衝堂資料
        if (schdule.has(id)) {
            //處理schduleChecked資料
            let schduleUnit = schdule.get(id);
            schduleUnit.size += 1;
            schduleUnit.courseIDList.push(courseID);

            if (schduleUnit.size > 1) {
                //處理table背景
                let tdBcCor = document.getElementById(id);
                tdBcCor.style.background = "red";

                //處理list背景
                for (let conflict of schduleUnit.courseIDList) {
                    listID = "LIST" + String(conflict);
                    let listCor = document.getElementById(listID);
                    listCor.style.color = "red";
                }
            }

        } else {
            schdule.set(id, new Schdule(1, [courseID]));
        }

        // tempid找pos
        if (tempIDbindbtn.has(courseID)) {
            let bind = tempIDbindbtn.get(courseID);
            bind.push(id);
        } else {
            tempIDbindbtn.set(courseID, [id]);
        }

    }
    courseID++;
}


// ========== 資料回傳 ==========
window.addEventListener("message", function (event) {
    let [site, type, data] = event.data;
    //debug
    console.log("偵測到信息傳入來自" + site);

    //處理 (produce courseListView)新增資料 的事
    if (type == "type 1") {

        //處理右邊list表格的新增
        makeCourseListView(data);

        //處理左邊tableView的新增 與 處理衝堂
        makeUserTableView(data);
    } else {
        row = data[0];
        col = data[1];
        document.getElementById(L_TABLE_DOM_ID).remove();
        InitialView();
    }
});

// 

function exportJson() {
    let courseName = document.getElementsByClassName(COURSE_CLASS_NAME);
    let courseCredit = document.getElementsByClassName(COURSE_CLASS_CREDIT);
    let courseTeacher = document.getElementsByClassName(COURSE_CLASS_TEACHER);
    let courseCode = document.getElementsByClassName(COURSE_CLASS_CODE);
    let courseTime = document.getElementsByClassName(COURSE_CLASS_TIME);

    let exportList = [];

    // 包含物件的List
    for (let i = 0; i < courseName.length; i++) {
        exportList.push(new Course(courseName[i].textContent, courseCredit[i].textContent, courseTeacher[i].textContent, courseCode[i].textContent, courseTime[i].textContent.split(' ')));
    }

    const jsonStr = JSON.stringify(exportList);

    // Blob 
    const blob = new Blob([jsonStr], { type: "application/json" });


    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = "lists.json";


    document.body.appendChild(downloadLink);
    downloadLink.click();
}


//drop dile
var fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', function (event) {
    var file = event.target.files[0];
    var reader = new FileReader();

    reader.onload = function (event) {
        var fileContent = event.target.result;
        var ALLcourse = JSON.parse(fileContent);


        for (let course of ALLcourse) {
            //處理右邊list表格的新增
            makeCourseListView(course);

            //處理左邊tableView的新增 與 處理衝堂
            makeUserTableView(course);
        }

    };

    reader.readAsText(file);
});

function exportCode() {
    let textView = document.getElementById("code");

    if (textView) {
        let strs = "";
        for (let str of document.getElementsByClassName(COURSE_CLASS_CODE)) {
            console.log(strs);
            strs += (str.textContent + '\n');
        }

        textView.value = strs;
    }

}

function RCsetting() {
    let rc = window.open("./html/RC.html", "_blank", "width=500,height=500, top=100, left=500");
}