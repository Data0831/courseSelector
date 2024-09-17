import requests
import json
from tool import *

"""
2024/08/06 綜合
"""


""" ################ SETTING ################ """

_USE_SELECT_JSON = True

""" ################ DATAS ################ """

KEYWORDS = {
    "第一節": "1-",
    "第二節": "2-",
    "第三節": "3-",
    "第四節": "4-",
    "中\u3000午": "5-",
    "第五節": "6-",
    "第六節": "7-",
    "第七節": "8-",
    "第八節": "9-",
    "傍\u3000晚": "10-",
    "第九節": "11-",
    "第10節": "12-",
    "第11節": "13-",
    "第12節": "14-",
    "第13節": "15-",
    "星期一": "1",
    "星期二": "2",
    "星期三": "3",
    "星期四": "4",
    "星期五": "5",
    "星期六": "6",
    "星期天": "7",
}

""" ################ FUNCTION ################ """


# 檔案 資料儲存
def save_select_json(course_json):
    json_string = json.dumps(course_json, ensure_ascii=False)
    with open("select.json", "w", encoding="utf-8") as json_file:
        json_file.write(json_string)


def save_course_json(course_json):
    json_string = json.dumps(course_json, ensure_ascii=False)
    with open("course.json", "w", encoding="utf-8") as json_file:
        json_file.write(json_string)


# 檔案 資料加載
def load_select_json():
    try:
        with open("select.json", "r", encoding="utf-8") as json_file:
            return json.load(json_file)
    except Exception as e:
        print(red("檔案 select.json 不存在"))
        print(e)
        exit(1)


# 副程式
def string_find(string, beg_str, end_str, idx):
    """
    尋找子字串的起始和結束位置，並回傳位置與內容
    註: 有處理當找不到字串， raise Exception

    Args:
        string (str): 要搜尋的字串(文章)
        beg_str (str): 前方標記
        end_str (str): 後方標記
        idx (int): 起始位置的基準位置

    Returns:
        tuple: 包含子字串結束位置與內容的 tuple

    Raises:
        Exception: 找不到子字串的起始或結束位置
    """

    #  可能發生在班級課程為空這種情況
    if idx < 0:
        raise Exception("到達文章結束位置")

    # 尋找起始位置
    i = string.find(beg_str) + len(beg_str)
    # 從起始位置開始尋找結束位置
    j = string[i:].find(end_str) + i

    # 確認位置是否正確
    if i == -1 + len(beg_str) or j == -1 + i:
        raise Exception("到達文章結束位置")
    # 回傳結束位置與內容
    return j + idx, string[i:j]


# is
def is_code_dict_contains(code):
    if code in course_json["code_dict"]:
        return True
    return False


# getter


# 副程式 從網頁的 Select 元素中取得資 value 與 name
def get_select_value_name(url, select_name):
    """
    Args:
        url: 網址
        select_name: select 元素中的 name， 如 "SelDp" 用來查詢

    Return:
        DICT: 裝載資料的字典 {"UI2B":"資訊工程學系二年B班" ...}
    """
    
    DICT = {}

    web = requests.get(url)
    web.encoding = "utf-8"
    response = web.text

    # 起始座標, 結束座標
    beg = response.find(f'name="{select_name}"')  # (f'name="SelDp"')
    end = response[beg:].find("</select>") + beg

    while beg > 0 and beg < end:
        i = response[beg:end].find("value=") + 7 + beg
        j = response[i:end].find('"') + i

        # 當迴圈來到最後，已經沒有 option 的 " 引號了
        # 所以 j 一定會比 i 小 1
        if i >= j:  # 沒有找到，或是找到底了
            break

        value = response[i:j]

        i = response[j:end].find(">") + 1 + j
        j = response[i:end].find("<") + i

        name = response[i:j]

        DICT[value] = name
        beg = j

    return DICT


