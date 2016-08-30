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
             description: 'Lorem ipsum dolor sit amet',
             main_photo:'/subject01.normal',
             other_photos: [

                '/subject01.glasses',
                '/subject01.noglasses',
                '/subject01.rightlight',
                '/subject01.leftlight',
                '/subject01.happy',
                '/subject01.sleepy',
                '/subject01.wink',
                '/subject01.surprised',
             ],
            },
            {_id: 2,
             firstname: 'Maciej',
             surname:'Sobkowski',
             time:'xxxx-xx-xx xx:xx:xx',
             location_:'xxxx',
             status_:false,
             description: 'Lorem ipsum dolor sit amet',
             main_photo:'/subject02.normal',
             other_photos: [

                '/subject02.glasses',
                '/subject02.noglasses',
                '/subject02.rightlight',
                '/subject02.leftlight',
                '/subject02.happy',
                '/subject02.sleepy',
                '/subject02.wink',
                '/subject02.surprised',
             ],
            },
            {_id: 3,
             firstname: 'Adam',
             surname:'Olek',
             time:'xxxx-xx-xx xx:xx:xx',
             location_:'xxxx',
             status_:false,
             description: 'Lorem ipsum dolor sit amet',
             main_photo:'/subject03.normal',
             other_photos: [

                '/subject03.glasses',
                '/subject03.noglasses',
                '/subject03.rightlight',
                '/subject03.leftlight',
                '/subject03.happy',
                '/subject03.sleepy',
                '/subject03.wink',
                '/subject03.surprised',
             ],
            },
            {_id: 4,
             firstname: 'Wojtek',
             surname:'Jakubowski',
             time:'xxxx-xx-xx xx:xx:xx',
             location_:'xxxx',
             status_:false,
             description: 'Lorem ipsum dolor sit amet',
             main_photo:'/subject04.normal',
             other_photos: [

                '/subject04.glasses',
                '/subject04.noglasses',
                '/subject04.rightlight',
                '/subject04.leftlight',
                '/subject04.happy',
                '/subject04.sleepy',
                '/subject04.wink',
                '/subject04.surprised',
             ],
            },
            {_id: 5,
             firstname: 'Marek',
             surname:'Derkowski',
             time:'xxxx-xx-xx xx:xx:xx',
             location_:'xxxx',
             status_:false,
             description: 'Lorem ipsum dolor sit amet',
             main_photo:'/subject05.normal',
             other_photos: [

                '/subject05.glasses',
                '/subject05.noglasses',
                '/subject05.rightlight',
                '/subject05.leftlight',
                '/subject05.happy',
                '/subject05.sleepy',
                '/subject05.wink',
                '/subject05.surprised',
             ],
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
