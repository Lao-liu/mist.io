define('app/views/key', ['app/views/mistscreen', 'app/models/machine', 'text!app/templates/key.html'],
    /**
     *  Single Key View
     * 
     *  @returns Class
     */
    function(MistScreen, Machine, key_html) {
        return MistScreen.extend({

            /**
             * 
             *  Properties
             * 
             */

            key: null,
            associatedMachines: null,
            template: Ember.Handlebars.compile(key_html),

            /**
             * 
             *  Initialization
             * 
             */

            init: function() {
                this._super();
                var that = this;
                Mist.keysController.one('load', function() {
                    var key = Mist.keysController.getRequestedKey();
                    if (key) that.get('controller').set('model', key);
                });
                Mist.backendsController.on('updateMachines', function() {
                    that.renderMachines();
                });
            },


            renderPage: function() {
                
                // Prevents bad rendering from showing up
                $('#single-key-page [data-role="collapsible"]').hide();
                
                // Get key model from controller
                this.set('key', this.get('controller').get('model'));

                // Dummy key doesn't have id
                if (this.key.id) {

                    // Get public key
                    Ember.run.next(this, function() {
                        Mist.keysController.getPublicKey(this.key.name, function(publicKey) {
                             $('#public-key').val(publicKey);
                        });
                    });

                    // Get machines
                    var machineList = [];
                    var backendsCtrl = Mist.backendsController;
                    this.key.machines.forEach(function(key_machine) {

                        var machine = backendsCtrl.getMachineById(key_machine[0], key_machine[1]);

                        // Construct ghost machine
                        if (!machine) {
                            var backend = backendsCtrl.getBackendById(key_machine[0]);
                            machine = Machine.create({
                                id: key_machine[1],
                                name: key_machine[1],
                                state: backend ? 'terminated' : 'unknown',
                                backend: backend ? backend : key_machine[0],
                                isGhost: true,
                            });
                        }
                        machineList.push(machine);
                    });
                    this.set('associatedMachines', machineList);
                    this.renderMachines();
                }
            }.observes('controller.model').on('didInsertElement'),



            /**
             * 
             *  Methods
             * 
             */

            renderMachines: function() {
                Ember.run.next(function() {
                    $('#single-key-page [data-role="collapsible"]').show();
                    if ($('#single-key-page [data-role="collapsible"]').collapsible) {
                        $('#single-key-page [data-role="collapsible"]').collapsible();
                        $('#single-key-page [data-role="collapsible"]').trigger('create');
                    }
                });
            },

            /**
             * 
             *  Actions
             * 
             */

            actions: {

                displayClicked: function() {
                    Mist.keysController.getPrivateKey(this.key.name, function(privateKey) {
                        $('#private-key-popup').popup('open');
                        $('#private-key').val(privateKey);
                    });
                },

                backClicked: function() {
                    $('#private-key-popup').popup('close');
                    $('#private-key').val('');
                },

                renameClicked: function() {
                    $('#rename-key-popup').popup('open');
                    $('#new-key-name').val(this.key.name).trigger('change');
                },

                deleteClicked: function() {
                    var keyName = this.key.name;
                    Mist.confirmationController.set('title', 'Delete key');
                    Mist.confirmationController.set('text', 'Are you sure you want to delete "' + keyName + '" ?');
                    Mist.confirmationController.set('callback', function() {
                        Mist.Router.router.transitionTo('keys');
                        Mist.keysController.deleteKey(keyName);
                    });
                    Mist.confirmationController.show();
                }
            }
        });
    }
);
