const inputEl = document.getElementById('emotion-input'); //실제 html input 태그 값
const inputWrap = document.querySelector('.input-wrap'); //input div 껍데기
const canvasEl = document.getElementById('canvas');

//inputWrap.style.display = 'block';
 //여기에 스페이스 키 다운 안내 버튼 추가
document.addEventListener('DOMContentLoaded', () => {
    // 문구 담을 div 생성
    const div = document.createElement('div');
    div.textContent = '스페이스를 눌러 진행해주세요.';

    // 멘트 스타일
    div.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        padding: 20px 40px;
        background-color: rgba(28, 30, 53, 0.75);
        color: white;
        border-radius: 12px;
        font-size: 20px;
        text-align: center;
        opacity: 0; /* 처음엔 투명 */
        transition: opacity 1.5s ease; /* 부드러운 페이드 효과 */
    `;

    // 화면에 추가
    document.body.appendChild(div);

    // 4️⃣ 페이드인 (화면에 나타남)
    setTimeout(() => {
        div.style.opacity = '1';
    }, 1000); // 살짝 지연시켜야 transition이 적용됨
    
    // 5️⃣ 스페이스 누르면 페이드아웃
    function handleKey(e) {
        if (e.code === 'Space' || e.key === ' ') {
        div.style.opacity = '0';
        document.removeEventListener('keydown', handleKey);

        // 완전히 사라진 뒤 DOM에서 제거
        setTimeout(() => {
            div.remove();
        }, 1500); // transition 시간(1.5초)과 맞춤
        }
    }

    document.addEventListener('keydown', handleKey);
});



document.addEventListener('DOMContentLoaded', function() {
    const messages = [
        "이곳은 '감정'이 머무는 세계입니다.",
        "여기 있는 부드러운 구(Orb)들은 방금 태어난 당신의 감정 오브들이에요.",
        "지금의 감정을 입력해서 어린 감정 오브들에게 색을 부여해주세요."
    ];
    
    //const messageEl = document.getElementById('intro-message');
    //const inputWrap = document.querySelector('.input-wrap');
    
    let currentIndex = 0;
    let isTransitioning = false;
    
    const messageEl = document.getElementById('intro-message');

    async function showNextMessage() {
        if (isTransitioning) return; // 연타 방지
        isTransitioning = true;

        // 첫 번째 메시지면 그냥 보여줌
        if (currentIndex === 0) {
            await new Promise(resolve => setTimeout(resolve, 1300)); //멘트나오기 전 약간의 딜레이
            messageEl.textContent = messages[currentIndex];
            messageEl.classList.add('show');
        } else if (currentIndex < messages.length) {
            // 페이드아웃
            messageEl.classList.remove('show');
            await new Promise(resolve => setTimeout(resolve, 1300)); //웰컴 메시지 fade-out 기다리는 시간

            // 다음 메시지로 교체 후 페이드인
            messageEl.textContent = messages[currentIndex];
            messageEl.classList.add('show');
        }

        currentIndex++;
        isTransitioning = false;

        // 모든 메시지를 다 본 경우 → 입력창 표시
        if (currentIndex > messages.length) {
            messageEl.classList.remove('show');
            await new Promise(resolve => setTimeout(resolve, 2000));
            messageEl.style.display = 'none';

            
            inputWrap.classList.add('show');
            inputWrap.style.display = 'block';
            
            document.removeEventListener('keydown', handleKeyPress);
        }
    }

    function handleKeyPress(e) {
        if (e.code === 'Space' || e.key === ' ') {
            showNextMessage();
        }
    }

    // 초기 설정
    if (inputWrap) {
        inputWrap.style.display = 'none';
    }
    messageEl.classList.remove('show');

    document.addEventListener('keydown', handleKeyPress);
});

let orbTimers = [];
let layers = [];

import {emotionColorMap} from './data/emotionColorMap.js';
import {stopwords} from './data/stopwords.js';
import {aliasByKey} from './data/aliasByKey.js';


function aliasMatch(token, keyRaw) {
	const key = normalizeText(keyRaw);
	const arr = aliasByKey[key] || [];
	for (const rx of arr) if (rx.test(token)) return true;
	return false;
}

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

async function sendUnknownEmotion(inputText, failedTokens) {
	try {
		const res = await fetch('http://localhost:3001/api/unknown-emotion', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ inputText, failedTokens })
		});
		if (!res.ok) {
			console.warn('unknown-emotion 저장 실패 (HTTP)', res.status);
			return;
		}
		const data = await res.json().catch(() => ({}));
		if (!data.ok) {
			console.warn('unknown-emotion 저장 실패 (응답)', data);
		}
	} catch (err) {
		console.warn('unknown-emotion 전송 에러', err);
	}
}

function normalizeText(s) {
	return String(s)
		.normalize('NFC')
		.toLowerCase()
		.replace(/\s+/g, ' ')
		.trim();
}

// Jaro-Winkler 유사도 (0~1)
function jaroWinkler(a, b) {
	if (a === b) return 1;
	const j = jaro(a, b);
	const p = 0.1; // prefix scale
	const l = commonPrefixLength(a, b, 4);
	return j + l * p * (1 - j);
}

function jaro(a, b) {
	const aLen = a.length, bLen = b.length;
	if (aLen === 0) return bLen === 0 ? 1 : 0;
	const matchDistance = Math.floor(Math.max(aLen, bLen) / 2) - 1;
	const aMatches = new Array(aLen).fill(false);
	const bMatches = new Array(bLen).fill(false);

	let matches = 0;
	for (let i = 0; i < aLen; i++) {
		const start = Math.max(0, i - matchDistance);
		const end = Math.min(i + matchDistance + 1, bLen);
		for (let j = start; j < end; j++) {
			if (bMatches[j]) continue;
			if (a[i] !== b[j]) continue;
			aMatches[i] = true;
			bMatches[j] = true;
			matches++;
			break;
		}
	}
	if (matches === 0) return 0;

	let k = 0;
	let transpositions = 0;
	for (let i = 0; i < aLen; i++) {
		if (!aMatches[i]) continue;
		while (!bMatches[k]) k++;
		if (a[i] !== b[k]) transpositions++;
		k++;
	}
	transpositions /= 2;

	return (
		(matches / aLen + matches / bLen + (matches - transpositions) / matches) / 3
	);
}

function commonPrefixLength(a, b, max) {
	let n = 0;
	for (; n < Math.min(max, a.length, b.length); n++) {
		if (a[n] !== b[n]) break;
	}
	return n;
}

function colorFromString(str) {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}
	const hue = Math.abs(hash) % 360;
	return `hsl(${hue} 75% 65%)`;
}

function clearCanvas() {
    // 모든 타이머 및 레이어 정리
    try { orbTimers.forEach(stop => stop()); } catch (_) {}
    orbTimers = [];
    for (const layer of layers) {
        try { layer.stops.forEach(s => s()); } catch (_) {}
        if (layer.el && layer.el.parentNode) layer.el.parentNode.removeChild(layer.el);
    }
    layers = [];
    while (canvasEl.firstChild) canvasEl.removeChild(canvasEl.firstChild);
}

function createOrb(idx, baseColor) {
	const orb = document.createElement('div');
	orb.className = 'orb glow';

   
	let size = randomBetween(60, 220);

    console.warn('첫 오브 생성 전:', idx, baseColor);

    if (baseColor === '#eeeeeeff') {
        // 초기 오브 색일 때는 작게
        size = randomBetween(40, 120);
    } else {
        size = randomBetween(60, 220);
    }

	const left = randomBetween(-10, 90);
	const top = randomBetween(-10, 90);

	const hueShift = (idx * 13) % 24;
	const glowColor = shiftColor(baseColor, hueShift);

    // baseColor에 해당하는 emotionColorMap의 examples 찾기
    let exampleText = '';
    for (const group of emotionColorMap) {
        if (group.color === baseColor && group.examples && group.examples.length > 0) {
            /*
            // idx를 examples 배열 길이로 나눈 나머지를 사용하여 순환
            const exampleIdx = idx % group.examples.length;
            exampleText = group.examples[exampleIdx];
            */
            // 랜덤하게 예시 문장 선택    
            const randomIdx = Math.floor(Math.random() * group.examples.length);
            exampleText = group.examples[randomIdx];
            break;
        }
        else{
            exampleText = '당신의 감정은 특별합니다.';
        }
    }

	// 예시 문장 데이터 속성 추가
    orb.dataset.exampleText = exampleText;

	// 클릭 이벤트 추가
    orb.addEventListener('click', handleOrbClick);

	orb.style.width = `${size}px`;
	orb.style.height = `${size}px`;
	orb.style.left = `${left}%`;
	orb.style.top = `${top}%`;
	orb.style.background = radialPaint(glowColor);
	orb.style.boxShadow = softGlow(glowColor, size);
	const anim = ['floatA', 'floatB', 'floatC'][idx % 3];
	orb.style.animation = `${anim} ${randomBetween(6, 12)}s ease-in-out ${randomBetween(0, 4)}s infinite, pulseRot ${randomBetween(3.5, 7)}s ease-in-out ${randomBetween(0, 2)}s infinite alternate`;

	// after pseudo-element glow color
	orb.style.setProperty('--glow', glowColor);
	orb.style.position = 'absolute';
	orb.style.isolation = 'isolate';
	orb.style.setProperty('--size', `${size}px`);

	// add an ::after via inline stylesheet hook
	const after = document.createElement('style');
	after.textContent = `#${ensureCanvasId()} .orb.glow:nth-child(${idx + 1})::after{background:${glowColor};}`;
	orb.appendChild(after);
        console.warn('첫 오브 생성 후:', idx, glowColor);

    // 부드러운 주변 이동(드리프트) 시작
    const stop = startWander(orb, 12); // 반경 12% 내에서 부유
    return { el: orb, stop };
}

function ensureCanvasId() {
	if (!canvasEl.id) canvasEl.id = 'canvas';
	return canvasEl.id;
}

function radialPaint(color) {
	return `radial-gradient(circle at 30% 30%, ${withAlpha(color, 0.95)} 0%, ${withAlpha(color, 0.6)} 45%, ${withAlpha(color, 0.25)} 70%, transparent 100%)`;
}

function softGlow(color, size) {
	const s1 = Math.round(size * 0.25);
	const s2 = Math.round(size * 0.55);
	return `0 0 ${s1}px ${withAlpha(color, 0.65)}, 0 0 ${s2}px ${withAlpha(color, 0.35)}`;
}

function shiftColor(color, shift) {
	// supports hex or hsl()
	if (color.startsWith('#')) {
		const { h, s, l } = hexToHsl(color);
		return `hsl(${(h + shift) % 360} ${s}% ${l}%)`;
	}
	if (color.startsWith('hsl')) {
		const parts = color.replace(/hsl\(|\)|%/g, '').split(/\s+/);
		const h = (parseFloat(parts[0]) + shift) % 360;
		return `hsl(${h} ${parts[1]}% ${parts[2]}%)`;
	}
	return color;
}

function withAlpha(color, alpha) {
	if (color.startsWith('#')) {
		const { r, g, b } = hexToRgb(color);
		return `rgba(${r}, ${g}, ${b}, ${alpha})`;
	}
	if (color.startsWith('hsl')) {
		return color.replace('hsl', 'hsla').replace(')', ` / ${alpha})`).replace(/,/g, '');
	}
	return color;
}

function hexToRgb(hex) {
	let c = hex.replace('#', '');
	if (c.length === 3) c = c.split('').map(x => x + x).join('');
	const num = parseInt(c, 16);
	return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function hexToHsl(hex) {
	const { r, g, b } = hexToRgb(hex);
	const r1 = r / 255, g1 = g / 255, b1 = b / 255;
	const max = Math.max(r1, g1, b1), min = Math.min(r1, g1, b1);
	let h, s; const l = (max + min) / 2;
	if (max === min) { h = s = 0; }
	else {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case r1: h = (g1 - b1) / d + (g1 < b1 ? 6 : 0); break;
			case g1: h = (b1 - r1) / d + 2; break;
			default: h = (r1 - g1) / d + 4; break;
		}
		h /= 1;
		h *= 60;
	}
	return { h: Math.round(h || 0), s: Math.round((s || 0) * 100), l: Math.round(l * 100) };
}

function randomBetween(min, max) {
	return Math.random() * (max - min) + min;
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
    } else {
        // 각 토큰별 색 계산 후 개수 배분
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

        shuffleInPlace(assignment);
        for (let i = 0; i < assignment.length; i++) {
            const { el, stop } = createOrb(i, assignment[i]);
            layerStops.push(stop);
            layerEl.appendChild(el);
        }
    }

    canvasEl.appendChild(layerEl);
    // 페이드 인
    requestAnimationFrame(() => { layerEl.style.opacity = '1'; });

    // 이전 최상단 레이어 페이드 아웃 후 제거
    const prev = layers.length ? layers[layers.length - 1] : null;
    if (prev) {
        prev.el.style.opacity = '0';
        const cleanup = () => {
            try { prev.stops.forEach(s => s()); } catch (_) {}
            if (prev.el && prev.el.parentNode) prev.el.parentNode.removeChild(prev.el);
        };
        prev.el.addEventListener('transitionend', cleanup, { once: true });
        setTimeout(cleanup, 4000); //원이 생성될 때마다 걸리는 시간. 근데 이게 어느 정도 올라가면 적용이 안 되네.
    }

    // 레이어 스택 업데이트 (최대 2개 유지)
    layers.push({ el: layerEl, stops: layerStops });
    if (layers.length > 2) {
        const old = layers.shift();
        try { old.stops.forEach(s => s()); } catch (_) {}
        if (old.el && old.el.parentNode) old.el.parentNode.removeChild(old.el);
    }
}

