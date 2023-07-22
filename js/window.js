// 課表紀錄陣列 紀錄使用者的選擇，用來改變顏色
const choiceMap = new Map();

// 選擇課程
function choice(data) {
    //前面資料位置，後面顏色變化
    if(choiceMap.has(data)) choiceMap.set(data, !choiceMap.get(data));
    else choiceMap.set(data, true);
    
    // 選擇動畫與紀錄
    var button = document.getElementById(data);
    if (choiceMap.get(data) == true) {
        button.style.backgroundColor = "dodgerblue";
        button.addEventListener("mouseover", function () {
            button.style.backgroundColor = "blue";
        });
        button.addEventListener("mouseout", function () {
            button.style.backgroundColor = "dodgerblue";
        });
        button.innerHTML = "Y";
        button.style.fontSize = "8px";
    } else {
        button.style.backgroundColor = "#f2f2f2"
        button.addEventListener("mouseover", function () {
            button.style.backgroundColor = "#b8b8b8";
        });
        button.addEventListener("mouseout", function () {
            button.style.backgroundColor = "#f2f2f2";
        });
        button.innerHTML = "";
    }
}

//新增使用者的選擇
function addCourse() {
    //對choiceMap做處理取key座標
    let insertP = [];
    let i = 0;
    for (const key of choiceMap.keys()) {
        const str = key.replace(/\s/g, "-");
        insertP.push(str);// 只需將字串改變，之後根據字串找對應id對應位置
    }

    let courseName = document.getElementById("courseName");
    let teacher = document.getElementById("teacher");
    let credit = document.getElementById("credit");
    let newCourse = new Course(courseName.value, teacher.value, credit.value, insertP);

    window.opener.postMessage(newCourse, "*");
    window.close();
} 