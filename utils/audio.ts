export interface AudioBufferInfo {
  length: number;
  duration: number;
  sampleRate: number;
  numberOfChannels: number;
}

export async function playAudio(audio: Int16Array): Promise<void> {
  try {
    // byteArray 데이터를 Int16Array로 변환
    const byteArray = new Uint8Array(audio);
    const int16Array = new Int16Array(byteArray.buffer);

    // 오디오 컨텍스트 초기화
    const audioContext = new AudioContext({
      sampleRate: 16000,
    });

    // Int16Array를 Float32Array로 변환
    const float32Array = new Float32Array(int16Array.length);

    // 데이터 정규화
    for (let i = 0; i < int16Array.length; i++) {
      // Int16 범위(-32768 ~ 32767)를 Float32 범위(-1.0 ~ 1.0)로 정규화
      float32Array[i] = int16Array[i] / 32768.0;
    }

    // 오디오 버퍼 생성
    const audioBuffer = audioContext.createBuffer(
      1,
      float32Array.length,
      16000
    );
    audioBuffer.copyToChannel(float32Array, 0);

    // 오디오 재생
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;

    // 게인 노드 추가하여 볼륨 조절
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 1.0;

    source.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // 오디오 컨텍스트가 일시 중지된 상태면 재개
    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    source.start(0);

    // 재생이 끝나면 정리
    source.onended = () => {
      audioContext.close();
    };
  } catch (error) {
    console.error("Error playing audio:", error);
  }
}
