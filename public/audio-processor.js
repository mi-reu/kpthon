class AudioProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    const opts = options.processorOptions || {};
    this.bufferSize = opts.bufferSize || 2048;
    this.buffer = new Float32Array(this.bufferSize);
    this.bufferIndex = 0;
    this.silenceThreshold = opts.silenceThreshold || 0.01;
    this.gain = opts.gain || 1.5;

    // 무음 타이머 관련
    this.silenceTimeout = opts.silenceTimeout || 300; // ms
    this.lastActiveTime = currentTime * 1000; // 마이크 소리가 들어온 마지막 시간 (ms)
  }

  isSilent(buffer) {
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) {
      sum += buffer[i] * buffer[i];
    }
    const rms = Math.sqrt(sum / buffer.length);
    return rms < this.silenceThreshold;
  }

  sendBuffer(buffer) {
    const int16Buffer = new Int16Array(buffer.length);
    for (let j = 0; j < buffer.length; j++) {
      int16Buffer[j] = buffer[j] * 0x7fff;
    }
    this.port.postMessage(int16Buffer);
  }

  sendSilentChunk() {
    const silentBuffer = new Int16Array(this.bufferSize); // all 0
    this.port.postMessage(silentBuffer);
  }

  process(inputs) {
    const input = inputs[0];

    if (input.length > 0) {
      const channelData = input[0];

      let isActive = false;

      for (let i = 0; i < channelData.length; i++) {
        const amplified = channelData[i] * this.gain;
        this.buffer[this.bufferIndex++] = Math.max(-1, Math.min(1, amplified));

        if (Math.abs(channelData[i]) > this.silenceThreshold) {
          isActive = true;
        }

        if (this.bufferIndex >= this.bufferSize) {
          if (!this.isSilent(this.buffer)) {
            this.sendBuffer(this.buffer);
            this.lastActiveTime = currentTime * 1000;
          }
          this.bufferIndex = 0;
        }
      }

      // 활동 감지되면 마지막 활동 시간 갱신
      if (isActive) {
        this.lastActiveTime = currentTime * 1000;
      }
    }

    // 🧊 일정 시간 이상 음성 입력 없으면 무음 덤프 전송
    const now = currentTime * 1000;
    if (now - this.lastActiveTime > this.silenceTimeout) {
      this.sendSilentChunk();
      this.lastActiveTime = now; // 중복 전송 방지
    }

    return true;
  }
}

registerProcessor("audio-processor", AudioProcessor);
