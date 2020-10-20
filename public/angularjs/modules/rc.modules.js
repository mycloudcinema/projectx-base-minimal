/*
 ____                     _
|  _ \ ___ _ __ ___   ___| | __
| |_) / _ \ '_ ` _ \ / _ \ |/ /
|  _ <  __/ | | | | |  __/   <
|_| \_\___|_| |_| |_|\___|_|\_\

  ____                      _ _   _
 / ___|___  _ __  ___ _   _| | |_(_)_ __   __ _
| |   / _ \| '_ \/ __| | | | | __| | '_ \ / _` |
| |__| (_) | | | \__ \ |_| | | |_| | | | | (_| |
 \____\___/|_| |_|___/\__,_|_|\__|_|_| |_|\__, |
                                          |___/

Base Angular Module declaration
*/
(function(ng){

	"use strict";

	ng.module("rc.modules", [])

		// http://stackoverflow.com/questions/17648014/how-can-i-use-an-angularjs-filter-to-format-a-number-to-have-leading-zeros
		// 1e32 is enough for working with 32-bit
		// 1e8 for 8-bit (100000000)
		// in your case 1e4 (aka 10000) should do it
		.filter('numberFixedLen', function () {
			return function(a,b){
				return(1e4+a+"").slice(-b)
			}
		});

})(angular);