function tokenizeEmotions(text) {
	if (!text) return [];
	const norm = normalizeText(text);
	// 구분자: 공백, 콤마, 슬래시, 앰퍼샌드, 플러스, '과/와/그리고/및/and'
	let raw = norm
		.replace(/\band\b/g, ' ')
		.replace(/\b그리고\b|\b과\b|\b와\b|\b했고\b/g, ' ')
		.replace(/[,&+/]+/g, ' ')
		.split(/\s+/)
		.filter(Boolean);
	// 너무 짧은 토큰, 불용어 제거
	raw = raw.filter(t => t.length >= 1 && !stopwords.has(t));

	// 감정 키워드와의 유사도가 충분한 토큰만 유지
	const keep = [];
	for (const tok of raw) {
		let best = 0;
		for (const group of emotionColorMap) {
			for (const keyRaw of group.keys) {
				const key = normalizeText(keyRaw);
				if (tok.includes(key) || key.includes(tok) || aliasMatch(tok, keyRaw)) { best = 1; break; }
				best = Math.max(best, jaroWinkler(tok, key));
			}
			if (best >= 1) break;
		}
		if (best >= 0.72) keep.push(tok);
	}
	return keep;
}

function shuffleInPlace(arr) {
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}

function startWander(orb, radiusPct) {
	// 현재 위치를 기준 위치로 저장
	const baseLeft = parseFloat(orb.style.left);
	const baseTop = parseFloat(orb.style.top);
	let cancelled = false;

	function clamp01(v) { return Math.min(100, Math.max(0, v)); }

	function step() {
		if (cancelled) return;
		const dx = randomBetween(-radiusPct, radiusPct);
		const dy = randomBetween(-radiusPct, radiusPct);
		const nextLeft = clamp01(baseLeft + dx);
		const nextTop = clamp01(baseTop + dy);
		orb.style.left = `${nextLeft}%`;
		orb.style.top = `${nextTop}%`;
		// 다음 이동까지 대기 (4~9초 랜덤)
		const delay = randomBetween(4000, 9000);
		timeoutId = window.setTimeout(step, delay);
	}

	let timeoutId = window.setTimeout(step, randomBetween(800, 2200));
	return () => { cancelled = true; window.clearTimeout(timeoutId); };
}

