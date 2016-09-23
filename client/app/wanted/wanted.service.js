angular.module('inzApp')
    .factory('Wanted', function () {
        var last_id = 5;
        var example_wanted = [
            {_id: 16,
             firstname: 'Pawel',
             surname:'Kusz',
             time:'xxxx-xx-xx xx:xx:xx',
             location_:'xxxx',
             status_:false,
             description: 'Lorem ipsum dolor sit amet',
             main_photo:'/subject16.normal',
             other_photos: [

                '/subject16.glasses',
                '/subject16.noglasses',
                '/subject16.rightlight',
                '/subject16.leftlight',
                '/subject16.happy',
                '/subject16.sleepy',
                '/subject16.wink',
                '/subject16.surprised',
             ],
            },
            {_id: 17,
             firstname: 'Maciej',
             surname:'Sobkowski',
             time:'xxxx-xx-xx xx:xx:xx',
             location_:'xxxx',
             status_:false,
             description: 'Lorem ipsum dolor sit amet',
             main_photo:'/subject17.normal',
             other_photos: [

                '/subject17.glasses',
                '/subject17.noglasses',
                '/subject17.rightlight',
                '/subject17.leftlight',
                '/subject17.happy',
                '/subject17.sleepy',
                '/subject17.wink',
                '/subject17.surprised',
             ],
            },
            {_id: 3,
             firstname: 'Osoba',
             surname:'Trzy',
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
             firstname: 'Osoba',
             surname:'Cztery',
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
             firstname: 'Osoba',
             surname:'Piec',
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
            },
            {_id: 6,
             firstname: 'Osoba',
             surname:'Szesc',
             time:'xxxx-xx-xx xx:xx:xx',
             location_:'xxxx',
             status_:false,
             description: 'Lorem ipsum dolor sit amet',
             main_photo:'/subject06.normal',
             other_photos: [

                '/subject06.glasses',
                '/subject06.noglasses',
                '/subject06.rightlight',
                '/subject06.leftlight',
                '/subject06.happy',
                '/subject06.sleepy',
                '/subject06.wink',
                '/subject06.surprised',
             ],
            },
            {_id: 7,
             firstname: 'Osoba',
             surname:'Siedem',
             time:'xxxx-xx-xx xx:xx:xx',
             location_:'xxxx',
             status_:false,
             description: 'Lorem ipsum dolor sit amet',
             main_photo:'/subject07.normal',
             other_photos: [

                '/subject07.glasses',
                '/subject07.noglasses',
                '/subject07.rightlight',
                '/subject07.leftlight',
                '/subject07.happy',
                '/subject07.sleepy',
                '/subject07.wink',
                '/subject07.surprised',
             ],
            },
            {_id: 8,
             firstname: 'Osoba',
             surname:'Osiem',
             time:'xxxx-xx-xx xx:xx:xx',
             location_:'xxxx',
             status_:false,
             description: 'Lorem ipsum dolor sit amet',
             main_photo:'/subject08.normal',
             other_photos: [

                '/subject08.glasses',
                '/subject08.noglasses',
                '/subject08.rightlight',
                '/subject08.leftlight',
                '/subject08.happy',
                '/subject08.sleepy',
                '/subject08.wink',
                '/subject08.surprised',
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
