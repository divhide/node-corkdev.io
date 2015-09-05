#!/usr/bin/env node
"use strict";

var _ = require("lodash"),
    Q = require("q"),
    request = require('request'),
    cheerio = require('cheerio');

/**
 *
 * Get the html from corkdev.io
 *
 * @return {Promise}
 *
 */
var getCorkdevIOEvent = function(){

    var dfd = Q.defer();

    request({
        method: 'GET',
        uri: 'https://api.meetup.com/2/events?offset=0&format=json&limited_events=False&group_id=12225002&photo-host=public&page=20&fields=&order=time&status=past%2Cupcoming&desc=false&sig_id=128666892&sig=0ac44cfbc40e282bd4209de8880da2a9ecfb3ea7',
        json: true,
    }, function(error, response, body){

        if(error){
            dfd.reject(error);
        }
        else{
            var events = body.results;
            dfd.resolve(events[events.length-1]);
        }

    })

    return dfd.promise;

};

/**
 *
 * Show meetup
 *
 * @param  {Object} meetup
 * @return
 *
 */
var showMeetup = function(meetup){

    /// load html from description
    var $ = cheerio.load(meetup.description);

    /// set the description
    var result = _.extend(meetup, {
        description: $("p").map(function(){ return $(this).text(); }).get().join("\n")
    });

    /// show information
    console.log([
        "",
        _.template("<%= venue.address_1 %>, <%= venue.city %>")(result),
        _.template("<%= name %>")(result),
        [ new Date(result.time).getHours(), ":", new Date(result.time).getMinutes() ].join(""),
        "",
        _.template("<%= description %>")(result),
        "",
        _.template("<%= event_url %>")(result),
        ""
    ].join("\n"));

};

/**
 *
 * Main function
 * @return
 *
 */
(function main(){

    Q()
    /// get the corkdevIO event
    .then(getCorkdevIOEvent)
    /// show information
    .then(showMeetup)
    /// error handling
    .catch(function(e){
        console.log(e);
        process.exit(1);
    });

})();




