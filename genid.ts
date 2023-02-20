const ID_LENGTH = 15; // depends on TIMESTAMP, MACHINE, PROCESS, SEQUENCE LENGTH
const MAX_MACHINE = 4;
const MAX_PROCESS = 8;
const MAX_SEQUENCE = 16; // proportional to genid request / milliseccond
const MACHINE_LENGTH = Math.log2(MAX_MACHINE);
const PROCESS_LENGTH = Math.log2(MAX_PROCESS);
const SEQUENCE_LENGTH = Math.log2(MAX_SEQUENCE);
const TIMESTAMP_LENGTH = 40; // proportional to max date presentation
const TIME_OFFSET = new Date("2023/01/01").getTime();
const TIMESHIFT = 0; // goto future timestamp

export default class GenidService {
  seq: number;
  machineId: number;
  processId: number;
  timeOffset: number;
  timeshift: number;
  lastTime: number;
  public static ID_LENGTH = ID_LENGTH;

  constructor(options: any) {
    options = options || {};
    this.seq = 0;
    this.machineId =
      (options.machineId || process.env.MACHINE_ID || 0) % MAX_MACHINE;
    this.processId =
      (options.processId || process.env.PROCESS_ID || 0) % MAX_PROCESS;
    this.timeOffset = options.timeOffset || TIME_OFFSET;
    this.timeshift = options.timeshift || TIMESHIFT;
    this.lastTime = 0;
  }

  getTime = () => {
    return Date.now() + this.timeshift;
  };

  genId = async () => {
    let time = this.getTime();

    if (this.lastTime == time) {
      ++this.seq;

      if (this.seq >= MAX_SEQUENCE) {
        //make system wait till time is been shifted by one millisecond
        do {
          time = this.getTime();
        } while (time <= this.lastTime);

        this.seq = 0;
      }
    } else {
      this.seq = 0;
    }

    this.lastTime = time;

    let bSeq = this.seq.toString(2),
      bMachineId = this.machineId.toString(2),
      bProcessId = this.processId.toString(2),
      bTime = (time - this.timeOffset).toString(2);

    //create sequence binary bit
    while (bSeq.length < SEQUENCE_LENGTH) bSeq = "0" + bSeq;
    while (bMachineId.length < MACHINE_LENGTH) bMachineId = "0" + bMachineId;
    while (bProcessId.length < PROCESS_LENGTH) bProcessId = "0" + bProcessId;
    while (bTime.length < TIMESTAMP_LENGTH) bTime = "0" + bTime;

    //prefix "1" to fix bid length
    const bid = "1" + bTime + bMachineId + bProcessId + bSeq;
    const id = parseInt(bid, 2);

    return id;
  };

  getTimestamp(id: number) {
    const bid = Number(id).toString(2);
    const bTimestamp = bid.substring(1, 1 + TIMESTAMP_LENGTH);

    return parseInt(bTimestamp, 2) + this.timeOffset;
  }
}
