class AudioProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    this.bufferSize = options.processorOptions.bufferSize || 2048;
    this.buffer = new Float32Array(this.bufferSize);
    this.bufferIndex = 0;
    this.minDecibels = options.processorOptions.minDecibels || -50; // 옵션에서 데시벨 임계값 받기
  }

  calculateDecibels(samples) {
    // RMS(Root Mean Square) 계산
    let sum = 0;
    for (let i = 0; i < samples.length; i++) {
      sum += samples[i] * samples[i];
    }
    const rms = Math.sqrt(sum / samples.length);

    // RMS를 데시벨로 변환
    return 20 * Math.log10(rms);
  }

  process(inputs) {
    const input = inputs[0];
    if (input.length > 0) {
      const channelData = input[0];

      // 버퍼에 데이터 추가
      for (let i = 0; i < channelData.length; i++) {
        this.buffer[this.bufferIndex++] = channelData[i];

        // 버퍼가 가득 차면 데시벨 체크 후 전송
        if (this.bufferIndex >= this.bufferSize) {
          const decibels = this.calculateDecibels(this.buffer);

          // 데시벨이 임계값 이상인 경우에만 데이터 전송
          if (decibels >= this.minDecibels) {
            const int16Buffer = new Int16Array(this.bufferSize);
            for (let j = 0; j < this.bufferSize; j++) {
              int16Buffer[j] = Math.min(1, this.buffer[j]) * 0x7fff;
            }
            this.port.postMessage(int16Buffer);
          }
          this.bufferIndex = 0;
        }
      }
    }
    return true;
  }
}

registerProcessor("audio-processor", AudioProcessor);
