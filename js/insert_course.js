// ====== GLOBAL VARIABLES ======
// 紀錄被選中的 button 
button_map = new Map();

// ====== FUNCTION ======

// 當按鈕被點擊時撥放動畫
function button_animation(id) {
    let button = document.getElementById(id);

    // 以下為點擊動畫
    // 已經點過一次
    if (button_map.has(id)) {
        //刪除紀錄
        button_map.delete(id);

        button.style.backgroundColor = "#f2f2f2";
        // 滑鼠經過
        button.addEventListener("mouseover", function () {
            button.style.background = "#b8b8b8";
        });
        // 滑鼠移出
        button.addEventListener("mouseout", function () {
            button.style.background = "#f2f2f2";
        });

        button.innerText = " ";
    }
    // 並未點過
    else {
        //新增紀錄
        button_map.set(id, null);

        button.style.backgroundColor = "dodgerblue";
        // 滑鼠經過
        button.addEventListener("mouseover", function () {
            button.style.background = "blue";
        });
        // 滑鼠移出
        button.addEventListener("mouseout", function () {
            button.style.background = "dodgerblue";
        });

        button.innerText = "已選中";
    }
}

// 課表選擇繪製
function init_table(row = 10, col = 6) { // 10堂課、6天
    // 因為有空行所以需要再+1
    col++;
    row++;

    // 選擇_表格
    let table = document.getElementById("userInputRight");
    let table_str = "<table id='courseTable'>"

    for (let i = 0; i < row; i++) {
        table_str += "<tr>";
        for (let j = 0; j < col; j++) {
            // 左上空格
            if (i == 0 && j == 0) {
                table_str = table_str + "<th class='colTitleText'></th>";
            }
            //處理表格日期標題的部分
            else if (i == 0) {//第一格要空格，放節數
                table_str = table_str + "<th class='rowTitleText'>" + rowTitleText[j - 1] + "</th>";
            }
            // 處理節數標題(側)的部分
            else if (j == 0 && i != 0) {
                table_str = table_str + "<th class='colTitleText'>" + colTitleText[i] + "</th>";
            }
            //處理其他地方
            else {
                let id = String(i) + "-" + String(j);
                table_str = table_str + "<td><button id='" + String(id) + "' onclick='button_animation(\"" + String(id) + "\")'></button></td>";
            }
        }
        table_str += "</tr>";
    }
    table_str += "</table>";
    table.innerHTML += table_str;
}

// 新增按鈕
function insert() {
    let user_inputs = document.getElementsByClassName("userInputs");

    // 如果課程代碼為空不給新增
    if (user_inputs[0].value.length != 0) {
        // 擷取 URL 中的參數
        const urlParams = new URLSearchParams(window.location.search);
        const dataParam = urlParams.get('data');

        // 將 URL 參數中的 JSON 字串轉換成 JavaScript 物件
        const DATA = JSON.parse(decodeURIComponent(dataParam));

        map = {
            "class_str": [DATA["class_now"]],
            "checkbox": false,
            "code": user_inputs[0].value,
            "name": user_inputs[1].value,
            "hour": user_inputs[2].value,
            "credit": user_inputs[3].value,
            "teacher": user_inputs[4].value,
            "time": user_inputs[5].value,
            "place": user_inputs[6].value,
            "link": user_inputs[7].value,
            "note": user_inputs[8].value,
            "coordinate": [],
        };

        // 將 button_map 座標導入
        for (let key of button_map.keys()) {
            map["coordinate"].push(key);
        }

        // 傳入子網址與課程信息 [網址, 方法, 資料]
        let data = ["insert.html", "insert", [map]];

        //debug 
        console.log("傳出信息中 => 主網址: ");

        console.log(map["coordinate"]);
        alert(map["coordinate"]);
        window.opener.postMessage(data, "*");
        window.close();
    }else{
        alert("課目代碼為空，新增失敗");
    }


}


// ====== EXCUTE ======
// 接受信息 
let row = JSON.parse(localStorage.getItem('row'));
let col = JSON.parse(localStorage.getItem('col'));
let rowTitleText = JSON.parse(localStorage.getItem('rowTitleText'));
let colTitleText = JSON.parse(localStorage.getItem('colTitleText'));

if (row == null || col == null || rowTitleText == null || colTitleText == null) {
    console.log("insert頁面的基礎資料為 null");
}

// 繪製課表
init_table();