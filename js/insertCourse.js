// ========== 接受信息 ==========
let row = JSON.parse(localStorage.getItem('row'));
let col = JSON.parse(localStorage.getItem('col'));
let rowTitleText = JSON.parse(localStorage.getItem('rowTitleText'));
let colTitleText = JSON.parse(localStorage.getItem('colTitleText'));


// ========== 主畫面 ==========

// ========== 左半 ==========

// ========== 右半 ==========
let insertCourseRightDiv = document.getElementById("insertCourseRightDiv");
// 選擇_表格
let choostTableStr = "<table id='chooseTable'>"
for (let i = 0; i < row; i++) {
    choostTableStr += "<tr>";

    for (let j = 0; j < col; j++) {
        // 左上空格
        if (i == 0 && j == 0) {
            choostTableStr = choostTableStr + "<th class='colTitleText'></th>";
        }
        //處理表格日期標題的部分
        else if (i == 0) {//第一格要空格，放節數
            choostTableStr = choostTableStr + "<th class='rowTitleText'>" + rowTitleText[j - 1] + "</th>";
        }
        // 處理節數標題(側)的部分
        else if (j == 0 && i != 0) {
            choostTableStr = choostTableStr + "<th class='colTitleText'>" + colTitleText[i] + "</th>";
        }
        //處理其他地方
        else {
            let id = String(i) + "-" + String(j);
            console.log(id);
            choostTableStr = choostTableStr + "<td><button id='" + String(id) + "' onclick='buttonChoose(\"" + String(id) + "\")'></button></td>";
        }
    }
    choostTableStr += "</tr>";
}
choostTableStr += "</table>";
insertCourseRightDiv.innerHTML += choostTableStr;

// 紀錄那些button 被選中
choosedButtonMap = new Map();
// 選擇表格中的button
function buttonChoose(id) {
    let chooedButton = document.getElementById(id);

    // 以下為點擊動畫
    // 已經點過一次
    if (choosedButtonMap.has(id)) {
        //刪除紀錄
        choosedButtonMap.delete(id);

        chooedButton.style.backgroundColor = "#f2f2f2";
        // 滑鼠經過
        chooedButton.addEventListener("mouseover", function () {
            chooedButton.style.background = "#b8b8b8";
        });
        // 滑鼠移出
        chooedButton.addEventListener("mouseout", function () {
            chooedButton.style.background = "#f2f2f2";
        });

        chooedButton.innerText = " ";
    }
    // 並未點過
    else {
        //新增紀錄
        choosedButtonMap.set(id, null);

        chooedButton.style.backgroundColor = "dodgerblue";
        // 滑鼠經過
        chooedButton.addEventListener("mouseover", function () {
            chooedButton.style.background = "blue";
        });
        // 滑鼠移出
        chooedButton.addEventListener("mouseout", function () {
            chooedButton.style.background = "dodgerblue";
        });

        chooedButton.innerText = "已選中";
    }
}

// ========== 控制 ==========

// ========== 新增按鈕 ==========
function add() {
    let name = document.getElementById("courseName").value;
    let credit = document.getElementById("courseCredit").value;
    let teacher = document.getElementById("courseTeacher").value;
    let code = document.getElementById("courseCode").value;
    let time = [];

    let choosedButtonMapKeys = choosedButtonMap.keys();
    for (let key of choosedButtonMapKeys) {
        time.push(key);
    }


    // 傳入子網址與課程信息
    let data = [window.location.href, "type 1", new Course(name, credit, teacher, code, time)];

    //debug 
    console.log("傳出信息中，主網址: ");
    window.opener.postMessage(data, "*");
    window.close();
}