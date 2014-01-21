define('app/models/machine', ['ember'],
    /**
     *  Machine Model
     *
     *  Also check state mapping in config.py
     *  @returns Class
     */
    function() {
        return Ember.Object.extend({

            /**
             *  Properties
             */

            id: null,
            imageId: null,
            name: null,
            backend: null,
            selected: false,
            probed: false,
            probing: false,
            hasMonitoring: false,
            probeInterval: 30000,
            pendingMonitoring: false,
            pendingShell: false,
            pendingAddTag: false,
            pendingDeleteTag: false,
            pendingStats: false,
            pendingCreation: false,
            keysCount: 0,
            state: 'stopped',
            stats: {'cpu': [], 'load': [], 'disk': []},
            graphdata: {},
            
            commandHistory: [],
            
            loadavg: null,
            loadavg1: null,
            loadavg5: null,
            loadavg15: null,
            
            latency: null,
            loss: null,
            
            netled1: function() {
                    if (this.latency < 1000) return 'on'; 
            }.property('latency'),
            
            netled2: function() {
                    if (this.latency < 500) return 'on'; 
            }.property('latency'),
            
            netled3: function() {
                    if (this.latency < 250) return 'on'; 
            }.property('latency'),

            netled4: function() {
                    if (this.latency < 100) return 'on'; 
            }.property('latency'),
                        
            netled4: function() {
                    if (this.latency < 40) return 'on'; 
            }.property('latency'),  

            lossled: function() {
                if (this.loss > 0.5) {
                    return 'high-loss';
                } else if (this.loss > 15 ){
                    return 'low-loss';
                }
            },
                              
            image: function() {
                return this.backend.images.getImage(this.imageId);
            }.property('imageId'),
            
            /**
             * 
             *  Initialization
             * 
             */

            load: function() {
                this.set('commandHistory', []);
                this.probe();
            }.on('init'),

            shutdown: function() {
                Mist.backendsController.shutdownMachine(this.id);
            },


            destroy: function() {
                Mist.backendsController.destroyMachine(this.id);
            },


            reboot: function() {
                Mist.backendsController.rebootMachine(this.id);
            },


            start: function() {
                Mist.backendsController.startMachine(this.id);
            },


            getHost: function() {
               
                if (this.extra && this.extra.dns_name) {
                    // it is an ec2 machine so it has dns_name
                    return this.extra.dns_name;
                } else {
                    // if not ec2 it should have a public ip
                    try {
                        var ips_v4 = [];
                        this.public_ips.forEach(function(ip) {
                            if (ip.search(':') == -1) {
                                // this is not an IPv6, so it is supported
                                ips_v4.push(ip);
                            }
                        });
                        return ips_v4[0];
                    } catch (error) {
                        //Mist.notificationController.notify('No host available for machine ' + this.name);
                        //error('No host available for machine ' + this.name);
                        return null;
                    }
                }
            },

            probe: function(keyId) {
                var that = this;
                // If there are many pending requests, reschedule for a bit later
                if ($.active > 4) {
                    Ember.run.later(function() {
                        that.probe(keyId);
                    }, 1000);
                    return;
                }
                Mist.backendsController.probeMachine(that, keyId, function(success) {
                    if (success) { // Reprobe in 100 seconds on success
                        Ember.run.later(function() {
                            that.probe(keyId);
                        }, 100000);
                    } else {  // Reprobe with double interval on failure
                        Ember.run.later(function() {
                            that.probe(keyId);
                            that.set('probeInterval', that.probeInterval * 2);
                        }, that.probeInterval);
                    }
                });
            }            
        });
    }
);
