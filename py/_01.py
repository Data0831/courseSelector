import requests
import json
import time

"""
2024/07/30
獲取所有系別代碼與對應的名字如 UB2B 事業經營學系二年級B班

產生 sel.json

獲取 selDp: 所有系所代碼
獲取 selCl: 所有班級代碼
"""



# selDp: 系所
def get_sel(url, sel_name, key_list, dict):
    """
        Args:
            url: 網址
            sel_name: select 元素中的 name
            key_list: 鍵值列表
            dict: 裝載資料的字典
    """
    # url = "https://selquery.ttu.edu.tw/Main/ListClass.php"
    web = requests.get(url)
    web.encoding = "utf-8"
    response = web.text

    # start = response.find(f'name="SelDp"')
    start = response.find(f'name="{sel_name}"')
    end = response[start:].find('</select>') + start

    while True:
        i = response[start:end].find("value=") + 7 + start
        j = response[i:end].find('"') + i
        if i == -1 or i >= j: # 沒有找到
            break
        
        key = response[i:j]

        i = response[j:end].find(">") + 1 + j
        j = response[i:end].find("<") + i
        
        # course_json["selDp"][key] = {"name":response[i:j], "selCl":{}}
        dict[key] = {"name":response[i:j], key_list:{}}

        for _key in key_list:
            dict[key][_key] = {}

        start = j

def get_selDp_selCl():
    url1 = "https://selquery.ttu.edu.tw/Main/ListClass.php"
    get_sel(url1, "SelDp", ["selCl"], course_json["selDp"])

    for key in course_json["selDp"].keys():
        url2 = url1 + key
        get_sel(url2, "SelCl", ["code_list"], course_json["selDp"][key]["selCl"])
        
def get_teacher():
    url1 = "https://selquery.ttu.edu.tw/Main/ListTeacher.php"
    get_sel(url1, "idk", ["idk"], course_json["teacher"])

    for key in course_json["teacher"].keys():
        url2 = url1 + key
        get_sel(url2, "idk", ["code_list"], course_json["teacher"][key]["idk"])
        
# get class data'

# 資料
course_json = {"selDp":{},"teacher":{}}
get_selDp_selCl()

json_string = json.dumps(course_json, ensure_ascii=False)
with open("sel.json", "w", encoding="utf-8") as f:
    f.write(json_string)
# print(course_json)