# 獲取系所班級的 name 與 value
def get_department_class_teacher_select():
    SELECT_NAME_1 = "SelDp"
    SELECT_NAME_2 = "SelCl"
    SELECT_NAME_3 = "SelTh"

    URL1 = "https://selquery.ttu.edu.tw/Main/ListClass.php"
    URL2 = "https://selquery.ttu.edu.tw/Main/ListTeacher.php"

    department_dict = get_select_value_name(URL2, SELECT_NAME_1)

    counter = 0

    for department_key, department_value in department_dict.items():
        is_department_with_class = department_key[0].isalpha()
        
        if is_department_with_class:
            course_json["department"][department_key] = {
                "name": department_value,
                "class": {},
                "teacher": {},
            }
        else:
            course_json["department"][department_key] = {
                "name": department_value,
                "teacher": {},
            }

        if is_department_with_class:
            class_dict = get_select_value_name(
                f"{URL1}?SelDp={department_key}", SELECT_NAME_2
            )

            for class_key, class_value in class_dict.items():
                course_json["department"][department_key]["class"][class_key] = {
                    "name": class_value,
                    "code_list": [],
                }
            counter += 1

        teacher_dict = get_select_value_name(
            f"{URL2}?SelDp={department_key}", SELECT_NAME_3
        )

        for teacher_key, teacher_value in teacher_dict.items():
            teacher_value = teacher_value.replace("&nbsp;", "")
            course_json["department"][department_key]["teacher"][teacher_key] = {
                "name": teacher_value,
                "code_list": [],
            }


# 全校各班課程
def get_class_teacher_course():
    CLASS_URL = "https://selquery.ttu.edu.tw/Main/ListClass.php?"
    TEACHER_URL = "https://selquery.ttu.edu.tw/Main/ListTeacher.php?"

    department_list = course_json["department"].keys()
    # department_list = ["04"]

    for dp in department_list:
        print(red(course_json["department"][dp]["name"]))

        class_list = course_json["department"][dp]["class"].keys()

        for cl in class_list:
            url = CLASS_URL + "SelDp=" + dp + "&SelCl=" + cl

            code_dict, code_list = get_code_dict_list_from_page(url, cl, True)

            course_json["code_dict"].update(code_dict)
            course_json["department"][dp]["class"][cl]["code_list"] = code_list

        teacher_list = course_json["department"][dp]["teacher"].keys()
        # teacher_list = ["04B14"]

        for ta in teacher_list:
            url = TEACHER_URL + "SelDp=" + dp + "&SelTh=" + ta
            code_dict, code_list = get_code_dict_list_from_page(
                url, course_json["department"][dp]["teacher"][ta]["name"], False
            )

            course_json["code_dict"].update(code_dict)
            course_json["department"][dp]["teacher"][ta]["code_list"] = code_list


# 共同科目 通識 英文
def get_other_course():
    # 共同科目
    print(red("ugrr"))
    url = "https://selquery.ttu.edu.tw/Main/ListUGRR.php"
    code_dict, code_list = get_code_dict_list_from_page(url, "ugrr", False)
    course_json["code_dict"].update(code_dict)
    course_json["other"]["ugrr"]["code_list"] = code_list

    # 通識課程
    print(red("general"))
    url = "https://selquery.ttu.edu.tw/Main/ListGeneral.php"
    code_dict, code_list = get_code_dict_list_from_page(url, "general", False)
    course_json["code_dict"].update(code_dict)
    course_json["other"]["general"]["code_list"] = code_list

    # 英語授課課程
    print(red("eng"))
    url = "https://selquery.ttu.edu.tw/Main/ListEngSel.php"
    code_dict, code_list = get_code_dict_list_from_page(url, "eng", False)
    course_json["code_dict"].update(code_dict)
    course_json["other"]["eng"]["code_list"] = code_list


