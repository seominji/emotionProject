import {emotionColorMap} from '../data/emotionColorMap.js';
import {stopwords} from '../data/stopwords.js';
import {aliasByKey} from '../data/aliasByKey.js';

const inputEl = document.getElementById('userInput'); 

let i = 0;
const group = emotionColorMap[0];
for (i = 0; i < 3; i++) {
    console.log(group.examples[i]);
}
//h \n i \n ! 이렇게 잘 나옴


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
    console.warn('지원되지 않는 색상 포맷:', color);
	return color;
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



function hexToRgb(hex) {
	let c = hex.replace('#', '');
    // 8자리(hex + alpha)면 마지막 두 자리(alpha) 제거
    if (c.length === 8) c = c.slice(0, 6);
	if (c.length === 3) c = c.split('').map(x => x + x).join('');
	const num = parseInt(c, 16);
	return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}


function colorForEmotion(value) {
	if (value === -1) { return '#eeeeeeff'; }//초기 오브 색
	
	for (const group of emotionColorMap) {
		if(group.keys === value){
        return group.color; 
        }
	}

    console.error('일치하는 감정 색상 없음:', value);
    return '#ff7215ff';
}


document.getElementById("analyzeBtn").addEventListener("click", async () => {
    const value = document.getElementById("userInput").value.trim();
    if (!value) return alert("문장을 입력해주세요!");

    console.log("분석 요청 문장:", value);

    

    let anlValue = null;
    try{
        const response = await fetch('http://localhost:3001/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                value 
            })
        });

        anlValue = await response.json();

        if (!response.ok) {
            console.error('Failed to /analyze request');
        }
    } catch (err) {    
        console.error('Error handleEmotionSubmit() → /analyze:', err);
    }

    console.log("서버 리턴 값: ", typeof anlValue, anlValue);

    const cfe = colorForEmotion(anlValue)
    console.log("colorForEmotion 값: ", cfe );
    document.getElementById("colorBox1").style.background = cfe;

    const rgb = hexToRgb(cfe);
    console.log("colorForEmotion 값: ", rgb);
    document.getElementById("colorBox2").style.background = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

    const hsl = hexToHsl(colorForEmotion(anlValue));
    console.log("colorForEmotion 값: ", `hsl(${hsl.h}, ${(hsl.s).toString()+'%'}, ${(hsl.l).toString()+'%'})`);
    console.log((hsl.s).toString() );
    document.getElementById("colorBox3").style.background = `hsl(${hsl.h}, ${(hsl.s).toString()+'%'}, ${(hsl.l).toString()+'%'})`;;








});

