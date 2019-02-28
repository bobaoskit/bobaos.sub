const BobaosSub = require("./");

let my = BobaosSub();

my.on("connect", _ => {
  console.log("connected to ipc, still not subscribed to channels");
});

my.on("ready", async _ => {
  try {
    console.log("hello, friend");
    console.log("ping:", await my.ping());
    console.log("get sdk state:", await my.getSdkState());
    console.log("get value:", await my.getValue([1, 107, 106]));
    console.log("get stored value:", await my.getStoredValue([1, 107, 106]));
    console.log("set value:", await my.setValue({ id: 11, value: 16 }));
    console.log("read value:", await my.readValue([1, 6, 7, 8]));
    console.log("get programming mode:", await my.getProgrammingMode());
    console.log("get parameter byte", await my.getParameterByte([1, 2, 3, 4]));
    console.log("reset", await my.reset());
    console.log("get server item:", await my.getServerItem(null));
  } catch (e) {
    console.log("err", e.message);
  }
});

my.on("datapoint value", payload => {
  // please keep in mind that payload may be array of datapoint values
  // so, check it at first with Array.isArray
  console.log("broadcasted datapoint value: ", payload);
});

my.on("server item", payload => {
  console.log("broadcasted server item: ", payload);
});

my.on("sdk state", payload => {
  console.log("broadcasted sdk state: ", payload);
});