# 副程式，獲取指定頁資料
def get_code_dict_list_from_page(url, key, is_class):
    """
    Args:
        url (str): 網址 提醒錯誤在哪邊發生
        key (str): 班級名稱, 如 "UB2B"，不一定為班級名稱，如通識 ugrr
        is_class (bool): 是否為班級，有可能為通識或共同課程，這種情況非class

    Returns:
        code_dict: 課程代碼詳細資訊
        code_list: 課程代碼列表
    """

    web = requests.get(url)
    web.encoding = "utf-8"
    response = web.text

    code_list = []
    code_dict = {}

    # 找到第一個課程的開始位置
    idx = response.find('class="cistab"')

    # 確定不要出現班級課程是空的情況
    if idx != -1:
        idx = response[idx:].find("</tr>") + idx
        end = response[idx:].find("</table>") + idx

    # 這個迴圈用來找到每個班級的所有課程，從第一個課程開始尋找到最後一個課程。
    while True:
        # 課程代碼 班級
        try:
            if idx < 0 or idx >= end:
                raise Exception("到達文章結束位置")

            idx, code = string_find(response[idx:end], "id='", "'", idx)

        except Exception as e:
            # 表示已經讀取目前頁面的所有課程
            # 或是班級課程為空的情況

            print(key, "finished")
            break

        code_list.append(code)

        if not is_code_dict_contains(code):  # 如果 code不存在 在資料中
            code_dict[code] = {}
            if is_class:
                code_dict[code]["class"] = [key]
            else:
                code_dict[code]["class"] = ["無指定"]
        else:  # 已經存過這個code的資料,只是班級不同,所以後續可以跳過
            if is_class:
                # code_dict[code]["class"].append(key)
                # 這一行比較特殊，因為迴圈每次跑都會有所以乾脆獨立出
                course_json["code_dict"][code]["class"].append(key)
            continue

        # 授課時數
        div_end_idx = response[idx:].find("</DIV>") + idx
        tmp_idx = response[idx:].find("授課時數:</FONT>")
        # 要確認 tmp_idx 不是 -1 的情況
        tmp_idx += (idx + 13) if tmp_idx != -1 else 0

        # 找不到授課時數，可能為實習
        if tmp_idx >= div_end_idx or tmp_idx == -1:
            idx = response[idx:].find("實習時數:</FONT>") + idx + 13

            if idx >= div_end_idx or idx == -1:
                print("找不到授課時數，找不到實習時數")

            # 是否為實習
            code_dict[code]["pratice"] = True
        else:
            idx = tmp_idx
            code_dict[code]["pratice"] = False

        code_dict[code]["hour"] = response[idx]  # hour 單個字元

        # 時間字串
        tmp_idx = response[idx:].find("星期")
        tmp_idx += idx if tmp_idx != -1 else 0
        idx = response[idx:].find("</DIV>") + idx

        # 無上課時間地點
        if tmp_idx >= idx or tmp_idx == -1:
            code_dict[code]["time_string"] = "無"
            code_dict[code]["time"] = []

        else:  # 有上課時間地點
            time_string = response[tmp_idx:idx].replace("<br>", " | ")
            code_dict[code]["time_string"] = time_string

            # 時間
            time = []
            time_string = time_string.split(" | ")

            for string in time_string:
                if string == "":
                    continue

                tmp_idx = string.find("-")  # 第10節 第一節 長度不同
                try:
                    t_str = KEYWORDS[string[4:tmp_idx]] + KEYWORDS[string[0:3]]
                except Exception as e:
                    print(f"error in time string, get_class_course")
                    print(f"exception: {code}")
                    print("link:" + url)
                    print(f"tmp_idx:{tmp_idx} idx:{idx}")
                    print(time_string)
                    print(e)
                    exit(1)

                time.append(t_str)
            code_dict[code]["time"] = time

        # 課名
        idx, code_dict[code]["name"] = string_find(
            response[idx:end], 'target="_BLANK")>', " ", idx
        )

        # 教師
        idx, code_dict[code]["teacher"] = string_find(
            response[idx:end], 'center">', "<", idx
        )

        if code_dict[code]["teacher"] == "":
            code_dict[code]["teacher"] == "未排教師"

        # 必選修
        idx = response[idx:end].find("修") + idx + 1
        code_dict[code]["selection"] = response[idx - 2 : idx]

        # credit
        idx, code_dict[code]["credit"] = string_find(
            response[idx:end], 'center">', "<", idx
        )

        # course type str 學程類型
        idx = response[idx:end].find("</font>") + idx
        idx, code_dict[code]["c_type_str"] = string_find(
            response[idx:end], "<font color=black>", "<", idx
        )

        # note 附註
        idx, note = string_find(response[idx:end], "<td>", " ", idx)
        if note == "&nbsp;":
            code_dict[code]["note"] = ""
        else:
            idx, code_dict[code]["note"] = string_find(
                response[idx:end], 'color="Red">', "<", idx
            )

        # 移動至 /tr 結尾
        idx = response[idx:end].find("</tr>") + idx + 4

    return code_dict, code_list


""" ################ EXECUTION ################ """
# 初始化
course_json = {
    "department": {},
    "other": {
        "ugrr": {"name": "共同科目", "code_list": []},
        "general": {"name": "通識", "code_list": []},
        "eng": {"name": "英語授課課程", "code_list": []},
    },
    "code_dict": {},
}

# 獲取前置資料
if not _USE_SELECT_JSON:
    course_json = load_select_json()

else:
    print(red("Select.json"))
    get_department_class_teacher_select()
    save_select_json(course_json)

get_class_teacher_course()  # 全校各班課程 + 各教師課程
get_other_course()  # 共同科目、通識、英語授課


# 最後的部分
save_course_json(course_json)
