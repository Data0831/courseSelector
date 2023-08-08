let row = defRow;
let col = defCol;

// ========== 主頁面部分 ==========

// ========== 左半表格 ==========

// f函式 介面初始化 可自訂表格大小
function InitialView() {
    //debug
    console.log("========== 初始化: row=" + String(row) + " col=" + String(col) + " ==========");

    // 獲取index 左半部分的位置
    let LContent = document.getElementById("LContent");

    //處理左半課表
    let tableString = "<table id = 'userTableView'>";
    for (let i = 0; i < row; i++) {
        tableString += "<tr>";

        for (let j = 0; j < col; j++) {
            // 左上空格
            if (i == 0 && j == 0) {
                tableString = tableString + "<th>" + "<input class='colTitleText' type='text'></th>";
            }
            //處理表格日期標題的部分
            else if (i == 0) {//第一格要空格，放節數
                tableString = tableString + "<th>" + "<input class='rowTitleText' type='text' value='" + rowTitle[j] + "'></th>";
            }
            // 處理節數標題(側)的部分
            else if (j == 0 && i != 0) {
                tableString = tableString + "<td>" + "<input class='colTitleText' type='text' value='" + colTitle[i] + "'></td>";
            }
            //處理其他地方
            else {
                // 給id 製造pos座標
                let pos = String(i) + '-' + String(j);
                tableString = tableString + "<td id='" + pos + "'></td>";
            }
        }
        tableString += "</tr>";
    }
    tableString += "</table>";

    //將左半部分插入表格
    LContent.innerHTML += tableString;
}

InitialView();// 介面 初始化

// ========== 右半表格 ==========


// _______________________________ <ID資料管理 _______________________________
// 課程ID (不重複)
let courseID = 0;
// 透過課程ID可獲得課程基礎資料

// courseID: 為一部重複令牌，從數字0每給一次就加1
// listIdName為ID前綴可在data.js修改
function getListID(courseID) {
    return listIdName + String(courseID);
}

// posID: 為插入button元件的位置 ex: '1-1'
// tbBtnIdName為ID前綴可在data.js修改
function getTableBtnID(posID, courseID) {
    return tbBtnIdName + String(posID) + '.' + String(courseID);
}

//透過courseID獲取posID 
function getposIDList(courseID) {
    //courseListRow 指的是courseListView的其中一列
    let courseListRow = document.getElementById(getListID(courseID));
    // courseTime是根據class Course設計
    let posIDList = courseListRow.getElementsByClassName("courseTime")[0].textContent.split(' ');
    // contentText可以取出裡面的內容，通常是不能變動的才能用contentText
    return posIDList;
}

// _______________________________ ID資料管理> _______________________________


// _______________________________ <刪除與隱藏 _______________________________
// f函式確認刪除後的資料
function schduleConfirm(tmpid) {

}
function hidden(courseID) {
    let posIDList = getposIDList(courseID);

    for (let posID of posIDList) {
        tableBtnID = getTableBtnID(posID, courseID);

        // 移除schduleChecked
        let schdule = schduleChecked.get(posID);
        schdule.size -= 1;

        if (schdule.size == 1) {
            // 還原背景顏色
            document.getElementById(posID).style.background = "white";

            // 變更字體顏色: 綠色代表隱藏
            for (let course_ID of schduleChecked.get(posID).tempIDs) {
                document.getElementById(getListID(course_ID)).style.color = "black";
            }
        }

        let rmv = schdule.tempIDs.indexOf(courseID);
        schdule.tempIDs.splice(rmv, 1);
        document.getElementById(tableBtnID).remove();
    }

}

function show(xid) {
    console.log("show");

    let courseListView = document.getElementById("LIST" + xid);
    let courseName = courseListView.getElementsByClassName("courseName");
    let courseCredit = courseListView.getElementsByClassName("courseCredit");
    let courseTeacher = courseListView.getElementsByClassName("courseTeacher");
    let courseCode = courseListView.getElementsByClassName("courseCode");
    let courseTime = courseListView.getElementsByClassName("courseTime");
    // console.log(courseCode);

    let course = new Course(courseName[0].textContent, courseCredit[0].textContent, courseTeacher[0].textContent, courseCode[0].textContent, courseTime[0].textContent.split(' '));

    for (let id of course.time) {
        //設定BTN位置
        console.log(id);
        let tableTd = document.getElementById(id);
        let newID = id + "." + xid;
        tableTd.innerHTML += "<button id='" + String(newID) + "'>" + course.name + "</button>";


        //設定衝堂資料
        if (schduleChecked.has(id)) {
            //處理schduleChecked資料
            let schdule = schduleChecked.get(id);
            schdule.size += 1;
            schdule.tempIDs.push(xid);

            if (schdule.size > 1) {
                //處理table背景
                let tdBcCor = document.getElementById(id);
                tdBcCor.style.background = "red";

                //處理list背景
                for (let conflict of schdule.tempIDs) {
                    listID = "LIST" + String(conflict);
                    let listCor = document.getElementById(listID);
                    listCor.style.color = "red";
                }
            }

        } else {
            schduleChecked.set(id, new Schdule(1, [xid]));
        }
    }

}
// 按鈕
function hidding(id) {
    let type = document.getElementById("CON" + id);
    if (type.innerText == "隱藏") {
        type.innerText = "展示";
        hidden(id);
    } else {
        type.innerText = "隱藏";
        show(id);
    }
}

