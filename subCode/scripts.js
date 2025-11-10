function colorForEmotion(text) {
    if (!text) { return '#eeeeeeff'; }//초기 오브 색
    const tNorm = normalizeText(text);
    const tokens = tNorm.split(/\s+/).filter(Boolean);

    let best = { color: null, score: -1 };
    for (const group of emotionColorMap) {
        for (const keyRaw of group.keys) {
            const key = normalizeText(keyRaw);
            // 정확/부분 포함시 가산점
            let score = 0;
            if (tNorm.includes(key)) {
                score = 1.0;
            } else {
                let localBest = 0;
                for (const tok of tokens) {
                    if (aliasMatch(tok, keyRaw)) { localBest = 1; break; }
                    localBest = Math.max(localBest, jaroWinkler(tok, key));
                }
                score = localBest;
            }
            if (score > best.score) best = { color: group.color, score };
        }
    }

    // 임계값 이상이면 해당 컬러, 아니면 텍스트 기반 HSL
    // 만약 매핑에도 없고, 유사도 임계값도 넘기지 못하는 입력값이라면 → 문자열 해시 기반 HSL로 폴백
    return best.score >= 0.82 ? best.color : colorFromString(text);
}