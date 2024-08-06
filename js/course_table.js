
// ====== FUNCTION ======
//介面初始化，根據row、col修改表格大小
function init_table(row = 11, col = 7) {

    // 獲取index 左半部分的位置
    let table = document.getElementById("courseTable");

    //debug
    if (table == null) console.log("table為空 init_table()");
    console.log("========== 初始化: row=" + String(row) + " col=" + String(col) + " ==========");

    //處理左半課表
    let table_str = "<table id = '" + L_TABLE_DOM_ID + "'>";
    for (let i = 0; i < row; i++) {
        table_str += "<tr>";

        for (let j = 0; j < col; j++) {

            // 左上空格
            if (i == 0 && j == 0) {
                table_str = table_str + "<th>" + "<span class='" + TABLE_COL_TITLE_CLASS_NAME + "' type='text'></th>";
            }
            //處理表格日期標題的部分
            else if (i == 0) {//第一格要空格，放節數
                table_str = table_str + "<th>" + "<span class='" + TABLE_ROW_TITLE_CLASS_NAME + "'>" + ROW_TITLE_LIST[j] + "</span></th>";
            }
            // 處理節數標題(側)的部分
            else if (j == 0 && i != 0) {
                table_str = table_str + "<th>" + "<span class='" + TABLE_COL_TITLE_CLASS_NAME + "'>" + COL_TITLE_LIST[i] + "</span></th>";
            }
            //處理其他地方
            else {
                table_str = table_str + "<td id='" + String(i) + "-" + String(j) + "'></td>";
            }
        }
        table_str += "</tr>";
    }
    table_str += "</table>";

    //將左半部分插入表格
    table.innerHTML += table_str;
}

function draw_table() {
    // 擷取 URL 中的參數
    const urlParams = new URLSearchParams(window.location.search);
    const dataParam = urlParams.get('data');

    // 將 URL 參數中的 JSON 字串轉換成 JavaScript 物件
    const DATAS = JSON.parse(decodeURIComponent(dataParam));
    const DATA = DATAS[0];
    const MAP = new Map(DATAS[1]);



    // console.log(DATA);

    console.log(MAP, DATA);
    for (let data of DATA) {

        // 衝堂紅色
        let color = "";
        for (coordinate of data.coordinate) {
            if (MAP.has(coordinate) && MAP.get(coordinate) > 1) {
                color = "style='color: red;'";
                break;
            }
        }

        for (coordinate of data.coordinate) {
            let td = document.getElementById(coordinate);
            td.innerHTML += "<button class = '" + data.code + "'" + color + "> " + data.name + "</button>"
        }
    }

}

// ====== EXECUTE ======
init_table();
draw_table();