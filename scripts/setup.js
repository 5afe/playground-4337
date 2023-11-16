const { setup } = require("./lib");

async function main() {
  const { entrypoint, relayer, owner } = await setup();

  console.log(`using entrypoint ${entrypoint.target}`);
  console.log(`using relayer ${relayer.address}`);
  console.log(`using owner ${owner.address}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
