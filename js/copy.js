class COURSE_MANAGER {
    constructor() {
        this.json_datas = []; // 一個list裝著許多map
        this.class_list = []; // 用來避免重複新增class
        this.class_now = ""; // 現在指向的class
        this.conflict_map = new Map(); // 用來存衝堂資料
    }

    class_list_has(class_str) {
        for (let class_s of this.class_list) {
            if (class_s === class_str) {
                return true;
            }
        }
        return false;
    }

    code_has(code_str) {
        for (let data of this.json_datas) {
            if (data.code === code_str)
                return true;
        }
        return false;
    }

    // 新增匯入的資料 json_datas 與 class list
    concat_data(json_datas) {
        if (Array.isArray(json_datas)) {
            let illegal_code = []; // 存放不合規定的資料

            for (let json_data of json_datas) {
                // 如果課號未存在則不新增
                if (this.code_has(json_data.code)) {
                    illegal_code.push(json_data.code)

                } else {
                    // 新增資料
                    this.json_datas.push(json_data);

                    // 新增班級類別到 class_list
                    for (let class_s of json_data.class_str) {
                        if (!this.class_list_has(class_s)) {
                            this.add_class_list(class_s);
                        }
                    }

                    // 統計衝堂
                    if (json_data.checkbox == true) {
                        for (let coordinate of json_data.coordinate)
                            this.conflict_map_add(coordinate);
                    }
                }
            }

            // 如果存在相同代碼，提示使用者新增的課程失敗
            if (illegal_code.length > 0) {
                alerts("課號" + illegal_code + "因為重複所以新增失敗")
            }

        } else {
            console.error("Error: json_datas 並非 list.");
        }
    }

    // 新增現有class_list
    add_class_list(class_str) {
        this.class_list.push(class_str);
    }

    //設定class_now
    set_class_now(class_str) {
        this.class_now = class_str;
    }

    // 獲取class_now
    get_class_now() {
        return this.class_now;
    }

    // class 指向存在
    class_now_exists() {
        if (this.class_now.length > 0) {
            return true;
        } else return false;
    }

    // 獲取所有被勾選的資料
    get_checked_data() {
        let checked_json_datas = [];
        for (let json_data of this.json_datas) {
            if (json_data.checkbox == true) {
                checked_json_datas.push(json_data);
            }
        }
        return checked_json_datas;
    }

    // 對 map做增減的 簡化
    conflict_map_add(coordinate) {
        if (this.conflict_map.has(coordinate)) {
            this.conflict_map.set(coordinate, this.conflict_map.get(coordinate) + 1);
        } else {
            this.conflict_map.set(coordinate, 1);
        }
    }

    conflict_map_sub(coordinate) {
        this.conflict_map.set(coordinate, this.conflict_map.get(coordinate) - 1);
    }

    // 改變狀態、衝堂表
    checkbox_change(code) {
        for (let json_data of this.json_datas) {
            if (json_data.code === code) {
                json_data.checkbox = !json_data.checkbox;

                // 如果勾選擇添加
                if (json_data.checkbox == true) {
                    for (let coordinate of json_data.coordinate) {
                        this.conflict_map_add(coordinate);
                    }
                }
                // 反之則減少
                else {
                    for (let coordinate of json_data.coordinate) {
                        this.conflict_map_sub(coordinate);
                    }
                }
                break;
            }
        }
    }

    // 衝堂確認
    is_conflict(coordinate) {
        if (this.conflict_map.has(coordinate) && this.conflict_map.get(coordinate) > 1)
            return true;
        else return false;
    }
}

function draw_list_by_class_type(class_str = COURSE.class_now, json_datas = COURSE.json_datas) {
    // 選擇這個class
    COURSE.set_class_now(class_str);

    // 將符合班級名的資料提取
    let course_list = [] // 提取後的資料
    for (let data of json_datas) {
        for (let class_s of data.class_str) { // (str, list of str)
            if (class_str == class_s) { // (str, str)
                course_list.push(data);
                break;
            }
        }
    }

    // 將提取後的資料寫入list
    let course_list_table = document.getElementById("courseListTable");
    let tbody = course_list_table.querySelector("tbody");
    let course_list_str = "";
    for (let course of course_list) {

        // 衝堂紅色
        let color = "";
        for (coordinate of course.coordinate) {
            if (COURSE.is_conflict(coordinate)) {
                color = "style='color: red;'";
                break;
            }
        }
        console.log("color:", COURSE.conflict_map, color);

        // 處理check_box狀態，文字轉譯
        let check_box_type_str = (course.checkbox == true) ? "checked" : "";
        course_list_str +=
            "<tr " + color + " id='" + String(course.code) + "'>"
            + "<td class='checkBox'><input type='checkbox' onchange='checkbox_change(" + "\"" + course.code + "\"" + ")' " + check_box_type_str + "></td>"
            + "<td class='code'>" + course.code + "</td>"
            + "<td class='name'>" + course.name + "</td>"
            + "<td class='hour'>" + course.hour + "</td>"
            + "<td class='credit'>" + course.credit + "</td>"
            + "<td class='teacher'>" + course.teacher + "</td>"
            + "<td class='time'>" + course.time + "</td>"
            + "<td class='place'>" + course.place + "</td>"
            + "<td class='link'>" + course.link + "</td>"
            + "<td class='note'>" + course.note + "</td>";


        //  
        // // (courseListViewButton)右表格按鈕處理 隱藏、刪除
        // + "<td><button onclick='" + "removeCourse(" + String(courseID) + ")" + "'>刪除</button>"
        // + "<hr><button id='" + CONTROL_ID_NAME + String(courseID) + "' onclick='courseCollapseControl(" + String(courseID) + ")'>隱藏</button></td>"
        // + "<td class='courseTime'>" + Time + "</td>"
        // + "</tr>"
    }
    tbody.innerHTML = course_list_str;

}