// 초기 렌더링 (빈 텍스트 → 기본 컬러)
renderOrbsFromText('');

// 레이어/타이머 강제 클리어 함수
function forceClearAllLayersAndTimers() {
    try { orbTimers.forEach(stop => stop()); } catch (_) {}
    orbTimers = [];
    layers.forEach(layer => {
        try { layer.stops.forEach(s => s()); } catch (_) {}
        if (layer.el && layer.el.parentNode) layer.el.parentNode.removeChild(layer.el);
    });
    layers = [];
    // 혹시 남은 모든 canvas 내 .layer도 일괄 제거
    document.querySelectorAll('.canvas .layer').forEach(el => {
        if (el.parentNode) el.parentNode.removeChild(el);
    });
}

// renderWithWaitForClear, renderOrbsWithUnlock에서 강제 클리어 호출
let _renderLock = false;
let _msgLock = false; // 메시지 표시 중 중복 입력 방지

// 입력값 전송되면 실행되는 함수
async function handleEmotionSubmit() {
    if (_msgLock) return;
    const value = inputEl.value.trim();
    if (!value) return;
    
    _msgLock = true;
    const inputWrap = document.querySelector('.input-wrap');
    
    // 색상값 계산
    const colorValue = colorForEmotion(value);
    
    // 서버에 로그 전송
    try {
        const response = await fetch('http://localhost:3001/api/emotion-log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                emotionText: value,
                colorValue: colorValue
            })
        });
        
        if (!response.ok) {
            console.error('Failed to log emotion');
        }
    } catch (err) {
        console.error('Error logging emotion:', err);
    }

    // 입력칸과 기존 원 레이어 페이드아웃
    if (inputWrap) inputWrap.classList.add('hide');
    const layersToRemove = document.querySelectorAll('.canvas .layer');
    layersToRemove.forEach(el => el.style.opacity = '0');

    setTimeout(() => {
        layersToRemove.forEach(el => {
            if (el.parentNode) el.parentNode.removeChild(el);
        });
        if (inputWrap) inputWrap.classList.add('removed');

		setTimeout(() => {
			renderOrbsFromText(value);
			_msgLock = false;
		}, 1000); //최초 원 페이드 아웃
	}, 3000); // 입력창 페이드 아웃
}


