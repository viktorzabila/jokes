const { TestHelper } = require("uu_appg01_server-test");

const CMD = "joke/get";
afterEach(async () => {
  await TestHelper.dropDatabase();
  await TestHelper.teardown();
});

beforeEach(async () => {
  await TestHelper.setup();
  await TestHelper.initUuSubAppInstance();
  await TestHelper.createUuAppWorkspace();
  let session = await TestHelper.login("AwidLicenseOwner", false, false);

  let dtoIn = {
    uuAppProfileAuthorities: "urn:uu:GGALL",
  };
  let result = await TestHelper.executePostCommand("sys/uuAppWorkspace/init", dtoIn, session);
});

describe("Testing the joke/get uuCmd...", () => {
  test("HDS", async () => {
    let session = await TestHelper.login("Authorities", false, false);
    await TestHelper.executeDbScript(`
      db.jokesMain.updateOne({awid: "${TestHelper.awid}" }, { $set: { state: "active" } });
    `);
    let result = await TestHelper.executeGetCommand("joke/get", { id: "61a0feba0e3bb20b349ff8a8" }, session);
    expect(result.status).toEqual(200);
    expect(result.data.uuAppErrorMap).toBeDefined();
  });
});