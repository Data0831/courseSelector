// ======= CLASS DEFINE 資料定義 ======

// 設定
class SETTING {
    static colspan_width_when_course_empty = 10;
    static COL_TITLE_LIST = ["", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"]
    static ROW_TITLE_LIST = ["", "第一節<br>0810-0900", "第二節<br>0910-1000", "第三節<br>1010-1100", "第四節<br>1110-1200", "中午  <br>1210-1300", "第五節<br>1310-1400", "第六節<br>1410-1500", "第七節<br>1510-1600", "第八節<br>1610-1700", "傍晚  <br>1710-1800", "第十節<br>1820-1910", "第十節<br>1915-2005", "第十一節<br>2015-2105", "第十二節<br>2110-2200"]
    static github_name = "courseSelector"
    static file_name = "course.json";
}

// 資料處理x
class COURSE {
    static course_json = undefined;
    static dp_dict = undefined; // 系所與課程 department and class
    static code_dict = undefined;
    static selected_code_list = [];
    static conflict_dict = {};

    // 初始化 與 檔案讀取
    static async init() {
        try { // local path
            const response = await fetch(`/${SETTING.file_name}`); // 讀取檔案
            this.course_json = await response.json(); // 檔案變成 dict json
        } catch (error) { // github_path
            const response = await fetch(`/${SETTING.github_name}/${SETTING.file_name}`);
            this.course_json = await response.json();
            console.error(error); // 如果讀取失敗，則顯示錯誤訊息
        }
        this.dp_dict = this.course_json["department"];
        this.code_dict = this.course_json["code_dict"];
    }

    // 對 selected_code_list 增加 code
    static add_code(code) {
        // 衝堂
        for (const time of this.code_dict[code]["time"]) {
            if (Object.keys(this.conflict_dict).includes(time)) this.conflict_dict[time] += 1;
            else this.conflict_dict[time] = 1;
        }

        // 增加
        this.selected_code_list.push(code);
    }

    // 對 selected_code_list 移除 code
    static rmv_code(code) {
        // 衝堂
        for (const time of this.code_dict[code]["time"]) this.conflict_dict[time] -= 1;

        // 移除
        this.selected_code_list.splice(this.selected_code_list.indexOf(code), 1);
    }

    // is 系列
    static is_selected(code) {
        return this.selected_code_list.includes(code);
    }

    /** 確認 code 是否有衝堂
     * @returns {int} 0 表示沒有衝堂 1 表示選擇後將會衝堂 2 表示有衝堂
     */
    static is_conflict(code) {
        let conflict_status = 0;
        for (const time of this.code_dict[code]["time"]) {
            let num = this.conflict_dict[time];
            if (num != undefined) {
                if (num > 1) {
                    conflict_status = 2;
                    break;
                } else if (num == 1) {
                    conflict_status = 1;
                }
            }
        }

        return conflict_status;
    }

    // getter
    static get_credit() {
        let compulsory_credit = 0;
        let elective_credit = 0;
        for (const code of this.selected_code_list) {
            if (COURSE.code_dict[code]["selection"] === "必修") {
                compulsory_credit += parseInt(COURSE.code_dict[code]["credit"]);
            }
            else {
                elective_credit += parseInt(COURSE.code_dict[code]["credit"]);
            }
        }

        return [compulsory_credit, elective_credit];
    }

    /**
     * 根據系所代碼取得所有班級課程
     * @param {string} dp_value - 系所代碼
     * @returns {dict} - 所有班級課程
     */
    static get_all_class(dp_value) {
        return this.dp_dict[dp_value]["class"];
    }

    /**
     * 根據系所代碼取得所有班級課程
     * @param {string} dp_value - 系所代碼
     * @returns {dict} - 所有教師
     */
    static get_all_teacher(dp_value) {
        return this.dp_dict[dp_value]["teacher"];
    }

