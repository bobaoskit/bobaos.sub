const EE = require("events");
const Redis = require("redis");
const Queue = require("bee-queue");

let BobaosBQ = params => {
  let _params = {
    redis: null,
    request_channel: "bobaos_req",
    service_channel: "bobaos_service",
    broadcast_channel: "bobaos_bcast",
    use_timestamp: true,
    timestamp_key: "bobaos:timestamp"
  };

  let self = new EE();
  Object.assign(_params, params);

  let _redis = Redis.createClient(_params.redis);

  // common request queue
  const jqueue = new Queue(_params.request_channel, {
    redis: _redis,
    isWorker: false
  });
  // service queue
  const squeue = new Queue(_params.service_channel, {
    redis: _redis,
    isWorker: false
  });

  let jobs = [];

  jqueue.on("ready", _ => {
    self.emit("ready");
  });

  const onJobSucceeded = (id, result) => {
    // hack: sometimes this event is fired before job.save.then
    // so, set timeout to be sure that job save then was called
    setTimeout(_ => {
      const findById = t => t.id === id;
      let found = jobs.findIndex(findById);
      if (found > -1) {
        // TODO: resolve/reject
        let { method, payload } = result;
        if (method === "success") {
          jobs[found].callback(null, payload);
        }
        if (method === "error") {
          jobs[found].callback(new Error(payload));
        }
        jobs.splice(found, 1);
      } else {
        // there will be jobs from other clients, so do nothing.
        // console.log(`Couldn't find job with id ${id}`);
      }
    }, 1);
  };
  jqueue.on("job succeeded", onJobSucceeded);
  squeue.on("job succeeded", onJobSucceeded);

  self._request = (queue, method, payload) => {
    return new Promise((resolve, reject) => {
      let job_data = {};
      job_data.method = method;
      job_data.payload = payload;

      const _sendJob = _ => {
        queue
          .createJob(job_data)
          .save()
          .then(job => {
            let { id } = job;
            let callback = (err, result) => {
              if (err) {
                return reject(err);
              }

              resolve(result);
            };
            jobs.push({ id: id, callback: callback });
          })
          .catch(e => {
            reject(e);
          });
      };

      // get timestamp from redis and send with job
      if (_params.use_timestamp) {
        _redis.get(_params.timestamp_key, (err, res) => {
          if (err) {
            return reject(err);
          }

          job_data.timestamp = res;

          return _sendJob();
        });
      } else {
        return _sendJob();
      }
    });
  };
  self.commonRequest = (method, payload) => {
    return self._request(jqueue, method, payload);
  };
  self.serviceRequest = (method, payload) => {
    return self._request(squeue, method, payload);
  };

  // service
  self.ping = _ => {
    return self.serviceRequest("ping", null);
  };
  self.getSdkState = _ => {
    return self.serviceRequest("get sdk state", null);
  };
  self.reset = _ => {
    return self.serviceRequest("reset", null);
  };

  // datapoints
  self.getDescription = payload => {
    return self.commonRequest("get description", payload);
  };
  self.getValue = payload => {
    return self.commonRequest("get value", payload);
  };
  self.getStoredValue = payload => {
    return self.commonRequest("get stored value", payload);
  };
  self.setValue = payload => {
    return self.commonRequest("set value", payload);
  };
  self.readValue = payload => {
    return self.commonRequest("read value", payload);
  };
  self.getServerItem = payload => {
    return self.commonRequest("get server item", payload);
  };
  self.setProgrammingMode = payload => {
    return self.commonRequest("set programming mode", payload);
  };
  self.getProgrammingMode = _ => {
    return self.commonRequest("get programming mode", null);
  };
  self.getParameterByte = payload => {
    return self.commonRequest("get parameter byte", payload);
  };
  self.pollValues = _ => {
    return self.commonRequest("poll values", null);
  };

  // now events
  const redisSub = Redis.createClient(_params.redis);
  redisSub.on("message", (channel, message) => {
    try {
      let { method, payload } = JSON.parse(message);
      if (method === "datapoint value") {
        return self.emit("datapoint value", payload);
      }
      if (method === "server item") {
        return self.emit("server item", payload);
      }
      if (method === "sdk state") {
        return self.emit("sdk state", payload);
      }
    } catch (e) {
      console.log(`Error processing broadcast message: ${e.message}`);
    }
  });

  redisSub.subscribe(_params.broadcast_channel);

  return self;
};

module.exports = BobaosBQ;
