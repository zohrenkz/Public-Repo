export default {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {},
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
};

