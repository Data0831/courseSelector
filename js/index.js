// ======= CLASS DEFINE 資料定義 ======

// 設定
class SETTING {
    static colspan_width_when_code_list_is_empty = 10;
    static COL_TITLE_LIST = ["", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"]
    static ROW_TITLE_LIST = ["", "第一節 0810-0900", "第二節 0910-1000", "第三節 1010-1100", "第四節 1110-1200", "中午   1210-1300", "第五節 1310-1400", "第六節 1410-1500", "第七節 1510-1600", "第八節 1610-1700", "傍晚   1710-1800", "第十節 1820-1910", "第十節 1915-2005", "第十一節 2015-2105", "第十二節 2110-2200"]
}

// 資料處理
class COURSE {
    static course_json;
    static dp_dict; // 系所與課程 department and class
    static codes_dict;
    static code_list_selected = [];
    static conflict_dict = {};

    // 初始化
    /**
     * 初始化
     * @param {dict} json - code.json
     */
    static init(json) {
        this.course_json = json;
        this.dp_dict = json["selDp"];
        this.codes_dict = json["codes_dict"];
    } // 初始化


    // 增加與刪除
    /**
     * 將課程加入已選擇課程
     * @param {string} code - 課程代碼
     */
    static add_course_to_code_list_selected(code) {
        console.log("使用者選擇了課程: " + code);

        // 已選擇的課程
        this.code_list_selected.push(code);

        // 確認衝堂
        for (const time of this.codes_dict[code]["time"]) {
            if (Object.keys(this.conflict_dict).includes(time)) {
                this.conflict_dict[time] += 1;
            } else {
                this.conflict_dict[time] = 1;
            }
        }
    }

    static rmv_course_from_code_list_selected(code) {
        console.log("使用者刪除了課程: " + code);

        // 已選擇的課程
        this.code_list_selected.pop(code);

        // 衝堂
        for (const time of this.codes_dict[code]["time"]) {
            this.conflict_dict[time] -= 1;
        }
    }

    /**
     * @param {string} code - 課程代碼
     */
    static checkbox_change(code) {
        if (this.is_code_selected(code)) {
            this.rmv_course_from_code_list_selected(code);
        } else {
            this.add_course_to_code_list_selected(code);
        }
    }

    // is 系列
    static is_code_selected(code) {
        return this.code_list_selected.includes(code);
    }

    /**
     * @param {string} code - 課程代碼
     * @returns {int} 0 表示沒有衝堂 1 表示選擇後將會衝堂 2 表示有衝堂
     */
    static is_conflict(code) {
        let type = 0;
        for (const time of this.codes_dict[code]["time"]) {
            let num = this.conflict_dict[time];
            if (num != undefined) {
                if (num > 1) {
                    type = 2;
                    break;
                } else if (num == 1) {
                    type = 1;
                }
            }
        }

        return type;
    }


    // get 系列
    
    static get_credit(){
      let compulsory_credit = 0;
      let elective_credit = 0;
      for(const code of code_list_selected){
        if(COURSE.codes_dict[code]["type"] === "idk"){
          compulsory_credit += COURSE.codes_dict[code]["credit"];
        }
        else{
          elective_credit += COURSE.codes_dict[code]["credit"];
        }
      }
    }
    
    /**
     * 根據系所代碼取得班級課程
     * get department class by department value
     * @param {string} dp_value - 系所代碼
     * @returns {dict} - 系所的課程
     */
    static get_dp_cl_by_dp_value(dp_value) {
        return this.dp_dict[dp_value]["selCl"];
    }

    /**
     * 根據系所班級代碼取得班級課程
     * get class dict by department and class value
     * @param {string} dp_value - 系所代碼 "05"
     * @param {string} cl_value - 班級代碼 名稱 "UI1B"
     * @returns {dict} - 系所的課程 "name":"", "code":[]
     */
    static get_cl_dict_by_dp_cl_value(dp_value, cl_value) {
        return this.dp_dict[dp_value]["selCl"][cl_value];
    }

