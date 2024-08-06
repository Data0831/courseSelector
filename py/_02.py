import requests
import json
from tool import *

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


# 全校各班課程
def get_class_course():
    BASE_URL = "https://selquery.ttu.edu.tw/Main/ListClass.php?"
    Dp_list = datas["selDp"].keys()
    # Dp_list = ["04"]

    for Dp in Dp_list:
        print(red(datas["selDp"][Dp]["name"]))

        # datas["selDp"][Dp]["selCl"].keys() ["UB2B", "UB3B"]
        for cl in datas["selDp"][Dp]["selCl"].keys():
            url = BASE_URL + "SelDp=" + Dp + "&SelCl=" + cl
            get_page_of_course(url, cl, None, datas["selDp"][Dp]["selCl"], is_class=True, is_name_exist=True)

# 全校教師課程
def get_teacher_course():
    BASE_URL = "https://selquery.ttu.edu.tw/Main/ListTeacher.php"
    Dp_list = datas["selDp"].keys()
    # Dp_list = ["04"]

    for Dp in Dp_list:
        print(red(datas["selDp"][Dp]["name"]))

        # datas["selDp"][Dp]["selCl"].keys() ["UB2B", "UB3B"]
        for cl in datas["selDp"][Dp]["selCl"].keys():
            url = BASE_URL + "SelDp=" + Dp + "&SelCl=" + cl
            get_page_of_course(url, cl, None, datas["selDp"][Dp]["selCl"], is_class=True, is_name_exist=True)


# 副程式，獲取指定頁資料
def get_page_of_course(url, key, name, dict, is_class=False, is_name_exist=False):
    """
    Args:
        url (str): 頁面網址
        key (str): key 如 共同科目為 "ugrr", 班級 "ub3b"
        name (str): 資料的中文名稱，不存在則為 None
        dict (dict): 裝載資料的字典
        is_class (bool): 是否為班級，有可能為通識或共同課程，這種情況非class
        is_name_exist (bool): name 是否已存在
    """

    web = requests.get(url)
    web.encoding = "utf-8"
    response = web.text

    if not is_name_exist:
        dict[key] = {
            "name": name,
            "code_list": [],
        }
    else:
        dict[key]["code_list"] = []

    # 從 response 中取得資料
    get_data_from_response(key, is_class, response, url, dict[key]["code_list"])


# 副程式
def get_data_from_response(key, is_class, response, url, class_code_list):
    """
    Args:
        key (str): 班級名稱, 如 "UB2B"，不一定為班級名稱，如通識 ugrr
        is_class (bool): 是否為班級，有可能為通識或共同課程，這種情況非class
        response (str): 資料，html string
        url (str): 網址
        class_code_list (list): 裝載班級代碼的列表
    """

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

        class_code_list.append(code)

        if code not in datas["codes_dict"]:  # 如果 code不存在 在資料中
            datas["codes_dict"][code] = {}
            if is_class:
                datas["codes_dict"][code]["class"] = [key]
            else:
                datas["codes_dict"][code]["class"] = ["無指定"]
        else:  # 已經存過這個code的資料,只是班級不同,所以後續可以跳過
            if is_class:
                datas["codes_dict"][code]["class"].append(key)
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
            datas["codes_dict"][code]["pratice"] = True
        else:
            idx = tmp_idx
            datas["codes_dict"][code]["pratice"] = False

        datas["codes_dict"][code]["hour"] = response[idx]  # hour 單個字元

        # 時間字串
        tmp_idx = response[idx:].find("星期")
        tmp_idx += idx if tmp_idx != -1 else 0
        idx = response[idx:].find("</DIV>") + idx

        # 無上課時間地點
        if tmp_idx >= idx or tmp_idx == -1:
            datas["codes_dict"][code]["time_string"] = "無"
            datas["codes_dict"][code]["time"] = []

        else:  # 有上課時間地點
            time_string = response[tmp_idx:idx].replace("<br>", " | ")
            datas["codes_dict"][code]["time_string"] = time_string

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
            datas["codes_dict"][code]["time"] = time

        # 課名
        idx, datas["codes_dict"][code]["name"] = string_find(
            response[idx:end], 'target="_BLANK")>', " ", idx
        )

        # 教師
        idx, datas["codes_dict"][code]["teacher"] = string_find(
            response[idx:end], 'center">', "<", idx
        )

        if datas["codes_dict"][code]["teacher"] == "":
            datas["codes_dict"][code]["teacher"] == "未排教師"

        # 必選修
        idx = response[idx:end].find("修") + idx + 1
        datas["codes_dict"][code]["type"] = response[idx - 2 : idx]

        # credit
        idx, datas["codes_dict"][code]["credit"] = string_find(
            response[idx:end], 'center">', "<", idx
        )

        # course type str 學程類型
        idx = response[idx:end].find("</font>") + idx
        idx, datas["codes_dict"][code]["c_type_str"] = string_find(
            response[idx:end], "<font color=black>", "<", idx
        )

        # note 附註
        idx, note = string_find(response[idx:end], "<td>", " ", idx)
        if note == "&nbsp;":
            datas["codes_dict"][code]["note"] = ""
        else:
            idx, datas["codes_dict"][code]["note"] = string_find(
                response[idx:end], 'color="Red">', "<", idx
            )

        # 移動至 /tr 結尾
        idx = response[idx:end].find("</tr>") + idx + 4


""" ################ EXECUTION ################ """

# 初始化
datas = None

with open("./py/sel.json", "r", encoding="utf-8") as json_file:
    datas = json.load(json_file)

# 賦值
datas["codes_dict"] = {}


get_class_course()  # 全校各班課程

# # 共同科目
# print(red("ugrr"))
# url = "https://selquery.ttu.edu.tw/Main/ListUGRR.php"
# get_page_of_course(url, "ugrr", "共同科目", datas)

# # 通識課程
# print(red("general"))
# url = "https://selquery.ttu.edu.tw/Main/ListGeneral.php"
# get_page_of_course(url, "general", "通識課程", datas)

# # 英語授課課程
# print(red("eng"))
# url = "https://selquery.ttu.edu.tw/Main/ListEngSel.php"
# get_page_of_course(url, "eng", "英語授課課程", datas)

json_string = json.dumps(datas, ensure_ascii=False)
with open("course1.json", "w", encoding="utf-8") as json_file:
    json_file.write(json_string)

# 寫入了兩部分的資料
"""
{
    "selDp": {
    }

    "codes_dict": {
    }
}
"""
