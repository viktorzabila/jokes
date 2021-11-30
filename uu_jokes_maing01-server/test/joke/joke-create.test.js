const { TestHelper } = require("uu_appg01_server-test");
const PolygonsTestHelper = require("../polygons-test-helper.js");
const ValidateHelper = require("../validate-helper.js");

const CMD = "joke/create";
// beforeAll(async () => {
//   await TestHelper.setup();
//   await TestHelper.initUuSubAppInstance();
//   await TestHelper.createUuAppWorkspace();
// });

beforeEach(async () => {
    await TestHelper.setup();
    await TestHelper.initUuSubAppInstance();
    await TestHelper.createUuAppWorkspace();

  let session = await TestHelper.login("AwidLicenseOwner", false, false);

  let dtoIn = {
    uuAppProfileAuthorities: "urn:uu:GGALL",
  };
  let result = await TestHelper.executePostCommand("sys/uuAppWorkspace/init", dtoIn, session);
  const filter = `{awid: "${TestHelper.awid}"}`;
  const params = `{$set: ${JSON.stringify({ state: `active` })}}`;
  await TestHelper.executeDbScript(`db.jokesMain.findOneAndUpdate(${filter}, ${params});`);
});

afterEach(async () => {
    await TestHelper.dropDatabase();
  await TestHelper.teardown();
});

describe("Testing the joke/create...", () => {
  test("HDS", async () => {
    let session = await TestHelper.login("AwidLicenseOwner", false, false);
    let result = await TestHelper.executePostCommand("joke/create", { name:"Joke name" },session);
    expect(result.status).toEqual(200);
    expect(result.data.uuAppErrorMap).toBeDefined();
  });
  test("Test - JokesIsNotInCorrectState", async () => {
    let session = await TestHelper.login("AwidLicenseOwner", false, false);
    const filter = `{awid: "${TestHelper.awid}"}`;
    const params = `{$set: ${JSON.stringify({ state: `test` })}}`;
    await TestHelper.executeDbScript(`db.jokesMain.findOneAndUpdate(${filter}, ${params});`);
    let expectedError = {
      code: `${CMD}/jokesIsNotInCorrectState`,
      message: "jokes is not in correct state.",
      paramMap: { awid: TestHelper.awid,expectedState:"active" },
    };
    expect.assertions(3);
    try {
      await TestHelper.executePostCommand("joke/create", { name:"Joke name" },session);
    } catch (error) {
      expect(error.status).toEqual(400);
      expect(error.message).toEqual(expectedError.message);
      if (error.paramMap && expectedError.paramMap) {
        expect(error.paramMap).toEqual(expectedError.paramMap);
      }
    }
  });
  test("Test A3 - invalidDtoIn", async () => {
    expect.assertions(ValidateHelper.assertionsCount.invalidDtoIn);
    try {
        await TestHelper.executePostCommand("joke/create", { name: true });
    } catch (e) {
        ValidateHelper.validateInvalidDtoIn(e, CMD);
    }
    });
  test("Test - joke main does not exist", async () => {
    let session = await TestHelper.login("Authorities", false, false);
    const filter = `{awid: "${TestHelper.awid}"}`;
    const params = `{$set: ${JSON.stringify({ awid: `vfr` })}}`;
    await TestHelper.executeDbScript(`db.jokesMain.findOneAndUpdate(${filter}, ${params});`);
    let expectedError = {
      code: `${CMD}/jokesMainDoesNotExist`,
      message: "jokes does not exist",
      paramMap: { awid: TestHelper.awid },
    };
    expect.assertions(3);
    try {
      await TestHelper.executePostCommand("joke/create", { name:"Joke name" },session);
    } catch (error) {
      expect(error.status).toEqual(400);
      expect(error.message).toEqual(expectedError.message);

      if (error.paramMap && expectedError.paramMap) {
        expect(error.paramMap).toEqual(expectedError.paramMap);
      } 
    }
  });
});