    /**
     * 根據系所班級代碼取得班級課程
     * get class dict by department and class value
     * @param {string} dp_value - 系所代碼 "05"
     * @param {string} cl_value - 班級代碼 名稱 "UI1B"
     * @returns {dict} - 系所的課程 "name":"", "code":[]
     */
    static get_cl_dict_by_dp_cl_value(dp_value, cl_value) {
        return this.dp_dict[dp_value]["class"][cl_value];
    }

    static get_code_list_from_class(dp_value, cl_value){
        return this.dp_dict[dp_value]["class"][cl_value]["code_list"];
    }

    static get_ta_dict_by_dp_ta_value(dp_value, ta_value) {
        return this.dp_dict[dp_value]["teacher"][ta_value];
    }

    /**
     * @returns {array} - [0] row [1] col
     */
    static get_max_rc_from_conflict_dict() {
        let max_row = 9;
        let max_col = 5;

        for (const [key, value] of Object.entries(this.conflict_dict)) {
            // 跳過不存在的
            if (this.conflict_dict[key] === 0) continue;

            // 如果存在且最大值符合就修改
            let row = parseInt(key.split("-")[0]);
            let col = parseInt(key.split("-")[1]);

            if (row > max_row) {
                max_row = row
            }
            if (col > max_col) {
                max_col = col;
            }
        }

        return [max_row, max_col];
    }
}

// ======= GLOBAL VARIABLES ======

// ======= CONST VARIABLES ======


// ======= FUNCTION 函式 ======

// 讀取 code.json


// === UI 處理 ===

// 副程式
function rmv_sel(id) {
    document.getElementById(id).innerHTML = "";
}

// 產生第一個 select
function generate_first_select() {
    let htmlString = "";
    htmlString +=
        `<select>
    <option value="">-- 未選擇 --</option>
    <option value="depatment">班級</option>
    <option value="teacher">教師</option>
    <option value="other">其他</option>
    </select>`;
    document.getElementById("sel1").innerHTML += htmlString;

    // 監聽選擇事件
    document.querySelector("#sel1 select").addEventListener("change", function () {
        rmv_sel("sel2");
        rmv_sel("sel3");
        if (document.querySelector("#sel1 select").value == "depatment") {
            generate_department_select();
        }
        else if (document.querySelector("#sel1 select").value == "teacher") {
            generate_department_teacher_select();
        }
        else if (document.querySelector("#sel1 select").value == "other") {
            generate_other_select();
        }
    });
}

// 副程式

function is_first_letter_is_alpha(str) {
    let firstChar = str.charAt(0);
    let unicode = firstChar.charCodeAt(0);

    if ((unicode >= 65 && unicode <= 90) || (unicode >= 97 && unicode <= 122)) {
        return true;
    }

    return false;
}

// 產生系所選單
function generate_department_select() { // id = SelDp
    let htmlString = "<select>"; // 選單內容字串

    for (const [dp_code, dict] of Object.entries(COURSE.dp_dict)) { // 所有系所部門資料與代碼
        if (!is_first_letter_is_alpha(dict["name"])) continue;
        htmlString += "<option value=" + dp_code + ">" + dict["name"] + "</option>"; // 產生選項

    }

    htmlString += "</select>";
    document.getElementById("sel2").innerHTML += htmlString; // 設定選單內容

    let department_select_ele = document.querySelector("#sel2 select"); // select元素

    // 默認選擇資工系
    department_select_ele.querySelector(`option[value="06"]`).selected = true;
    generate_class_select(department_select_ele.value);

    // 監聽選擇事件
    department_select_ele.addEventListener("change", function () {
        // 這便還未寫出，先留著 
        // 根據對應的系所部門來產生多個班級課程列表

        if (department_select_ele.value == "none") {
            console.log("使用者選擇了: 無");

            // 不要產生班級課程列表
            let class_select_ele = document.querySelector("#sel3 select"); // div元素
            class_select_ele.innerHTML = "<option value=\"none\">無</option>"; // 清除內容
        }
        else {
            console.log("使用者選擇了: " + COURSE.dp_dict[department_select_ele.value]["name"]);

            // 產生班級課程列表
            generate_class_select(department_select_ele.value);
        }
    });
}

// 產生班級選單
/**
 * @param {string} dp_value - 系所代碼
 */

function generate_class_select(dp_value) {

    let htmlString = "<select><option value=\"none\">無</option>"; // 選單內容字串
    let class_option_data = COURSE.get_all_class(dp_value);

    for (const [class_code, dict] of Object.entries(class_option_data)) { // 所有系所部門資料與代碼
        htmlString += "<option value=" + class_code + ">" + class_code + " " + dict["name"] + "</option>"; // 產生選項
    }

    htmlString += "</select>";
    document.getElementById("sel3").innerHTML = htmlString;

    let class_select_ele = document.querySelector("#sel3 select"); // select元素
    class_select_ele.innerHTML += htmlString; // 設定選單內容
    class_select_ele.selectedIndex = 0; // 默認設定為 0 無

    // 監聽選擇事件
    class_select_ele.addEventListener("change", function () {
        // 這便還未寫出，先留著

        // log
        if (class_select_ele.value == "none") {
            console.log("使用者選擇了: 無");
            // 不要產生班級課程列表
        }
        else {
            console.log("使用者選擇了: " + class_select_ele.value + " " + class_option_data[class_select_ele.value]["name"]);

            // 產生班級課程列表
            generate_class_course([dp_value, class_select_ele.value]);
        }
    });
}


function generate_department_teacher_select() {
    let htmlString = "<select>"; // 選單內容字串

    for (const [dp_code, dict] of Object.entries(COURSE.dp_dict)) { // 所有系所部門資料與代碼
        htmlString += "<option value=" + dp_code + ">" + dict["name"] + "</option>"; // 產生選項
    }

    htmlString += "</select>";
    document.getElementById("sel2").innerHTML += htmlString; // 設定選單內容

    let department_select_ele = document.querySelector("#sel2 select"); // select元素

    // 默認選擇資工系
    department_select_ele.querySelector(`option[value="06"]`).selected = true;
    generate_teacher_select(department_select_ele.value);

    // 監聽選擇事件
    department_select_ele.addEventListener("change", function () {
        // 這便還未寫出，先留著 
        // 根據對應的系所部門來產生多個班級課程列表

        if (department_select_ele.value == "none") {
            console.log("使用者選擇了: 無");

            // 不要產生班級課程列表
            let class_select_ele = document.querySelector("#sel3 select"); // div元素
            class_select_ele.innerHTML = "<option value=\"none\">無</option>"; // 清除內容
        }
        else {
            console.log("使用者選擇了: " + COURSE.dp_dict[department_select_ele.value]["name"]);

            // 產生班級課程列表
            generate_teacher_select(department_select_ele.value);
        }
    });
}

function generate_teacher_select(dp_value) {

    let htmlString = "<select><option value=\"none\">無</option>"; // 選單內容字串
    let teacher_option_data = COURSE.get_all_teacher(dp_value);

    for (const [teacher_code, dict] of Object.entries(teacher_option_data)) { // 所有系所部門資料與代碼
        htmlString += "<option value=" + teacher_code + ">" + dict["name"] + "</option>"; // 產生選項
    }

    htmlString += "</select>";
    document.getElementById("sel3").innerHTML = htmlString;

    let teacher_select_ele = document.querySelector("#sel3 select"); // select元素
    teacher_select_ele.innerHTML += htmlString; // 設定選單內容
    teacher_select_ele.selectedIndex = 0; // 默認設定為 0 無

    // 監聽選擇事件
    teacher_select_ele.addEventListener("change", function () {
        // 這便還未寫出，先留著

        // log
        if (teacher_select_ele.value == "none") {
            console.log("使用者選擇了: 無");
            // 不要產生班級課程列表
        }
        else {
            console.log("使用者選擇了: " + teacher_select_ele.value + " " + teacher_option_data[teacher_select_ele.value]["name"]);

            // 產生班級課程列表
            generate_teacher_course([dp_value, teacher_select_ele.value]);
        }
    });
}

function generate_other_select() { // id = SelDp
    let htmlString = "<select><option value=\"none\">無</option>"; // 選單內容字串

    for (const [code, dict] of Object.entries(COURSE.course_json["other"])) { // 所有系所部門資料與代碼
        htmlString += "<option value=" + code + ">" + dict["name"] + "</option>"; // 產生選項
    }

    htmlString += "</select>";
    document.getElementById("sel2").innerHTML += htmlString; // 設定選單內容

    let type_select_ele = document.querySelector("#sel2 select"); // select元素

    // 監聽選擇事件
    type_select_ele.addEventListener("change", function () {
        // 這便還未寫出，先留著 
        // 根據對應的系所部門來產生多個班級課程列表

        if (type_select_ele.value == "none") {
            console.log("使用者選擇了: 無");
        }
        else {
            console.log("使用者選擇了: " + COURSE.course_json["other"][type_select_ele.value]["name"]);
            generate_other_course([type_select_ele.value])
        }
    });
}


// 根據班級產生課程列表
/**
 * @param {string} dp_value - 系所代碼
 * @param {string} class_value - 班級名稱
 * @param {dict} code_list - 班級課程列表
*/

// 生成完整課表 包含 tabs 和 list
function generate_class_course(arr) {
    // arr[0] = dp_value, arr[1] = class_value
    const code_list = COURSE.get_code_list_from_class(arr[0], arr[1]);
    generate_course_table(arr[1], code_list, generate_class_course, arr)
}

function generate_teacher_course(arr) {
    // arr[0] = dp_value, arr[1] = teacher_value
    const class_dict = COURSE.get_ta_dict_by_dp_ta_value(arr[0], arr[1]);
    const code_list = class_dict["code_list"];
    generate_course_table(arr[1], code_list, generate_teacher_course, arr)
}

function generate_other_course(arr) {
    // arr[0] = type_value
    const code_list = COURSE.course_json["other"][arr[0]]["code_list"];
    generate_course_table(COURSE.course_json["other"][arr[0]]["name"], code_list, generate_other_course, arr)
}

// 生成使用者選擇的課程列表
function generate_selected_course(arr) {
    const code_list = COURSE.selected_code_list;
    generate_course_table("使用者", code_list, generate_selected_course, arr)

    let compulsory_credit, elective_credit;
    [compulsory_credit, elective_credit] = COURSE.get_credit();

    let htmlString = `
        <tr>
            <td class="compulsory">必修</td>
            <td>${compulsory_credit}</td>
            <td class="elective">選修</td>
            <td>${elective_credit}</td>
        </tr>
        <tr>
            <td class="all_credit">總學分</td>
            <td>${compulsory_credit + elective_credit}</td>
        </tr>
    `

    document.getElementById("course-tbody").insertAdjacentHTML('beforeend', htmlString);
    // document.getElementById("course-tbody").innerHTML += htmlString
}

// 副程式
function generate_course_table(name, code_list, refresh, arr) {
    let course_tbody = document.querySelector("#course-tbody");
    course_tbody.innerHTML = "";

    if (name === "none") {
        course_tbody.innerHTML = `<tr><td colspan='${SETTING.colspan_width_when_course_empty}'>使用者未選擇</td></tr>`;
        return;
    }

    // 如果 code_list 為空
    if (code_list.length === 0) {
        console.log(`${name}班級課程列表為空`);
        alertSystem.showAlert(`${name}班級課程列表為空`);
        course_tbody.innerHTML = `<tr><td colspan='${SETTING.colspan_width_when_course_empty}'>班級課程列表為空</td></tr>`;
        return;
    }

    console.log(`生成 ${name} 的課程列表`);

    // 將 tr html 字串加入 table 內
    course_tbody.innerHTML += make_tr_html_by_code_list(code_list);

    // 使用委派方式來統一處理 checkbox 事件
    course_tbody.querySelectorAll("input[type='checkbox']").forEach((checkbox, index) => {
        checkbox.addEventListener("change", function () {

            if (COURSE.is_selected(code_list[index])) {
                console.log("使用者刪除了課程: " + code_list[index]);
                alertSystem.showAlert(`${code_list[index]} 移除成功`);
                COURSE.rmv_code(code_list[index]);
            }
            else {
                console.log("使用者選擇了課程: " + code_list[index]);
                alertSystem.showAlert(`${code_list[index]} 加選成功`);
                COURSE.add_code(code_list[index]);
            }

            refresh(arr);
        });
    });

}




// 副程式: 產生 tr 的 HTML 字串
/**
 * @param {list} code_list - 課程代碼列表
 * @returns {string} - tr 的 HTML 字串
 */
function make_tr_html_by_code_list(code_list) {
    const code_dict = COURSE.code_dict;
    let htmlString = "";

    for (const code of code_list) {
        const one_code_dict = code_dict[code];
        let checked = COURSE.is_selected(code) ? "checked" : "";

        const time_string = one_code_dict["time_string"].replace(/\|/g, "|<br/>");
        let selection_color_class = (one_code_dict["selection"] == "必修") ? "compulsory" : "elective";

        let teacher = one_code_dict["teacher"];
        if (teacher == "") {
            teacher = "未排教師";
        }

        let conflict_class = "";
        if (COURSE.is_conflict(code) === 1) {
            conflict_class = "will_conflict_tr";
        } else if (COURSE.is_conflict(code) === 2) {
            conflict_class = "is_conflict_tr";
        }

        // 使用模板字面值來生成 HTML 字串
        htmlString += `
        <tr class='${conflict_class} id='${code}_tr'>
            <td class='status'><input type='checkbox' ${checked}></td>
            <td class='code'><a href='https://selquery.ttu.edu.tw/Main/syllabusview.php?SbjNo=${code}' target='_blank' title='詳細資訊'>${code}</a></td>
            <td class='name'><a href='https://selquery.ttu.edu.tw/Main/SbjDetail.php?SbjNo=${code}' target='_blank' title='詳細資訊'>${one_code_dict["name"]}</a></td>
            <td class='teacher'>${teacher}</td>
            <td class='selection ${selection_color_class}'>${one_code_dict["selection"]}</td>
            <td class='credit'>${one_code_dict["credit"]}</td>
            <td class='hour'>${one_code_dict["hour"]}</td>
            <td class='time_string'>${time_string}</td>
            <td class='c_type_str'>${one_code_dict["c_type_str"]}</td>
            <td class='note'>${one_code_dict["note"]}</td>
        </tr>`;
    }

    return htmlString;
}

function open_schedule() {
    let tableHTML = document.querySelector('#schedule-view table').innerHTML;
    localStorage.setItem('tableHTML', tableHTML);
}

// 複製課程代碼
function copy_code() {
    let codes_text = "";

    for (const code of COURSE.selected_code_list) {
        codes_text += code + "\n";
    }

    navigator.clipboard.writeText(codes_text)
        .then(() => {
            console.log(`成功複製 ${codes_text} 到剪貼簿`);
            alertSystem.showAlert(`成功複製 ${codes_text} 到剪貼簿`);
        })
        .catch((error) => {
            console.error("複製失敗", error);
            alertSystem.showAlert("複製失敗");
        });

}

// ==== 導入json button ====
// 讀取json檔案
function json_upload(event) {
    console.log("json_upload()");
    // 獲取事件目標（input file 元素）的第一個選定文件
    var file = event.target.files[0];
    // 創建一個 FileReader 物件來讀取文件內容
    var reader = new FileReader();

    // 當 FileReader 完成讀取時觸發的事件處理程序
    reader.onload = function (event) {
        // 獲取文件內容
        var fileContent = event.target.result;
        // 將文件內容解析為 JSON 格式
        console.log(`使用者匯入 ${JSON.parse(fileContent)}`);
        alertSystem.showAlert(`使用者匯入 ${JSON.parse(fileContent)}`);
        COURSE.selected_code_list = COURSE.selected_code_list.concat(JSON.parse(fileContent));
        generate_selected_course([]);
    };

    // 將文件內容讀取為文本
    reader.readAsText(file);

}

function json_download() {
    console.log("json_download()");
    // 將列表轉換為 JSON 字符串
    const jsonData = JSON.stringify(COURSE.selected_code_list);

    alertSystem.showAlert(`使用者下載了 data.json`);

    // 創建一個隱藏的 <a> 元素來下載檔案
    const downloadLink = document.createElement("a");
    downloadLink.href = "data:text/json;charset=utf-8," + encodeURIComponent(jsonData);
    downloadLink.download = "data.json";

    // 觸發下載
    downloadLink.click();
}


// add event listener
document.getElementById('show-schedule').addEventListener('click', function () {
    document.getElementById('schedule-view').style.display = 'flex';

    let table = document.querySelector('#schedule-view table');
    table.innerHTML = "";
    let [row, col] = COURSE.get_max_rc_from_conflict_dict();

    // 標題 星期日 ~ 星期一
    let htmlString = "<thead><tr>";
    for (let i = col; i >= 0; i--) {
        htmlString += `<th>${SETTING.COL_TITLE_LIST[i]}</th>`;
    }
    htmlString += "</tr></thead><tbody id='schedule-tbody'>";

    // 課表
    for (let j = 1; j <= row; j++) {
        htmlString += "<tr>";
        for (let i = col; i > 0; i--) {
            htmlString += `<td id="${j}-${i}"></td>`;
        }

        // 標題 第一 ~ 最後一節
        htmlString += `<th>${SETTING.ROW_TITLE_LIST[j]}</th></tr>`
    }
    htmlString += "</tbody>";
    table.innerHTML = htmlString;

    // 填入課表
    const code_list = COURSE.selected_code_list;
    for (const code of code_list) {
        for (const time of COURSE.code_dict[code]["time"]) {
            let htmlString = `<div class='${code}'><a href='https://selquery.ttu.edu.tw/Main/SbjDetail.php?SbjNo=${code}' target='_blank' title='詳細資訊'>${code}</a><p>${COURSE.code_dict[code]["name"]}</p></div>`;

            document.getElementById(time).innerHTML += htmlString;
        }
    }

    let compulsory_credit, elective_credit;
    [compulsory_credit, elective_credit] = COURSE.get_credit();
    table.innerHTML += `
    <tr>
        <td class="compulsory">必修</td>
        <td>${compulsory_credit}</td>
        <td class="elective">選修</td>
        <td>${elective_credit}</td>
    </tr>
    <tr>
        <td class="all_credit">總學分</td>
        <td>${compulsory_credit + elective_credit}</td>
    </tr>
`
});

document.getElementById('close-schedule').addEventListener('click', function () {
    document.getElementById('schedule-view').style.display = 'none';
});

class AlertSystem {
    constructor() {
        this.container = document.getElementById('alert-container');
        this.alerts = [];
    }

    showAlert(message) {
        if (this.alerts.length >= 5) {
            this.removeAlert(this.alerts[0]);
        }

        const alert = document.createElement('div');
        alert.className = 'alert';
        alert.textContent = message;

        this.container.appendChild(alert);
        this.alerts.push(alert);

        setTimeout(() => {
            alert.classList.add('show');
        }, 10);

        setTimeout(() => {
            this.removeAlert(alert);
        }, 2000);
    }

    removeAlert(alert) {
        alert.classList.add('hide');
        setTimeout(() => {
            this.container.removeChild(alert);
            this.alerts = this.alerts.filter(a => a !== alert);
        }, 300);
    }
}

// ====== Main ======
// 使用示例
const alertSystem = new AlertSystem();

async function main() {
    await COURSE.init(); // 初始讀取 code.json
    generate_first_select();

}

main();