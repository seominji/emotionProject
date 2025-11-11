//ref: https://huggingface.co/hun3359/klue-bert-base-sentiment
//construct: keys; color; examples;

export const emotionColorMap = [
  { keys: 0, color: '#3664FA', examples: []}, //분노
  { keys: 1, color: '#fdff75ff', examples: []}, //툴툴대는
  { keys: 2, color: '#fd8fb4ff', examples: []}, //좌절한
  { keys: 3, color: '#75e3ffff', examples: []}, //짜증내는
  { keys: 4, color: '#98ee7eff', examples: []}, //방어적인
  { keys: 5, color: '#ff7d75', examples: []}, //악의적인
  { keys: 6, color: '#ff7d75', examples: []}, //안달하는
  { keys: 7, color: '#ff7d75', examples: []}, //구역질 나는
  { keys: 8, color: '#ff7d75', examples: []}, //노여워하는
  { keys: 9, color: '#ff7d75', examples: []}, //성가신
  { keys: 10, color: '#78b2f5ff', examples: []}, //슬픔
  { keys: 11, color: '#325072ff', examples: []}, //실망한
  { keys: 12, color: '#9b7959ff', examples: []}, //비통한
  { keys: 13, color: '#30632aff', examples: []}, //후회되는
  { keys: 14, color: '#c58d59ff', examples: []}, //우울한
  { keys: 15, color: '#845ce4ff', examples: []}, //마비된
  { keys: 16, color: '#36993eff', examples: []}, //염세적인
  { keys: 17, color: '#ff7d75', examples: []}, //
  { keys: 18, color: '#ff7d75', examples: []},
  { keys: 19, color: '#ff7d75', examples: []},
  { keys: 20, color: '#ff7d75', examples: []},
  { keys: 21, color: '#ff7d75', examples: []},
  { keys: 22, color: '#ff7d75', examples: []},
  { keys: 23, color: '#ff7d75', examples: []},
  { keys: 24, color: '#ff7d75', examples: []},
  { keys: 25, color: '#ff7d75', examples: []},
  { keys: 26, color: '#ff7d75', examples: []},
  { keys: 27, color: '#ff7d75', examples: []},
  { keys: 28, color: '#ff7d75', examples: []},
  { keys: 29, color: '#ff7d75', examples: []},
  { keys: 30, color: '#ff7d75', examples: []},
  { keys: 31, color: '#ff7d75', examples: []},
  { keys: 32, color: '#ff7d75', examples: []},
  { keys: 33, color: '#ff7d75', examples: []},
  { keys: 34, color: '#ff7d75', examples: []},
  { keys: 35, color: '#ff7d75', examples: []},
  { keys: 36, color: '#ff7d75', examples: []},
  { keys: 37, color: '#ff7d75', examples: []},
  { keys: 38, color: '#ff7d75', examples: []},
  { keys: 39, color: '#ff7d75', examples: []},
  { keys: 40, color: '#ff7d75', examples: []},
  { keys: 41, color: '#ff7d75', examples: []},
  { keys: 42, color: '#ff7d75', examples: []},
  { keys: 43, color: '#ff7d75', examples: []},
  { keys: 44, color: '#ff7d75', examples: []},
  { keys: 45, color: '#ff7d75', examples: []},
  { keys: 46, color: '#ff7d75', examples: []},
  { keys: 47, color: '#ff7d75', examples: []},
  { keys: 48, color: '#ff7d75', examples: []},
  { keys: 49, color: '#ff7d75', examples: []},
  { keys: 50, color: '#ff7d75', examples: []},
  { keys: 51, color: '#ff7d75', examples: []},
  { keys: 52, color: '#ff7d75', examples: []},
  { keys: 53, color: '#ff7d75', examples: []},
  { keys: 54, color: '#ff7d75', examples: []},
  { keys: 55, color: '#ff7d75', examples: []},
  { keys: 56, color: '#ff7d75', examples: []},
  { keys: 57, color: '#ff7d75', examples: []},
  { keys: 58, color: '#ff7d75', examples: []},
  { keys: 59, color: '#ff7d75', examples: []}
];

/*
[
	{ keys: ['행복', '기쁨', '즐거움', '설렘', '희열', '행복해', ], color: '#ff7d75', examples: [
      "오늘 시험에 합격해서 정말 행복해요",
      "친구와 놀아서 기분이 좋아요",
      "맛있는 음식을 먹고 즐거워요"
    ] },
	{ keys: ['사랑', '애정', '따뜻', '감사', '포근', '사랑해', ], color: '#ff7082', examples: [
      "사랑하는 사람과 함께여서 행복해요",
      "따뜻한 차 한 잔이 그리워요",
      "감사한 마음으로 하루를 시작해요"
    ] },
	{ keys: ['평온', '차분', '안정', '고요', '잔잔', ], color: '#82d4f3', examples: [
      "조용한 음악을 들으니 평온해져요",
      "차분한 마음으로 명상해요",
      "안정된 하루가 그리워요"
    ] },
	{ keys: ['우울', '슬픔', '눈물', '허무', '외로움', '울쩍', '울적', '울쩍해', '울적해', '우울해', ], color: '#77e9b0', examples: [
      "슬픈 영화를 보고 눈물이 나요",
      "외로운 밤이 계속되네요",
      "허무한 기분이 드는 날이에요"
    ] },
	{ keys: ['분노', '화남', '짜증', '불만', '짜증나', ], color: '#ff5757', examples: [
      "짜증나는 일이 많아서 힘들어요",
      "화가 나서 참기가 힘들어요",
      "불만이 쌓여가는 기분이에요"
    ] },
	{ keys: ['불안', '초조', '긴장', '걱정', ], color: '#ff9f1c', examples: [
      "내일 발표가 걱정돼요",
      "초조한 마음을 달래고 싶어요",
      "긴장된 상태가 계속되네요"
    ] },
	{ keys: ['피곤', '지침', '무기력', ], color: '#a7a7a7' },
	{ keys: ['창의', '영감', '신기', '집중', ], color: '#9b6bff' },
	{ keys: ['희망', '기대', '긍정', ], color: '#a8e063' },
	{ keys: ['그리움', '향수', '연민', '공감', ], color: '#f4a3c2' },
  { keys: ['상쾌', '신선', '활기', '좋아', ], color: '#42f5e6'}
];
*/
