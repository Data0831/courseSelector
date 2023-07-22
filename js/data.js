let scRow = 9, scCol = 7;

// 課程紀錄的class定義
class Course {//insertP: 一個儲存插入ID位置的陣列
    constructor(courseName, teacher, credit, insertP = undefined, deleteP = undefined) {
        this.teacher = teacher;
        this.credit = credit;
        this.courseName = courseName;
        this.insertP = insertP;
        this.deleteP = deleteP;
    }
}
