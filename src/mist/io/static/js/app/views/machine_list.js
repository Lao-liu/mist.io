define('app/views/machine_list', ['app/views/mistscreen', 'text!app/templates/machine_list.html', 'ember'],
    /**
     * Machine List View
     *
     * @returns Class
     */
    function(MistScreen, machine_list_html) {
        return MistScreen.extend({

            /**
             * 
             *  Properties
             * 
             */
            
            selectedMachine: null,
            template: Ember.Handlebars.compile(machine_list_html),

            /**
             * 
             *  Observers
             * 
             */

            machinesObserver: function() {
                if (Mist.backendsController.machinesUpdated) {
                    Ember.run.next(function() {
                        if ($('#machine-list-page #machines').listview) {
                            $('#machine-list-page #machines').listview('refresh');
                        }
                        if ($('#machine-list-page #machines input.ember-checkbox').checkboxradio) {
                            $('#machine-list-page #machines input.ember-checkbox').checkboxradio();
                        }
                        Mist.backendsController.set('machinesUpdated', false);
                    });
                }
            }.observes('Mist.backendsController.machinesUpdated').on('didInsertElement'),


            selectedMachinesObserver: function() {
                switch (Mist.backendsController.getSelectedMachinesCount()) {
                    case 0:
                        $('#machine-list-page .ui-footer').hide();
                        break;
                    case 1:
                        $('#machine-list-page .ui-footer').show();
                        $('#machine-list-page .ui-footer a').removeClass('ui-state-disabled');
                        this.set('selectedMachine', Mist.backendsController.getSelectedMachinesId());
                        break;
                    default:
                        $('#machine-list-page .ui-footer').show();
                        $('#machine-list-page .ui-footer a').addClass('ui-state-disabled');
                        break;
                }
            }.observes('Mist.backendsController.selectedMachinesUpdated').on('didInsertElement'),
 

            openTags: function() {
                $("#dialog-tags").popup('option', 'positionTo', '#machines-button-tags').popup('open', {transition: 'slideup'});
            },
    
            openShell: function() {
                $("#dialog-shell").popup('option', 'positionTo', '#machines-button-shell')
                                  .popup('open', {transition: 'slideup'});
                $("#dialog-shell").on('popupafterclose', 
                        function(){
                            $(window).off('resize');
                        }
                );
                
                Ember.run.next(function() {
                    $(window).on('resize', function() {
                        $('#dialog-shell-popup').css({'left':'5%','width':'90%'});
                        $('.shell-return').css({'height': (0.6*$(window).height()) + 'px'});
                        $('.shell-input input').focus();
                        return false;
                    });
                    $(window).trigger('resize');
                });
            },
    
            openActions: function(){
                $("#dialog-power").popup('option', 'positionTo', '#machines-button-power').popup('open', {transition: 'slideup'});
            },
    
            getSelectedMachineCount: function() {
                var count = 0;
                this.content.forEach(function(backend) {
                    count += backend.machines.filterProperty('selected', true).get('length');
                });
                this.set('selectedMachineCount', count);
            },
    
            getSelectedMachine: function() {
                if(this.selectedMachineCount == 1) {
                    var that = this;
                    this.content.forEach(function(item) {
                        var machines = item.machines.filterProperty('selected', true);
                        if(machines.get('length') == 1) {
                           that.set('selectedMachine', machines[0]);
                           return;
                        }
                    });
                } else {
                    this.set('selectedMachine', null);
                }
            },



            /**
             * 
             *  Actions
             * 
             */
    
            actions: {

                createClicked: function() {
                    $('#create-machine-panel').panel('open');
                    $('#create-machine-panel .select-listmenu').listview();
                },

                selectClicked: function() {
                    $('#select-machines-popup').popup('open');
                    $('#select-machines-listmenu').listview('refresh');
                },

                selectionModeClicked: function(mode) {
                    $('#select-machines-popup').popup('close');
                    Mist.backendsController.content.forEach(function(backend) {
                        backend.machines.content.forEach(function(machine) {
                            machine.set('selected', mode == 'all' || mode == backend.title);
                        });
                    });
                    Ember.run.next(function() {
                        $("input[type='checkbox']").checkboxradio('refresh');
                    });
                }
            }
        });
    }
);
