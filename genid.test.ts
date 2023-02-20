import GenidService from "./genid";
import { expect } from "chai";
import "mocha";

const maxYmd = "2050/01/01"; // future valid date, avoid timestamp overflow
const timeshift = new Date(maxYmd).getTime() - Date.now();
const ID_LENGTH = GenidService.ID_LENGTH;
const UNIQUE_ID_SIZE = 100000;

describe("GenId", function () {
  describe("timeshift now", function () {
    it(ID_LENGTH + " digit id", async function () {
      const genidService = new GenidService({});
      const id = await genidService.genId();
      expect(id.toString().length).to.equal(ID_LENGTH);

      const timestamp = genidService.getTimestamp(id);
      expect(Math.abs(Date.now() - timestamp)).to.lessThan(1000);
    });
  });

  describe("timeshift to " + maxYmd, function () {
    it(ID_LENGTH + " valid digit id", async function () {
      const genidService = new GenidService({ timeshift });
      const id = await genidService.genId();
      expect(id.toString().length).to.equal(ID_LENGTH);

      const timestamp = genidService.getTimestamp(id);
      const duration = Math.abs(Date.now() + timeshift - timestamp);
      console.log("\nduration verify:", duration, " ms\n");

      expect(duration).to.lessThan(1000);
    });
  });

  describe("check duplicate", function () {
    it(UNIQUE_ID_SIZE.toLocaleString() + " unique id", async function () {
      const genidService = new GenidService({ machineId: 1, processId: 7 });
      const map = new Map();
      const begin = Date.now();

      for (let index = 0; index < UNIQUE_ID_SIZE; index++) {
        const id = await genidService.genId();
        expect(id.toString().length).to.equal(ID_LENGTH);

        map.set(id, index);
      }

      const end = Date.now();
      const duration = end - begin;
      console.log("\nduration: " + duration + " ms\n");
      console.log("req/s: " + Math.round((UNIQUE_ID_SIZE * 1000) / duration));

      expect(map.size).to.equal(UNIQUE_ID_SIZE);
    }).timeout(10000);
  });
});
