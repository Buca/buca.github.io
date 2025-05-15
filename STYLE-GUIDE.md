------------------------------------------

method(somevVar); 			 		NOT-OK
method( someVar ); 			 		OK
------------------------------------------

method( "Bink", "Bonk" );  		NOT-OK
method("Bink", "Bonk") 			OK
------------------------------------------

method(5);		 			 		NOT-OK
method( 5 ); 				 		OK
------------------------------------------

prop1.prop2.prob3.method();  		NOT-OK

propA
.propB
.propC.method();			 		OK
------------------------------------------

for(let i = 0; i < 10; i++)  		NOT-OK
for( let i = 0; i < 10; i ++ )		OK
------------------------------------------

method({number: 23});			   	NOT OK
method({ number: 23 });		 		OK
------------------------------------------

method([123]);						NOT OK
method([ 123 ]);					OK
------------------------------------------

method(["Bink", "Bonk"]});	    NOT OK
method([ "Bink", "Bonk" ]);			OK
------------------------------------------

const obj = {
	bink: "Bonk",
	snirf: "snorf"
};								NOT OK

const obj = {
	
	bink: "Bonk",
	snirf: "snorf"

};								OK
------------------------------------------

function bonk() {
	// Some binking and bonking action here...
	return bink;
};								NOT OK

function bonk() {

	// Some bonking action here...
	return bink;

};								OK
-----------------------------------------

[1, 2, 3, 4]					NOT OK
[ 1, 2, 3, 4 ]					OK
----------------------------------------------------

constructor({bink, bonk, snirf, snorf}) 		NOT OK
constructor({ 
	bink, 
	bonk, 
	snirf, 
	snorf 
})												OK
----------------------------------------------------

if(bink > bonk) 				NOT OK
if( bink > bonk )				OK
----------------------------------------------------

A*(B+C) NOT OK
A*( B + C ) OK
----------------------------------------------------

A+B 			NOT OK
A + B 			OK