    /**
     * @returns {array} - [0] row [1] col
     */
    static get_max_rc_from_conflict_dict() {
        let max_row = 9;
        let max_col = 5;

        for (const [key, value] of Object.entries(this.conflict_dict)) {
            // 跳過不存在的
            if (this.conflict_dict[key] == 0) continue;

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
async function read_code_json() {
    try {
        const response = await fetch('../course_ori.json'); // 發送請求讀取 code.json
        const json = await response.json(); // 讀取 response 的 json 資料
        // console.log(json);
        return json; // 將資料回傳給程式碼
    } catch (error) {
        console.error(error); // 如果讀取失敗，則顯示錯誤訊息
    }
}

// === UI 處理 ===

// 產生系所選單
function generate_depatment_option() { // id = selDp
    let department_select_ele = document.getElementById("selDp"); // select元素
    let htmlString = ""; // 選單內容字串

    for (const [selDp_num, dict] of Object.entries(COURSE.dp_dict)) { // 所有系所部門資料與代碼
        htmlString += "<option value=" + selDp_num + ">" + dict["name"] + "</option>"; // 產生選項
    }

    department_select_ele.innerHTML += htmlString; // 設定選單內容

    // 默認選擇資工系
    department_select_ele.selectedIndex = 10;
    generate_class_select(department_select_ele.value);

    // 監聽選擇事件
    department_select_ele.addEventListener("change", function () {
        // 這便還未寫出，先留著 
        // 根據對應的系所部門來產生多個班級課程列表

        if (department_select_ele.value == "none") {
            console.log("使用者選擇了: 無");

            // 不要產生班級課程列表
            let class_select_ele = document.getElementById("selCl-span"); // div元素
            class_select_ele.innerHTML = ""; // 清除內容
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

    // div元素設定初始內容
    document.getElementById("selCl-span").innerHTML = `
    <select id=\"selCl\">
        <option value=\"none\">無</option>
    </select>`;

    let class_select_ele = document.getElementById("selCl"); // select元素
    let htmlString = ""; // 選單內容字串
    let class_option_data = COURSE.get_dp_cl_by_dp_value(dp_value);

    for (const [class_code, dict] of Object.entries(class_option_data)) { // 所有系所部門資料與代碼
        htmlString += "<option value=" + class_code + ">" + class_code + " " + dict["name"] + "</option>"; // 產生選項
    }

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
            generate_course_table(dp_value, class_select_ele.value);
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
function generate_course_table(dp_value, class_value) {
    const class_dict = COURSE.get_cl_dict_by_dp_cl_value(dp_value, class_value);
    const code_list = class_dict["code_list"];

    console.log(`生成 ${class_value} 的課程列表`);
    let course_tbody = document.getElementById("course-tbody");
    course_tbody.innerHTML = "";

    // 如果 code_list 為空
    if (code_list.length === 0) {
        console.log("班級課程列表為空");
        course_tbody.innerHTML = `<tr><td colspan='${SETTING.colspan_width_when_code_list_is_empty}'>班級課程列表為空</td></tr>`;
        return;
    }

    // 將 tr html 字串加入 table 內
    course_tbody.innerHTML += make_tr_html_by_code_list(code_list);

    // 使用委派方式來統一處理 checkbox 事件
    course_tbody.querySelectorAll("input[type='checkbox']").forEach((checkbox, index) => {
        checkbox.addEventListener("change", function () {
            COURSE.checkbox_change(code_list[index]);
            generate_course_table(dp_value, class_value);
        });
    });

}

// 生成使用者選擇的課程列表
function generate_selected_course_table() {
    const code_list = COURSE.code_list_selected;
    console.log(`生成 使用者 選擇的課程列表`);
    let course_tbody = document.getElementById("course-tbody");
    course_tbody.innerHTML = "";

    // 如果 code_list 為空
    if (code_list.length === 0) {
        console.log("使用者 未選擇課程");
        course_tbody.innerHTML = `<tr><td colspan='${SETTING.colspan_width_when_code_list_is_empty}'>使用者 未選擇課程</td></tr>`;
        return;
    }

    // 將 tr html 字串加入 table 內
    course_tbody.innerHTML += make_tr_html_by_code_list(code_list);

    // 使用委派方式來統一處理 checkbox 事件
    course_tbody.querySelectorAll("input[type='checkbox']").forEach((checkbox, index) => {
        checkbox.addEventListener("change", function () {
            COURSE.checkbox_change(code_list[index]);
            generate_selected_course_table();
        });
    });
}

// 副程式: 產生 tr 的 HTML 字串
/**
 * @param {list} code_list - 課程代碼列表
 * @returns {string} - tr 的 HTML 字串
 */
function make_tr_html_by_code_list(code_list) {
    const codes_dict = COURSE.codes_dict;
    let htmlString = "";

    for (const code of code_list) {
        const code_dict = codes_dict[code];
        let checked = COURSE.is_code_selected(code) ? "checked" : "";
        let color = ""; // 未設定，根據衝堂結果不同
        const time_string = code_dict["time_string"].replace(/\|/g, "|<br/>");
        let type_color = (code_dict["type"] == "必修")? "type_red" : "type_green";

        // 使用模板字面值來生成 HTML 字串
        htmlString += `
        <tr ${color} id='${code}_tr'>
            <td class='status'><input type='checkbox' ${checked}></td>
            <td class='code'><a href='https://selquery.ttu.edu.tw/Main/syllabusview.php?SbjNo=${code}' target='_blank' title='詳細資訊'>${code}</a></td>
            <td class='name'><a href='https://selquery.ttu.edu.tw/Main/SbjDetail.php?SbjNo=${code}' target='_blank' title='詳細資訊'>${code_dict["name"]}</a></td>
            <td class='teacher'>${code_dict["teacher"]}</td>
            <td class='type ${type_color}'>${code_dict["type"]}</td>
            <td class='credit'>${code_dict["credit"]}</td>
            <td class='hour'>${code_dict["hour"]}</td>
            <td class='time_string'>${time_string}</td>
            <td class='c_type_str'>${code_dict["c_type_str"]}</td>
            <td class='note'>${code_dict["note"]}</td>
        </tr>`;
    }

    return htmlString;
}

function open_schedule() {
    let tableHTML = document.querySelector('#schedule-view table').innerHTML;
    localStorage.setItem('tableHTML', tableHTML);
    console.log(tableHTML);
}

// 複製課程代碼
function copy_code() {
    let checked_data = COURSE.get_checked_data();
    let text = "";

    for (let data of checked_data) {
        text += data.code + "\n";
    }

    // 取得要複製的文字
    const textarea = document.getElementById('codes');
    textarea.value = text;

    // 選中 textarea 中的文字
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);

    // 執行複製動作
    document.execCommand('copy'); // 宣告在這裡標示為已淘汰。

    // 提示使用者已複製文字
    alert('已複製文字到剪貼板');

}

// ==== 導入json button ====
// 讀取json檔案
function file_input_process(event) {
    console.log("file_input_process()");
    // 獲取事件目標（input file 元素）的第一個選定文件
    var file = event.target.files[0];
    // 創建一個 FileReader 物件來讀取文件內容
    var reader = new FileReader();

    // 當 FileReader 完成讀取時觸發的事件處理程序
    reader.onload = function (event) {
        // 獲取文件內容
        var fileContent = event.target.result;

        let class_list_copy = [...COURSE.class_list];
        // 將文件內容解析為 JSON 格式
        COURSE.concat_data(JSON.parse(fileContent));


        // 將class_list中的資料繪製到頁面
        for (let class_s of COURSE.class_list) {
            if (!class_list_copy.includes(class_s)) {
                new_class_page(class_s);
            }
        }

    };

    // 將文件內容讀取為文本
    reader.readAsText(file);
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
    const code_list = COURSE.code_list_selected;
    for (const code of code_list) {
        for (const time of COURSE.codes_dict[code]["time"]) {
            let htmlString = `<div class='${code}'><a href='https://selquery.ttu.edu.tw/Main/SbjDetail.php?SbjNo=${code}' target='_blank' title='詳細資訊'>${code}</a><br><p>${COURSE.codes_dict[code]["name"]}</p></div>`;

            document.getElementById(time).innerHTML += htmlString;
        }
    }
});

document.getElementById('close-schedule').addEventListener('click', function () {
    document.getElementById('schedule-view').style.display = 'none';
});

// ====== Main ======

async function main() {
    COURSE.init(await read_code_json()); // 初始讀取 code.json
    generate_depatment_option();

}

main();