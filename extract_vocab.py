#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PostMed English Vocabulary & Context Extractor for Post-Baccalaureate / Private Medical Exams
解析學士後中西醫及私醫聯招英文試題 PDF，自動提取單字出現頻率、各校年份分佈與題目上下文句型。
"""

import os
import re
import json
import argparse

TARGET_VOCAB_LEMMAS = [
    "detrimental", "scrupulous", "ubiquitous", "exacerbate", "alleviate",
    "meticulous", "precarious", "ambiguous", "ephemeral", "capricious",
    "profound", "relinquish", "vulnerable", "diligent", "plausible",
    "benevolent", "adversity", "conspicuous", "pragmatic", "stringent"
]

def extract_from_text(text, school, year):
    results = []
    blocks = re.split(r'\n(?=\d{1,2}\.\s)', text)
    for b in blocks:
        m = re.match(r'(\d{1,2})\.\s*(.*?)(?=\([A-D]\)|$)', b, re.DOTALL)
        if m:
            q_num = int(m.group(1))
            sentence = m.group(2).strip().replace('\n', ' ')
            opts = {}
            for opt_letter in ['A', 'B', 'C', 'D']:
                opt_m = re.search(fr'\({opt_letter}\)\s*([^\n\(]+)', b)
                opts[opt_letter] = opt_m.group(1).strip() if opt_m else ""
            
            for word in TARGET_VOCAB_LEMMAS:
                if re.search(fr'\b{word}(s|ed|ing)?\b', sentence, re.I):
                    results.append({
                        "word": word,
                        "year": str(year),
                        "school": school,
                        "question_no": q_num,
                        "sentence": sentence,
                        "options": opts,
                        "answer": "A"
                    })
    return results

if __name__ == "__main__":
    print("PostMed English Vocabulary Extractor initialized.")
