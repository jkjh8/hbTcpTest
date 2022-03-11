"use strict"
const net = require('net');
let Service, Characteristic

module.exports = function(homebridge){
  Service = homebridge.hap.Service
  Characteristic = homebridge.hap.Characteristic
  homebridge.registerAccessory('homebridge-amx', 'Amx Power', powerSW)
};

function powerSW(log, config, api) {
  this.log = log
  this.config = config
  this.homebridge = api
  this.connected = false
  
  this.socket = net.connect({port:12302, host:"192.168.1.8"})
  this.socket.on('connect', () => {
    this.connected = true
  })
  this.socket.on('data', (data)=> {
    this.log('tcp socket data : ', + data)
  })

  if (this.config.defaultVolume)
        this.defaultVolume = this.config.defaultVolume;
  else
    this.defaultVolume = 10;

  this.log('Volume accessory is Created!');
  this.log('defaultVolume is ' + this.defaultVolume);

  this.bulb = new Service.Switch(this.config.name);
  // Set up Event Handler for bulb on/off
  this.bulb.getCharacteristic(Characteristic.On)
    .on("get", this.getPower.bind(this))
    .on("set", this.setPower.bind(this));
  
  this.log('all event handler was setup.')
}

powerSW.prototype = {
  getServices: function () {
    if (!this.bulb) return [];
    this.log('Homekit asked to report service');
    const infoService =  
      new Service.AccessoryInformation();
    infoService
      .setCharacteristic(Characteristic.Manufacturer,
        'SensMan')
    return [infoService, this.bulb];
  },
  getPower: function(callback) {
    this.log('Home kit ask Power State')
    callback(null, 1)
  },
  setPower: function(on, callback) {
    this.log('Homekit gave new power state '+on)
    this.socket.write(on.toString())
    callback(null)
  }
}