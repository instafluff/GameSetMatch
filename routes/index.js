var express = require('express');
var fs = require('fs');
var request = require('request');
var unfluff = require('unfluff');
var csv = require("fast-csv");
var router = express.Router();
var brain = require("brain.js");

/* GET home page. */
router.get('/', function(req, res, next) {
	let allData = [];
	csv.fromPath("atp_matches_2018.csv", {headers: true})
 .on("data", function(data){
     // console.log(data);
		 allData.push(data);
 })
 .on("end", function(){
     console.log("done");

		 // surface, winner_seed, winner_hand, winner_ht, winner_ioc, winner_age, winner_rank, loser_seed, loser_hand, loser_ht, loser_ioc, loser_age, loser_rank

		 // winner_rank, winner_hand, winner_ht, loser_rank, loser_hand, loser_ht
		 // generate training data
		 var inputData = [];
		 allData.forEach( x => {
			 inputData.push( { input: {
			 r1: x.winner_rank / 10000, r2: x.loser_rank / 10000,
			 h1: x.winner_hand.charCodeAt(0) / 1000, h2: x.loser_hand.charCodeAt(0) / 1000,
		   ht1: x.winner_ht / 1000, ht2: x.loser_ht / 1000 },
		  	output: {
					winner: 1
				}} );
 			 inputData.push( { input: {
	 			 r2: x.winner_rank / 10000, r1: x.loser_rank / 10000,
	 			 h2: x.winner_hand.charCodeAt(0) / 1000, h1: x.loser_hand.charCodeAt(0) / 1000,
	 		   ht2: x.winner_ht / 1000, ht1: x.loser_ht / 1000 },
	 		  	output: {
	 					winner: 0
	 				}} );
		 } );
		 var randomized = inputData.sort( (a, b) => Math.random() - 0.5 );

		 const net = new brain.NeuralNetwork();
		 var output = net.train( randomized.slice( 0, 500 ) );
		 console.log( output );

		 var correct = inputData.map( x => {
			 var prediction = net.run( x.input );
			 return Math.abs( prediction.winner - x.output.winner ) < 0.5 ? 1 : 0;
		 }).filter( x => x > 0 );
		 console.log( "Result: " + correct.length + " of " + inputData.length );
		 console.log( "Accuracy: " + ( correct.length / inputData.length * 100 ).toFixed(2) + '%' );

		 res.render("index", { title: "Tennis Data Analysis",
		 data: allData
	 });
		 // res.send(allData);
 });

	// calculateSentiment( url, ( text, score ) => {
	// 	res.render('index', { title: 'SENTIENT SENTIMENT CALCULATOR FROM THE MATRIX', text: text, score: score.toFixed(2) });
	// })
});

module.exports = router;
