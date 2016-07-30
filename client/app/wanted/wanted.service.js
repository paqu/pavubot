angular.module('inzApp')
    .factory('Wanted', function () {
        var last_id = 5;
        var example_wanted = [
            {_id: 1,
             firstname: 'Pawel',
             surname:'Kusz',
             time:'xxxx-xx-xx xx:xx:xx',
             location_:'xxxx',
             status_:false,
             description: 'Lorem ipsum dolor sit amet'
            },
            {_id: 2,
             firstname: 'Maciej',
             surname:'Sobkowski',
             time:'xxxx-xx-xx xx:xx:xx',
             location_:'xxxx',
             status_:false,
             description: 'Lorem ipsum dolor sit amet'
            },
            {_id: 3,
             firstname: 'Adam',
             surname:'Olek',
             time:'xxxx-xx-xx xx:xx:xx',
             location_:'xxxx',
             status_:false,
             description: 'Lorem ipsum dolor sit amet'
            },
            {_id: 4,
             firstname: 'Wojtek',
             surname:'Jakubowski',
             time:'xxxx-xx-xx xx:xx:xx',
             location_:'xxxx',
             status_:false,
             description: 'Lorem ipsum dolor sit amet'
            },
            {_id: 5,
             firstname: 'Marek',
             surname:'Derkowski',
             time:'xxxx-xx-xx xx:xx:xx',
             location_:'xxxx',
             status_:false,
             description: 'Lorem ipsum dolor sit amet'
            }
        ];
         return {
            query: function(){
                return example_wanted;
            },

            get: function(params){
                var result = {};
                angular.forEach(example_wanted, function (wanted) {
                if(wanted._id == params.id)
                    return this.wanted = wanted;
                    }, result);
                return result.wanted;
            },

            delete: function(params){
                angular.forEach(example_wanted, function (wanted, index) {
                if(wanted._id == params._id){
                    console.log(wanted, index);
                    wanted.splice(index, 1);
                    return;
                    }
                });
            },

            create: function(wanted){
                wanted.id = ++last_id;
                example_wanted.push(wanted);
            },

            update: function(wanted){
                var w = this.get(wanted);
                if(!w) return false;

                w.firstname = wanted.title;
                w.surname = wanted.surname;
                w.time = wanted.time;
                w.location_ = wanted.location_;
                w.status_ = wanted.status_;
                w.description = wanted.description;
                return true
            }
        };
    });
