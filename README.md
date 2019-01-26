# bobaos.sub - client lib for bobaos.pub
 
 ## Installation
 
 ```
 npm install --save bobaos.sub
 ```
 
 ## Usage example
 
 Source:
 ```js
 const BobaosSub = require('bobaos.sub');
 
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
     console.log("get stored value:", await my.getValue([1, 107, 106]));
     console.log("get server item:", await my.getServerItem([1, 2, 3]));
     console.log("set value:", await my.setValue({id: 103, value: 0}));
     console.log("read value:", await my.readValue([1, 103, 104, 105]));
     console.log("get programming mode:", await my.getProgrammingMode());
     console.log("set programming mode:", await my.setProgrammingMode(true));
     console.log("get parameter byte", await my.getParameterByte([1, 2, 3, 4]));
     console.log("reset", await my.reset());
   } catch(e) {
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
 
 ```
 
 Output:
 ```
 hello, friend
 ping: true
 get sdk state: ready
 get value: [ { id: 1, value: 20.7, raw: [ 12, 11 ] },
   { id: 107, value: false, raw: [ 0 ] },
   { id: 106, value: false, raw: [ 0 ] } ]
 get stored value: [ { id: 1, value: 20.7, raw: [ 12, 11 ] },
   { id: 107, value: false, raw: [ 0 ] },
   { id: 106, value: false, raw: [ 0 ] } ]
 get server item: { id: 8,
   name: 'SerialNumber',
   value: [ 0, 197, 1, 1, 118, 183 ] }
 set value: { id: 103, value: false, raw: [ 0 ] }
 broadcasted datapoint value:  { id: 103, value: false, raw: [ 0 ] }
 read value: null
 get programming mode: true
 broadcasted datapoint value:  { id: 1, value: 20.6, raw: [ 12, 6 ] }
 broadcasted datapoint value:  { id: 103, value: false, raw: [ 0 ] }
 set programming mode: { id: 15, name: 'ProgrammingMode', value: true }
 broadcasted datapoint value:  { id: 105, value: false, raw: [ 0 ] }
 get parameter byte [ 1, 3, 5, 7 ]
 broadcasted sdk state:  stop
 broadcasted sdk state:  ready
 reset null
 broadcasted datapoint value:  { id: 1, value: 20.6, raw: [ 12, 6 ] }
 ```