let cancelCurrent = null;

function createOverlay(){
    const el = document.createElement('div');
    el.id = 'radial-overlay';
    document.body.appendChild(el);
    return el;
}

// 오브 클릭 이벤트 핸들러 추가
function handleOrbClick(e) {
    const duration = 5000;
	const orb = e.target;
	const exampleText = orb.dataset.exampleText;
    //const exampleText = e.target.dataset.exampleText;

	// 클릭한 원의 위치와 색상 가져오기
    const rect = orb.getBoundingClientRect();
    const orbCenterX = rect.left + rect.width / 2;
    const orbCenterY = rect.top + rect.height / 2;
    
    // 원의 background에서 색상 추출
    const computedStyle = window.getComputedStyle(orb);
    const bgImage = computedStyle.backgroundImage;
    const color = bgImage.match(/rgba?\([^)]+\)/)[0];

    // Radical fill background effect
    // 새로운 오버레이 생성
      const overlay = createOverlay();

      // 화면 크기 및 클릭 위치를 기준으로 최대 거리 계산 (화면 끝까지 도달하도록)
      const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
      const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
      const dx = Math.max(orbCenterX, vw - orbCenterX);
      const dy = Math.max(orbCenterY, vh - orbCenterY);
      const maxDist = Math.hypot(dx, dy); // 대각선 거리 계산

      const softEdge = 120; // 경계가 부드러워지는 정도(px)
      const easeOutQuad = t => 1 - (1 - t) * (1 - t); // 이징 함수

      let rafId;
      const start = performance.now(); // 시작 시각 저장

      // 프레임별 애니메이션 갱신 함수
      function frame(now){
        const elapsed = now - start; // 경과 시간
        let t = Math.min(1, elapsed / duration); // 진행 비율 (0~1)
        t = easeOutQuad(t); // 이징 적용

        // softEdge 값만큼 반경을 추가하여 원이 더 크게 확산되도록 설정
        const radius = t * (maxDist + softEdge);

        // radial-gradient를 사용해 중심에서 바깥쪽으로 색이 퍼지게 설정
        overlay.style.background = `radial-gradient(circle ${radius}px at ${orbCenterX}px ${orbCenterY}px, ${color} 0px, ${color} ${Math.max(0, radius - softEdge)}px, rgba(0,0,0,0) ${radius}px)`;

        if (elapsed < duration) {
          // 아직 애니메이션이 끝나지 않았으면 다음 프레임 요청
          rafId = requestAnimationFrame(frame);
        } else {
          // 애니메이션 종료 시점
          document.body.style.background = color; // 최종 배경색 고정

          // 오버레이를 서서히 페이드아웃시켜 깜빡임 없이 전환
          requestAnimationFrame(() => {
            overlay.style.opacity = '0';
            overlay.addEventListener('transitionend', () => {
              if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            }, { once: true });
          });
        }
      }

      // 애니메이션 시작
      rafId = requestAnimationFrame(frame);

      // 취소 함수 정의 (다른 클릭 시 기존 애니메이션 제거)
      cancelCurrent = () => {
        cancelAnimationFrame(rafId);
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        cancelCurrent = null;
      };

    
    // 방사형 배경 효과를 위한 요소 생성
    /*
    const ripple = document.createElement('div');
    ripple.className = 'background-ripple';
    
    // 화면 대각선 길이 계산 (가장 먼 거리)
    const maxDistance = Math.sqrt(
        Math.pow(Math.max(orbCenterX, window.innerWidth - orbCenterX), 2) +
        Math.pow(Math.max(orbCenterY, window.innerHeight - orbCenterY), 2)
    );
    
    ripple.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: radial-gradient(circle at ${orbCenterX}px ${orbCenterY}px, 
            ${color} 0%, 
            ${color.replace(')', ', 0.7)')} 30%, 
            ${color.replace(')', ', 0.3)')} 60%, 
            transparent 100%);
        opacity: 0;
        pointer-events: none;
        transition: opacity 1.2s ease-out;
        z-index: -1;
    `;
    
    document.body.appendChild(ripple);
    
    // 방사형 효과 시작
    requestAnimationFrame(() => {
        ripple.style.opacity = '1';
    });

    */
    
    // 모든 원 페이드아웃
    /*
    const layers = document.querySelectorAll('.layer');
    layers.forEach(layer => {
        layer.style.opacity = '0';
        setTimeout(() => {
            if (layer.parentNode) layer.parentNode.removeChild(layer);
        }, 800);
    });
	*/


	// 예시 문장 표시할 요소 생성
    const messageEl = document.createElement('div');
    messageEl.className = 'example-message';
    messageEl.textContent = exampleText;
    messageEl.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 1.5rem;
        color: #393a54;
        text-align: center;
        opacity: 0;
        transition: opacity 3.0s ease; 
        padding: 2rem;
        background: rgba(255, 255, 255, 0.85);
        border-radius: 0.5rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        z-index: 1000;
    `; //transition ease 값에 따라 메세지 페이드인 속도가 달라짐.

    document.body.appendChild(messageEl);
    
    // 페이드인
    setTimeout(() => {
        messageEl.style.opacity = '1';
    }, 8000); //n초 뒤에 메세지가 나온다는 소리.

    // 3초 후 메시지 페이드아웃
    /*
	setTimeout(() => {
        messageEl.style.opacity = '0';
        setTimeout(() => {
            if (messageEl.parentNode) messageEl.parentNode.removeChild(messageEl);
            // 입력창 다시 표시
            const inputWrap = document.querySelector('.input-wrap');
            if (inputWrap) {
                inputWrap.classList.remove('hide', 'removed');
                inputEl.value = '';
                inputEl.focus();
            }
        }, 800);
    }, 3000);
	*/
	// 3초 후 효과 제거
    setTimeout(() => {
        messageEl.style.opacity = '0';
        //ripple.style.opacity = '0';
        
        setTimeout(() => {
            if (messageEl.parentNode) messageEl.parentNode.removeChild(messageEl);
            if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
        }, 1200);
    }, 15000); //n초 뒤에 메시지가 사라진다는 소리.
}	


function renderWithWaitForClear(text) {
    if (_renderLock) return; // 중복 방지
    _renderLock = true;
    // 기존 레이어가 있으면 opacity를 0으로 만들고, 완전히 사라진 뒤 새로 그린다.
    const prev = layers.length ? layers[layers.length - 1] : null;
    if (prev) {
        prev.el.style.opacity = '0';
        const doRender = () => {
            // 레이어/타이머 모두 강제 클리어
            forceClearAllLayersAndTimers();
            setTimeout(() => {
                renderOrbsWithUnlock(text);
            }, 40);
        };
        prev.el.addEventListener('transitionend', doRender, { once: true });
        setTimeout(doRender, 4000); //입력창 사라지고 다음 원 렌더링까지 걸리는 시간 조절
    } else {
        forceClearAllLayersAndTimers();
        renderOrbsWithUnlock(text);
    }
}

function renderOrbsWithUnlock(text) {
    forceClearAllLayersAndTimers();
    renderOrbsFromText(text);
    setTimeout(() => { _renderLock = false; }, 120);
}

inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.keyCode === 13) {
        handleEmotionSubmit();
    }
});

const btn = document.getElementById('emotion-confirm');
if (btn) btn.addEventListener('click', handleEmotionSubmit);


