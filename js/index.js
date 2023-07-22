//課表衝突紀錄設定 // 初始化
const schedule = new Map();

// 科目id //給兩部分使用
// 1. 左半部分當作每格座標 2. 右半部分當tr座標
let courseID = 0;

// 資料: 為了導出導入與刪除
let allCourse = new Map();

//當新增課程時主介面動作
window.addEventListener('message', function (event) {
    if (event.data != undefined) {
        let course = event.data;

        //處理左半表格
        let deleteID = [];
        for (const id of course.insertP) {
            if (schedule.has(id)) schedule.set(id, schedule.get(id) + 1)
            else schedule.set(id, 1);

            //改變表格內容
            let word = this.document.getElementById(id);
            if (schedule.get(id) > 1) {
                word.innerHTML += "<br>"
                word.style.backgroundColor = "red";
            }

            let buttonID = id + "." + courseID;
            deleteID.push(buttonID);
            courseID += 1;

            word.innerHTML += "<button id='" + buttonID + "'>" + event.data.courseName + "</button>";
        }
        
        course.deleteP = deleteID;
        allCourse.set((courseID).toString(), course);
        //處理右半的表格
        console.log("data exist");
        printCourseTable(course);
    }
    else console.log("data not exist");
});

//插入課程的視窗
function insertCourse() {
    let menu = window.open("html/window.html", "setting", "width=800,height=600");
}

//輸出課程加選 //右半部表格
function printCourseTable(course) {
    if (course == undefined) {
        console.log("printCourseTable course undefined 未定義");
    } else {
        console.log("printCourseTable 導入成功");
        let rtableContainer = document.getElementById('rtableContainer');

        // 創建表頭 tr, td
        let tr = document.createElement('tr');
        let td1 = document.createElement('td');
        let td2 = document.createElement('td');
        let td3 = document.createElement('td');
        let td4 = document.createElement('td');
        let btn = document.createElement("button");

        td1.textContent = course.courseName;
        td2.textContent = course.teacher;
        td3.textContent = course.credit;
        btn.textContent = "刪除";

        td4.appendChild(btn);
        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        tr.appendChild(td4);
        rtableContainer.appendChild(tr);
        tr.setAttribute('id', courseID);
        courseID += 1;

        btn.addEventListener("click", function(){
            let id = tr.getAttribute('id')
            deleteCourse(id);
        });
    }
}

//刪除課程按鈕
function deleteCourse(remCourseID){
    let container = document.getElementById("rtableContainer");
    let rem = document.getElementById(remCourseID);

    if(container && rem) container.removeChild(rem);
    else console.log("獲取ID失敗")

    let course = allCourse.get(remCourseID);
    if(course){
        for(const id of course.deleteP){
            let tmp = id.split('.');
            container = document.getElementById(tmp[0]);
            rem = document.getElementById(id);
            container.removeChild(rem);
        }
    }else console.log("左半表格位置獲取失敗")
    
    allCourse.delete(remCourseID);
    schedule.set(remCourseID, schedule.get(remCourseID)-1);
}