function removeCourse(id) {
    let listID = "LIST" + String(id);
    document.getElementById(listID).remove();
    let posList = tempIDbindbtn.get(id);

    for (let i of posList) {
        btnPosID = String(i + "." + id);

        // 移除schduleChecked
        let schdule = schduleChecked.get(i);
        schdule.size -= 1;

        let rmv = schdule.tempIDs.indexOf(id);
        schdule.tempIDs.splice(rmv, 1);
        document.getElementById(btnPosID).remove();

        if (schdule.size == 1) {
            document.getElementById(i).style.background = "white";
            document.getElementById("LIST" + schduleChecked.get(i).tempIDs[0]).style.color = "black";
        }
    }
    tempIDbindbtn.delete(id);


}

// _______________________________ 刪除與隱藏> _______________________________


// ========== 下方控制 ==========

// 插入表格 喚出設定表單

let settingWindow;
function insertCourse() {
    // let width = 400+70*(col-1);
    // let left = 


    settingWindow = window.open("./html/insertCourse.html", "_blank", "width=1000,height=600, top=100, left=500");


    // 傳遞資料給setting

    rowTitleText = document.getElementsByClassName("rowTitleText");
    colTitleText = document.getElementsByClassName("colTitleText");
    let rowTitleList = [];
    let colTitleList = [];

    // 傳入DOM造成錯誤，所以將DOM轉成String List傳入
    for (let i = 0; i < rowTitleText.length; i++) {
        rowTitleList.push(rowTitleText[i].value);
    }
    for (let i = 0; i < colTitleText.length; i++) {
        colTitleList.push(colTitleText[i].value);
    }

    // 資料存到本地給子視窗使用
    localStorage.setItem('row', JSON.stringify(row));
    localStorage.setItem('col', JSON.stringify(col));
    localStorage.setItem('rowTitleText', JSON.stringify(rowTitleList));
    localStorage.setItem('colTitleText', JSON.stringify(colTitleList));

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
        + "<hr><button id='CON" + String(courseID) + "' onclick='hidding(" + String(courseID) + ")'>隱藏</button></td>"
        + "<td class='courseTime'>" + Time + "</td>"
        + "</tr>"
    courseListView.innerHTML += courseListStr;
}

// f函式，被 (produce courseListView)新增資料 使用
// f函式，處理衝堂
let schduleChecked = new Map();
let tempIDbindbtn = new Map(); //透過tempID尋找btn

function makeUserTableView(data) {
    for (let id of data.time) {
        //設定BTN位置
        console.log(id);
        let tableTd = document.getElementById(id);
        let newID = id + "." + courseID;
        tableTd.innerHTML += "<button id='" + String(newID) + "'>" + data.name + "</button>";


        //設定衝堂資料
        if (schduleChecked.has(id)) {
            //處理schduleChecked資料
            let schdule = schduleChecked.get(id);
            schdule.size += 1;
            schdule.tempIDs.push(courseID);

            if (schdule.size > 1) {
                //處理table背景
                let tdBcCor = document.getElementById(id);
                tdBcCor.style.background = "red";

                //處理list背景
                for (let conflict of schdule.tempIDs) {
                    listID = "LIST" + String(conflict);
                    let listCor = document.getElementById(listID);
                    listCor.style.color = "red";
                }
            }

        } else {
            schduleChecked.set(id, new Schdule(1, [courseID]));
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
        document.getElementById("userTableView").remove();
        InitialView();
    }
});

// 

function exportJson() {
    let courseName = document.getElementsByClassName("courseName");
    let courseCredit = document.getElementsByClassName("courseCredit");
    let courseTeacher = document.getElementsByClassName("courseTeacher");
    let courseCode = document.getElementsByClassName("courseCode");
    let courseTime = document.getElementsByClassName("courseTime");

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
        for (let str of document.getElementsByClassName("courseCode")) {
            console.log(strs);
            strs += (str.textContent + '\n');
        }

        textView.value = strs;
    }

}

function RCsetting() {
    let rc = window.open("./html/RC.html", "_blank", "width=500,height=500, top=100, left=500");
}