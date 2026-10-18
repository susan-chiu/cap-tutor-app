# -*- coding: utf-8 -*-
"""
社會科段考範圍：每學期地理、歷史、公民各一個大單元，但學校每次段考都三科一起考（各考一部分課次）。
這裡依課本章節順序，把每個單元的觀念分到第一、二、三次段考（exam_part = 1、2、3）。
App 的「學期複習」會把同一次段考的地理、歷史、公民放在一起。
新增觀念時要加進來，否則 build_seed.py 會報錯。
"""

EXAM_PARTS = {
    # 七上
    "SO-7A-1": {"latitude-longitude": 1, "time-zone": 1, "landform": 2, "climate": 3},
    "SO-7A-2": {"prehistory": 1, "indigenous-peoples": 1, "dutch-spanish": 2, "zheng-regime": 2, "qing-governance": 3},
    "SO-7A-3": {"human-rights": 1, "gender-equality": 2, "family": 3, "school-autonomy": 3},
    # 七下
    "SO-7B-1": {"population": 1, "industry": 2, "region": 3},
    "SO-7B-2": {"japanese-rule": 1, "postwar-politics": 2, "postwar-economy": 3},
    "SO-7B-3": {"social-groups": 1, "culture": 2, "social-welfare": 3},
    # 八上
    "SO-8A-1": {"landform": 1, "climate": 2, "hydrology": 3, "region": 3},
    "SO-8A-2": {"early-china": 1, "qin-han": 1, "imperial-exam": 2, "trade-exchange": 2, "late-qing": 3},
    "SO-8A-3": {"democracy": 1, "constitution": 1, "five-yuan": 2, "elections": 3, "parties-groups": 3},
    # 八下
    "SO-8B-1": {"monsoon-asia": 1, "climate-type": 1, "east-asia": 1, "southeast-asia": 2, "south-asia": 2, "west-asia": 3},
    "SO-8B-2": {"late-qing": 1, "meiji": 1, "korea": 2, "republic-china": 2, "postwar-japan": 3, "chronology": 3},
    "SO-8B-3": {"legal-hierarchy": 1, "civil-law": 1, "criminal-law": 2, "juvenile-justice": 2, "administrative-law": 3},
    # 九上
    "SO-9A-1": {"europe-landform": 1, "europe-climate": 1, "mediterranean": 1, "russia": 2,
                "africa-environment": 3, "africa-development": 3},
    "SO-9A-2": {"ancient-civilization": 1, "greece-rome": 1, "renaissance-reformation": 2, "age-of-exploration": 2,
                "enlightenment-revolution": 3, "industrial-revolution": 3},
    "SO-9A-3": {"opportunity-cost": 1, "supply-demand": 1, "market-structure": 2, "money-finance": 2, "government-role": 3},
    # 九下
    "SO-9B-1": {"climate-type": 1, "americas": 1, "oceania": 2, "global-warming": 3, "food-water": 3},
    "SO-9B-2": {"world-war": 1, "cold-war": 2, "decolonization": 3},
    "SO-9B-3": {"globalization": 1, "comparative-advantage": 2, "trade-policy": 2, "international-org": 3},
}


def exam_part(unit, concept):
    """回傳 1～3；不分段考範圍的科目回傳 None。社會科單元缺對照時丟出錯誤。"""
    if unit not in EXAM_PARTS:
        return None
    parts = EXAM_PARTS[unit]
    if concept not in parts:
        raise KeyError(f"{unit} 的觀念 {concept} 沒有在 exam_parts.py 指定段考範圍")
    return parts[concept]
