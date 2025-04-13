class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 2048;
    this.buffer = new Float32Array(this.bufferSize);
    this.bufferIndex = 0;
  }

  process(inputs) {
    const input = inputs[0];
    if (input.length > 0) {
      const channelData = input[0];

      // 버퍼에 데이터 추가
      for (let i = 0; i < channelData.length; i++) {
        this.buffer[this.bufferIndex++] = channelData[i];

        // 버퍼가 가득 차면 Int16Array로 변환하여 전송
        if (this.bufferIndex >= this.bufferSize) {
          const int16Buffer = new Int16Array(this.bufferSize);
          for (let j = 0; j < this.bufferSize; j++) {
            int16Buffer[j] = Math.min(1, this.buffer[j]) * 0x7fff;
          }
          this.port.postMessage(int16Buffer);
          this.bufferIndex = 0;
        }
      }
    }
    return true;
  }
}

registerProcessor("audio-processor", AudioProcessor);
