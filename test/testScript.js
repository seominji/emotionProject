const emotionMap = {
  기쁨: { color: "#FFD93D", message: "행복이 느껴져요 😊" },
  슬픔: { color: "#6C63FF", message: "마음이 조금 힘든가요 😔" },
  분노: { color: "#FF6B6B", message: "화난 감정이 느껴져요 😡" },
  불안: { color: "#5D5FEF", message: "조금 불안한 마음이 있네요 😨" },
  당황: { color: "#00BFA6", message: "놀란 마음이군요 😲" },
  상처: { color: "#B00020", message: "마음에 상처가 느껴져요 💔" },
  중립: { color: "#A0A0A0", message: "평온한 감정이네요 😌" }
};

const emotionHistory = [];

document.getElementById("analyzeBtn").addEventListener("click", async () => {
  const text = document.getElementById("userInput").value.trim();
  if (!text) return alert("문장을 입력해주세요!");

  const response = await fetch("http://localhost:3000/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });

  //서버측에서 받아온 ai 연산 결과 가져오기
  const result = await response.json();
  console.log("서버 응답:", result, typeof result);


  const topEmotion = result[0]?.[0]?.label || "중립";
  const emotionData = emotionMap[topEmotion] || emotionMap["중립"];

  const emotionObject = {
    type: topEmotion,
    color: emotionData.color,
    message: emotionData.message,
    text,
    time: new Date().toISOString()
  };

  emotionHistory.push(emotionObject);
  console.log("감정 분석 결과:", emotionObject);

  showResult(emotionObject);
});

function showResult(emotion) {
  const box = document.getElementById("resultBox");
  const typeEl = document.getElementById("emotionType");
  const msgEl = document.getElementById("emotionMessage");

  box.style.background = emotion.color;
  typeEl.textContent = `감정: ${emotion.type}`;
  msgEl.textContent = emotion.message;

  box.classList.remove("hidden");
  box.style.opacity = "1";

  setTimeout(() => {
    box.style.opacity = "0";
    setTimeout(() => box.classList.add("hidden"), 600);
  }, 4000);
}
