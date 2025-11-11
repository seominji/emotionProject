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


function renderOrbsFromText(text) {
	//새로운 생성될 원의 개수
    const COUNT = 18;

    // 새 레이어(처음엔 투명)
    const layerEl = document.createElement('div');
    layerEl.className = 'layer';
    layerEl.style.opacity = '0';
    const layerStops = [];

    const tokens = tokenizeEmotions(text);
    if (tokens.length === 0) {
        // 토큰이 없고, 매핑/유사도도 실패라면 DB에 기록
        if (isFallbackEmotion(text)) {
            sendUnknownEmotion(text, []);
        }
        const baseColor = colorForEmotion(text);
        console.warn('최초 오브 리턴 컬러: ', baseColor);
        for (let i = 0; i < COUNT; i++) {
			const { el, stop } = createOrb(i, baseColor);
            layerStops.push(stop);
            layerEl.appendChild(el);
        }
    } 
    //단일 토큰만 데모.
    else {
        // 각 토큰별 색 계산 후 개수 배분
        /*
        const colors = tokens.map(t => colorForEmotion(t));
        const per = Math.floor(COUNT / colors.length);
        const remainder = COUNT - per * colors.length;

        // 실패(폴백) 토큰 수집
        const failed = tokens.filter(t => isFallbackEmotion(t));
        if (failed.length > 0) {
            sendUnknownEmotion(text, failed);
        }

        const assignment = [];
        // 균등 분배
        colors.forEach((c) => {
            for (let i = 0; i < per; i++) assignment.push(c);
        });
        // 나머지는 첫 번째 감정 색으로 모두 배정
        for (let i = 0; i < remainder; i++) assignment.push(colors[0]);
        */

        
        shuffleInPlace(assignment);
        for (let i = 0; i < assignment.length; i++) {
            const { el, stop } = createOrb(i, assignment[i]);
            layerStops.push(stop);
            layerEl.appendChild(el);
        }
    }
}

function isFallbackEmotion(text) {
	if (!text) return false;
	const tNorm = normalizeText(text);
	const tokens = tNorm.split(/\s+/).filter(Boolean);
	let best = -1;
	for (const group of emotionColorMap) {
		for (const keyRaw of group.keys) {
			const key = normalizeText(keyRaw);
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
			if (score > best) best = score;
		}
	}
	return best < 0.82;
}